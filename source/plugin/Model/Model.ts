import Observable from 'shared/scripts/Observable/Observable';
import {
  cloneDeep,
  getKeyByValue,
  getClosestNumber,
  isNumeric,
  isNumberArray,
} from 'shared/scripts/utils/utils';

import {
  TPointValue,
  TCurrentPoint,
  IModelProps,
  IModelState,
  IModelData,
} from './ModelTypes';

class Model extends Observable<IModelData> {
  private readonly props: IModelProps;

  private state: IModelState;

  constructor(props: IModelProps) {
    super();
    this.props = cloneDeep(props);
    this.state = {
      selectedPoints: {},
      selectedPointsLimits: {},
    };
    this.initialize();
  }

  public getState(): IModelState {
    return cloneDeep(this.state);
  }

  public getSelectedPoints(): TCurrentPoint[] {
    const selectedPoints = Object.entries(this.state.selectedPoints);
    return selectedPoints.sort(([, point1], [, point2]) => point1[0] - point2[0]);
  }

  public getPointsMap(): [position: string, value: TPointValue][] | never {
    if (this.props.pointsMap) {
      const pointsMap = Object.entries(this.props.pointsMap);
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
      if (this.props.range) {
        this.selectPointByPosition([closestId, positionRatio]);
      } else if (this.props.positionsArray) {
        const closestPosition = getClosestNumber(this.props.positionsArray, positionRatio)
          ?? positionRatio;
        this.selectPointByPosition([closestId, closestPosition]);
      } else {
        throw new Error('Neither "range" nor "pointsMap" is defined');
      }
    } else {
      throw new Error('Could not find the closest selected point');
    }
  }

  public selectPointByPosition([id, positionRatio]: [string, number]): void | never {
    if (this.checkPointLimits([id, positionRatio])) {
      if (this.props.range) {
        const tmpValue = this.getValueByPositionRatio(positionRatio, this.props.range);
        const roundedValue = this.getRoundedByStepValue(tmpValue, this.props.range);
        this.state.selectedPoints[id][1] = roundedValue;
        this.state.selectedPoints[id][0] = this.getPositionRatioByValue(
          roundedValue,
          this.props.range,
        );
      } else if (this.props.pointsMap && this.props.pointsMapPrecision) {
        const fixedPositionRatio = Number(positionRatio.toFixed(this.props.pointsMapPrecision));
        if (typeof this.props.pointsMap[fixedPositionRatio] !== 'undefined') {
          this.state.selectedPoints[id][0] = fixedPositionRatio;
          this.state.selectedPoints[id][1] = this.props.pointsMap[fixedPositionRatio];
        }
      } else {
        throw new Error('Neither "range" nor "pointsMap" is defined');
      }
    }
    this.notifyObservers({ currentPoint: [id, this.state.selectedPoints[id]] });
  }

  public selectPointByValue([id, value]: [string, TPointValue]): void | never {
    let closestValue: TPointValue | undefined;
    let positionRatio: number | undefined;

    if (this.props.range) {
      if (isNumeric(value)) {
        closestValue = this.getRoundedByStepValue(Number(value), this.props.range);
        positionRatio = this.getPositionRatioByValue(closestValue, this.props.range);
      }
    } else if (this.props.pointsMap) {
      if (isNumberArray(this.props.valuesArray)) {
        closestValue = isNumeric(value) ? getClosestNumber(this.props.valuesArray, Number(value))
          : undefined;
      } else {
        closestValue = isNumeric(value) ? Number(value) : value;
      }
      if (typeof closestValue !== 'undefined') {
        positionRatio = Number(getKeyByValue(this.props.pointsMap, closestValue));
      }
    } else {
      throw new Error('Neither "range" nor "pointsMap" is defined');
    }
    // eslint-disable-next-line fsd/split-conditionals
    if (typeof closestValue !== 'undefined' && typeof positionRatio !== 'undefined'
    && !Number.isNaN(positionRatio)) {
      if (this.checkPointLimits([id, positionRatio])) {
        this.state.selectedPoints[id][0] = positionRatio;
        this.state.selectedPoints[id][1] = closestValue;
      } else if (this.state.selectedPointsLimits[id]) {
        const { min, max } = this.state.selectedPointsLimits[id];
        this.state.selectedPoints[id][0] = getClosestNumber([min, max], positionRatio) ?? min;
        if (this.props.range) {
          const tmpValue = this.getValueByPositionRatio(
            this.state.selectedPoints[id][0],
            this.props.range,
          );
          this.state.selectedPoints[id][1] = this.getRoundedByStepValue(tmpValue, this.props.range);
        } else if (this.props.pointsMap) {
          this.state.selectedPoints[id][1] = this.props.pointsMap[this.state.selectedPoints[id][0]];
        } else {
          throw new Error('Neither "range" nor "pointsMap" is defined');
        }
      }
    }
    this.notifyObservers({ currentPoint: [id, this.state.selectedPoints[id]] });
  }

  public selectPointLimits(id: string): void {
    if (this.props.collideKnobs) {
      const selectedPoints = this.getSelectedPoints();
      const selectedIndex = selectedPoints.findIndex(([pointId]) => pointId === id);
      let min = 0; let newMin = min;
      let max = 1; let newMax = max;

      if (selectedPoints[selectedIndex - 1]) {
        min = Number(selectedPoints[selectedIndex - 1][1][0]);
        if (this.props.range?.positionStep) {
          newMin = min + this.props.range.positionStep;
        } else if (this.props.positionsArray) {
          newMin = this.props.positionsArray[this.props.positionsArray.indexOf(min) + 1];
        }
      }
      if (selectedPoints[selectedIndex + 1]) {
        max = Number(selectedPoints[selectedIndex + 1][1][0]);
        if (this.props.range?.positionStep) {
          newMax = max - this.props.range.positionStep;
        } else if (this.props.positionsArray) {
          newMax = this.props.positionsArray[this.props.positionsArray.indexOf(max) - 1];
        }
      }
      this.state.selectedPointsLimits[id] = { min: newMin, max: newMax };
      this.notifyObservers({ currentPointLimits: [id, { min, max }] });
    }
  }

  private initialize(): void | never {
    if (this.props.valuesArray || this.props.pointsMap) {
      delete this.props.range;
    }
    if (this.props.range) {
      this.generateValuesArrayFromRange(this.props.range);
    }
    if (this.props.valuesArray) {
      this.generatePointsMapFromArray(this.props.valuesArray);
    } else if (this.props.pointsMap) {
      this.activatePointsMap();
    } else {
      throw new Error('Neither "range" nor "valuesArray" nor "pointsMap" is defined');
    }

    const selectedValues = Object.entries(this.props.initialSelectedValues);
    selectedValues.forEach(([id, value]) => {
      this.state.selectedPoints[id] = [0, value];
      this.selectPointByValue([id, value]);
    });
    const selectedPoints = this.getSelectedPoints();
    selectedPoints.forEach(([id, point]) => {
      this.selectPointLimits(id);
      this.selectPointByValue([id, point[1]]);
    });
  }

  private generateValuesArrayFromRange(
    { min, max, step }: { min: number; max: number; step: number },
  ): void {
    if (this.props.range) {
      const pointsNumber = Math.ceil((max - min) / step);
      const maxPointsNumber = 100;
      let visiblePointsNumber = pointsNumber;
      let visibleStep = step;
      this.props.range.positionStep = 1 / pointsNumber;
      this.props.valuesArray = [] as number[];

      if (pointsNumber > maxPointsNumber) {
        visiblePointsNumber = Math.round(pointsNumber / Math.round(pointsNumber / maxPointsNumber));
        visibleStep = step * Math.round(pointsNumber / visiblePointsNumber);
      }
      for (let index = 0; index < visiblePointsNumber; index += 1) {
        const point = index * visibleStep + min;
        this.props.valuesArray.push(Number(point.toFixed(this.props.valuesPrecision)));
      }
      this.props.valuesArray.push(Number(max.toFixed(this.props.valuesPrecision)));
    }
  }

  private generatePointsMapFromArray(array: number[] | string[]): void {
    const pointsNumber = array.length;
    let valuesArray = array;
    let min = 0;
    let max = pointsNumber - 1;
    this.props.pointsMap = {};

    if (isNumberArray(array)) {
      valuesArray = array.sort((value1, value2) => value1 - value2);
      // eslint-disable-next-line prefer-destructuring
      min = valuesArray[0];
      max = valuesArray[pointsNumber - 1];
    }
    if (this.props.range) {
      this.props.pointsMapPrecision = 6;
    } else {
      this.calculatePointsMapPrecision(pointsNumber);
    }

    valuesArray.forEach((value: number | string, index: number) => {
      if (this.props.pointsMap) {
        if (typeof value === 'number') {
          const positionRatio = Number(this.getPositionRatioByValue(value, { min, max })
            .toFixed(this.props.pointsMapPrecision));
          this.props.pointsMap[positionRatio] = Number(value.toFixed(this.props.valuesPrecision));
        } else if (typeof value === 'string') {
          const positionRatio = Number(this.getPositionRatioByValue(index, { min, max })
            .toFixed(this.props.pointsMapPrecision));
          this.props.pointsMap[positionRatio] = value;
        }
      }
    });
    this.generatePositionsArray();
  }

  private activatePointsMap(): void {
    if (this.props.pointsMap) {
      const pointsMap = Object.entries(this.props.pointsMap);
      const pointsNumber = pointsMap.length;
      pointsMap.forEach(([positionRatio]) => {
        const numPositionRatio = Number(positionRatio);
        if (numPositionRatio < 0 || numPositionRatio > 1) {
          delete this.props.pointsMap?.[numPositionRatio];
        }
      });
      this.calculatePointsMapPrecision(pointsNumber);
      this.generatePositionsArray();
    }
  }

  private calculatePointsMapPrecision(pointsNumber: number): void {
    this.props.pointsMapPrecision = pointsNumber <= 10 ? 2 : Math.ceil(Math.log10(pointsNumber));
  }

  private generatePositionsArray(): void {
    if (this.props.pointsMap) {
      this.props.positionsArray = Object.keys(this.props.pointsMap)
        .map((position) => Number(position)).sort((position1, position2) => position1 - position2);
    }
  }

  private getPositionRatioByValue(
    value: number,
    { min, max }: { min: number; max: number },
  ): number {
    const positionRatio = Number(((value - min) / (max - min)).toFixed(this.props.valuesPrecision));
    return positionRatio;
  }

  private getValueByPositionRatio(
    positionRatio: number,
    { min, max }: { min: number; max: number },
  ): number {
    const value = Number(((max - min) * positionRatio + min).toFixed(this.props.valuesPrecision));
    return value;
  }

  private getRoundedByStepValue(
    value: number,
    { min, max, step }: { min: number; max: number; step: number },
  ): number {
    const roundedValue = Number((Math.round((value - min) / step) * step + min)
      .toFixed(this.props.valuesPrecision));
    if (roundedValue < min) {
      return min;
    }
    if (roundedValue > max) {
      return max;
    }
    return roundedValue;
  }

  private checkPointLimits([id, positionRatio]: [string, number]): boolean {
    if (this.state.selectedPointsLimits[id]) {
      const { min, max } = this.state.selectedPointsLimits[id];
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
