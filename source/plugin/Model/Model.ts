import Observable from 'shared/scripts/Observable/Observable';
import {
  cloneDeep,
  getKeyByValue,
  getClosestNumber,
  isNumeric,
  isNumberArray,
  filterObject,
} from 'shared/scripts/utils/utils';

import {
  TPointValue,
  TCurrentPoint,
  IModelProps,
  IModelState,
  IModelData,
} from './ModelTypes';

class Model extends Observable<IModelData> {
  readonly #props: IModelProps;

  #state: IModelState;

  constructor(props: IModelProps) {
    super();
    this.#props = cloneDeep(props);
    this.#state = {
      selectedPoints: {},
      selectedPointsLimits: {},
    };
    this.#initialize();
  }

  public getState(): IModelState {
    return cloneDeep(this.#state);
  }

  public getSelectedPoints(): TCurrentPoint[] {
    const selectedPoints = Object.entries(this.#state.selectedPoints);
    return selectedPoints.sort(([, point1], [, point2]) => point1[0] - point2[0]);
  }

  public getPointsMap(): [position: string, value: TPointValue][] | never {
    if (this.#props.pointsMap) {
      const pointsMap = Object.entries(this.#props.pointsMap);
      return pointsMap.sort((point1, point2) => Number(point1[0]) - Number(point2[0]));
    }
    throw new Error('"pointsMap" is not defined');
  }

  public selectPointByUnknownPosition(positionRatio: number): void | never {
    const selectedPoints = this.getSelectedPoints();
    const selectedPositions = selectedPoints.map(([, point]) => point[0]);
    const closestSelectedPoint = selectedPoints
      .find(([, point]) => point[0] === getClosestNumber(selectedPositions, positionRatio));
    if (closestSelectedPoint) {
      const closestId = closestSelectedPoint[0];
      this.selectPointLimits(closestId);
      this.selectPointByPosition([closestId, positionRatio]);
    } else {
      throw new Error('Could not find the closest selected point');
    }
  }

  public selectPointByPosition([id, positionRatio]: [string, number]): void | never {
    const { range, pointsMap, positionsArray } = this.#props;
    const isPointsMapDefined = pointsMap && positionsArray;
    if (range) {
      if (this.#checkPointLimits([id, positionRatio])) {
        const tmpValue = this.#getValueByPositionRatio(positionRatio, range);
        const roundedValue = this.#getRoundedByStepValue(tmpValue, range);
        this.#state.selectedPoints[id][1] = roundedValue;
        this.#state.selectedPoints[id][0] = this.#getPositionRatioByValue(
          roundedValue,
          range,
        );
      }
    } else if (isPointsMapDefined) {
      const closestPosition = getClosestNumber(positionsArray, positionRatio)
        ?? positionRatio;
      if (this.#checkPointLimits([id, closestPosition])) {
        this.#state.selectedPoints[id][0] = closestPosition;
        this.#state.selectedPoints[id][1] = pointsMap[closestPosition];
      }
    } else {
      throw new Error('Neither "range" nor "pointsMap" is defined');
    }
    this.notifyObservers({ currentPoint: [id, this.#state.selectedPoints[id]] });
  }

  public selectPointByValue([id, value]: [string, TPointValue]): void | never {
    const { closestValue, positionRatio } = this.#getClosestValueAndPosition(value);
    const isPointValid = typeof closestValue !== 'undefined' && typeof positionRatio !== 'undefined'
      && !Number.isNaN(positionRatio);
    if (isPointValid) {
      if (this.#checkPointLimits([id, positionRatio])) {
        this.#state.selectedPoints[id][0] = positionRatio;
        this.#state.selectedPoints[id][1] = closestValue;
      } else if (this.#state.selectedPointsLimits[id]) {
        const { min, max } = this.#state.selectedPointsLimits[id];
        this.#state.selectedPoints[id][0] = getClosestNumber([min, max], positionRatio) ?? min;
        if (this.#props.range) {
          const tmpValue = this.#getValueByPositionRatio(
            this.#state.selectedPoints[id][0],
            this.#props.range,
          );
          this.#state.selectedPoints[id][1] = this.#getRoundedByStepValue(
            tmpValue,
            this.#props.range,
          );
        } else if (this.#props.pointsMap) {
          const tmpPositionRatio = this.#state.selectedPoints[id][0];
          this.#state.selectedPoints[id][1] = this.#props.pointsMap[tmpPositionRatio];
        } else {
          throw new Error('Neither "range" nor "pointsMap" is defined');
        }
      }
    }
    this.notifyObservers({ currentPoint: [id, this.#state.selectedPoints[id]] });
  }

  public selectPointLimits(id: string): void {
    if (this.#props.collideKnobs) {
      const selectedPoints = this.getSelectedPoints();
      const currentIndex = selectedPoints.findIndex(([pointId]) => pointId === id);
      const {
        newMin, newMax, min, max,
      } = this.#getMinMaxPositions(selectedPoints, currentIndex);
      this.#state.selectedPointsLimits[id] = { min: newMin, max: newMax };
      this.notifyObservers({ currentPointLimits: [id, { min, max }] });
    }
  }

  #initialize(): void | never {
    this.#validateProps();
    if (this.#props.range) {
      this.#generateValuesArrayFromRange();
    }
    if (this.#props.valuesArray) {
      this.#generatePointsMapFromArray();
    } else if (this.#props.pointsMap) {
      this.#generatePositionsArray();
    } else {
      throw new Error('Neither "range" nor "valuesArray" nor "pointsMap" is defined');
    }

    const selectedValues = Object.entries(this.#props.initialSelectedValues);
    selectedValues.forEach(([id, value]) => {
      this.#state.selectedPoints[id] = [0, value];
      this.selectPointByValue([id, value]);
    });
    const selectedPoints = this.getSelectedPoints();
    selectedPoints.forEach(([id, point]) => {
      this.selectPointLimits(id);
      this.selectPointByValue([id, point[1]]);
    });
    if (typeof this.#props.onInit === 'function') {
      this.#props.onInit.call(this, this.getState(), cloneDeep(this.#props));
    }
  }

  #validateProps(): void {
    const isRangeRedundant = this.#props.valuesArray || this.#props.pointsMap;
    if (isRangeRedundant) {
      delete this.#props.range;
    }
    if (this.#props.range) {
      const { min, max, step } = this.#props.range;
      const minStep = 1 / 10 ** this.#props.valuesPrecision;
      if (min > max) {
        this.#props.range.min = max;
        this.#props.range.max = min;
      } else if (min === max) {
        this.#props.range.max = min + minStep;
      }
      const rangeDifference = Number((this.#props.range.max - this.#props.range.min)
        .toFixed(this.#props.valuesPrecision));
      if (step > rangeDifference) {
        this.#props.range.step = rangeDifference;
      }
      if (this.#props.range.step <= 0) {
        this.#props.range.step = minStep;
      }
    }
    if (this.#props.valuesArray) {
      if (!isNumberArray(this.#props.valuesArray)) {
        this.#props.valuesArray = this.#props.valuesArray.map((value) => String(value).trim())
          .filter((value) => Boolean(value));
      }
    } else if (this.#props.pointsMap) {
      const validatePositionRatio = (positionRatio: string) => {
        const numPosition = Number(positionRatio);
        const isPositionValid = !(Number.isNaN(numPosition) || numPosition < 0 || numPosition > 1);
        return isPositionValid;
      };
      this.#props.pointsMap = filterObject(this.#props.pointsMap,
        ([position]) => validatePositionRatio(position));
    }
    const {
      initialSelectedValues, range, valuesArray, pointsMap,
    } = this.#props;
    Object.entries(initialSelectedValues).forEach(([id, value]) => {
      const isInitRangeValueInvalid = range && !isNumeric(value);
      const isInitArrayValueInvalid = valuesArray && !valuesArray.includes(value as never);
      const isInitMapValueInvalid = pointsMap && !Object.values(pointsMap).includes(value);
      if (isInitRangeValueInvalid) {
        initialSelectedValues[id] = range.min;
      } else if (isInitArrayValueInvalid) {
        [initialSelectedValues[id]] = valuesArray;
      } else if (isInitMapValueInvalid) {
        [initialSelectedValues[id]] = Object.values(pointsMap);
      }
    });
  }

  #generateValuesArrayFromRange(): void {
    if (this.#props.range) {
      const { min, max, step } = this.#props.range;
      const pointsNumber = Math.round((max - min) / step);
      const maxPointsNumber = 100;
      const visiblePointsNumber = pointsNumber > maxPointsNumber
        ? Math.round(pointsNumber / Math.round(pointsNumber / maxPointsNumber))
        : pointsNumber;
      const visibleStep = pointsNumber > maxPointsNumber
        ? step * Math.round(pointsNumber / visiblePointsNumber)
        : step;
      this.#props.range.positionStep = 1 / pointsNumber;
      this.#props.valuesArray = [] as number[];

      for (let index = 0; index < visiblePointsNumber; index += 1) {
        const point = index * visibleStep + min;
        this.#props.valuesArray.push(Number(point.toFixed(this.#props.valuesPrecision)));
      }
      this.#props.valuesArray.push(Number(max.toFixed(this.#props.valuesPrecision)));
    }
  }

  #generatePointsMapFromArray(): void {
    if (this.#props.valuesArray) {
      const { valuesArray } = this.#props;
      const pointsNumber = valuesArray.length;
      let min = 0;
      let max = pointsNumber - 1;
      this.#props.pointsMapPrecision = 6;
      this.#props.pointsMap = {};

      if (isNumberArray(valuesArray)) {
        valuesArray.sort((value1, value2) => value1 - value2);
        // eslint-disable-next-line prefer-destructuring
        min = valuesArray[0];
        max = valuesArray[pointsNumber - 1];
      }
      valuesArray.forEach((value: number | string, index: number) => {
        if (this.#props.pointsMap) {
          if (typeof value === 'number') {
            const positionRatio = Number(this.#getPositionRatioByValue(value, { min, max })
              .toFixed(this.#props.pointsMapPrecision));
            this.#props.pointsMap[positionRatio] = Number(value
              .toFixed(this.#props.valuesPrecision));
          } else if (typeof value === 'string') {
            const positionRatio = Number(this.#getPositionRatioByValue(index, { min, max })
              .toFixed(this.#props.pointsMapPrecision));
            this.#props.pointsMap[positionRatio] = value;
          }
        }
      });
      this.#generatePositionsArray();
    }
  }

  #generatePositionsArray(): void {
    if (this.#props.pointsMap) {
      this.#props.positionsArray = Object.keys(this.#props.pointsMap)
        .map((position) => Number(position)).sort((position1, position2) => position1 - position2);
    }
  }

  #getMinMaxPositions(selectedPoints: TCurrentPoint[], currentIndex: number): {
    min: number; max: number; newMin: number; newMax: number;
  } {
    let min = 0; let newMin = min;
    let max = 1; let newMax = max;
    if (selectedPoints[currentIndex - 1]) {
      min = Number(selectedPoints[currentIndex - 1][1][0]);
      if (this.#props.range?.positionStep) {
        newMin = min + this.#props.range.positionStep;
      } else if (this.#props.positionsArray) {
        newMin = this.#props.positionsArray[this.#props.positionsArray.indexOf(min) + 1];
      }
    }
    if (selectedPoints[currentIndex + 1]) {
      max = Number(selectedPoints[currentIndex + 1][1][0]);
      if (this.#props.range?.positionStep) {
        newMax = max - this.#props.range.positionStep;
      } else if (this.#props.positionsArray) {
        newMax = this.#props.positionsArray[this.#props.positionsArray.indexOf(max) - 1];
      }
    }
    return {
      min, max, newMin, newMax,
    };
  }

  #getClosestValueAndPosition(value: TPointValue): {
    closestValue: TPointValue | undefined; positionRatio: number | undefined;
  } {
    let closestValue: TPointValue | undefined;
    let positionRatio: number | undefined;
    if (this.#props.range) {
      if (isNumeric(value)) {
        closestValue = this.#getRoundedByStepValue(Number(value), this.#props.range);
        positionRatio = this.#getPositionRatioByValue(closestValue, this.#props.range);
      }
    } else if (this.#props.pointsMap) {
      if (isNumberArray(this.#props.valuesArray)) {
        closestValue = isNumeric(value) ? getClosestNumber(this.#props.valuesArray, Number(value))
          : undefined;
      } else {
        closestValue = isNumeric(value) ? Number(value) : value;
      }
      if (typeof closestValue !== 'undefined') {
        positionRatio = Number(getKeyByValue(this.#props.pointsMap, closestValue));
      }
    } else {
      throw new Error('Neither "range" nor "pointsMap" is defined');
    }
    return { closestValue, positionRatio };
  }

  #getPositionRatioByValue(
    value: number,
    { min, max }: { min: number; max: number },
  ): number {
    const positionRatio = Number(((value - min) / (max - min))
      .toFixed(this.#props.valuesPrecision));
    return positionRatio;
  }

  #getValueByPositionRatio(
    positionRatio: number,
    { min, max }: { min: number; max: number },
  ): number {
    const value = Number(((max - min) * positionRatio + min).toFixed(this.#props.valuesPrecision));
    return value;
  }

  #getRoundedByStepValue(
    value: number,
    { min, max, step }: { min: number; max: number; step: number },
  ): number {
    const roundedValue = Number((Math.round((value - min) / step) * step + min)
      .toFixed(this.#props.valuesPrecision));
    if (roundedValue < min) {
      return min;
    }
    if (roundedValue > max) {
      return max;
    }
    return roundedValue;
  }

  #checkPointLimits([id, positionRatio]: [string, number]): boolean {
    if (this.#state.selectedPointsLimits[id]) {
      const { min, max } = this.#state.selectedPointsLimits[id];
      const isInsideLimits = positionRatio >= min && positionRatio <= max;
      if (isInsideLimits) {
        return true;
      }
      return false;
    }
    return true;
  }
}

export type { IModelProps, IModelState, IModelData };
export default Model;
