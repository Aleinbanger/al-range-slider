import {
  getKeyByValue,
  getClosestNumber,
  isNumeric,
  isNumberArray,
} from 'shared/scripts/utils';

import Observable from '../Observable/Observable';
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

  constructor() {
    super();
    this.props = {
      type: 'single',
      showInputs: true,
      showGrid: false,
      showTooltips: false,
      valuesPrecision: 6,
      range: {
        min: -100,
        max: 101,
        step: 1.17,
      },
      // valuesArray: [0, 1, 13, 34, 55, 13, 53, 66, 87, 200, 100],
      // valuesArray: ['qwe', 'asd', 'zxc', 'qaz', 'wsx', 'edc'],
    };

    this.state = {
      selectedPoints: {
        from: [0, 0],
        to: [0, 20],
        asdo: [0, 30],
      },
      selectedPointsLimits: {},
    };

    this.initialize();
  }

  public getState(): IModelState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public getSelectedPoints(): TCurrentPoint[] {
    const entries = Object.entries(this.state.selectedPoints);
    return entries.sort((a, b) => a[1][0] - b[1][0]);
  }

  public getPointsMap(): [position: string, value: TPointValue][] | never {
    if (this.props.pointsMap) {
      const entries = Object.entries(this.props.pointsMap);
      return entries.sort((a, b) => Number(a[0]) - Number(b[0]));
    }
    throw new Error('"pointsMap" is not defined');
  }

  public selectPointByUnknownPosition(positionRatio: number): void | never {
    const selectedPoints = this.getSelectedPoints();
    const selectedPositions = selectedPoints.map(([, point]) => point[0]);
    const selectedPointClosest = selectedPoints
      .find(([, point]) => point[0] === getClosestNumber(positionRatio, selectedPositions));
    if (selectedPointClosest) {
      const idClosest = selectedPointClosest[0];
      this.selectPointLimits(idClosest);
      if (this.props.range) {
        this.selectPointByPosition([idClosest, positionRatio]);
      } else if (this.props.positionsArray) {
        const positionClosest = getClosestNumber(positionRatio, this.props.positionsArray)
          ?? positionRatio;
        this.selectPointByPosition([idClosest, positionClosest]);
      } else {
        throw new Error('Neither "range", nor "pointsMap" is defined');
      }
    } else {
      throw new Error('Could not find the closest selected point');
    }
  }

  public selectPointByPosition([id, positionRatio]: [string, number]): void | never {
    if (positionRatio < 0 || positionRatio > 1) {
      throw new Error('Invalid "positionRatio" value, must be in between 0 and 1');
    }
    if (this.checkPointLimits([id, positionRatio])) {
      if (this.props.range) {
        this.state.selectedPoints[id][1] = this.getRoundedValueByStep(
          this.getValueByPositionRatio(positionRatio, this.props.range),
          this.props.range,
        );
        this.state.selectedPoints[id][0] = this.getPositionRatioByValue(
          Number(this.state.selectedPoints[id][1]),
          this.props.range,
        );
      } else if (this.props.pointsMap && this.props.pointsMapPrecision) {
        const positionRatioFixed = Number(positionRatio.toFixed(this.props.pointsMapPrecision));
        if (typeof this.props.pointsMap[positionRatioFixed] !== 'undefined') {
          this.state.selectedPoints[id][0] = positionRatioFixed;
          this.state.selectedPoints[id][1] = this.props.pointsMap[positionRatioFixed];
        }
      } else {
        throw new Error('Neither "range", nor "pointsMap" is defined');
      }
    }
    this.notifyObservers({ currentPoint: [id, this.state.selectedPoints[id]] });
  }

  public selectPointByValue([id, value]: [string, TPointValue]): void | never {
    let valueClosest: TPointValue | undefined;
    let positionRatio: number | undefined;

    if (this.props.range) {
      if (isNumeric(value)) {
        valueClosest = this.getRoundedValueByStep(Number(value), this.props.range);
        positionRatio = this.getPositionRatioByValue(valueClosest, this.props.range);
      }
    } else if (this.props.pointsMap) {
      if (isNumberArray(this.props.valuesArray)) {
        if (isNumeric(value)) {
          valueClosest = getClosestNumber(Number(value), this.props.valuesArray);
        }
      } else {
        valueClosest = value;
      }
      if (typeof valueClosest !== 'undefined') {
        positionRatio = Number(getKeyByValue(this.props.pointsMap, valueClosest));
      }
    } else {
      throw new Error('Neither "range", nor "pointsMap" is defined');
    }

    // eslint-disable-next-line fsd/split-conditionals
    if (typeof valueClosest !== 'undefined' && typeof positionRatio !== 'undefined' && !Number.isNaN(positionRatio)) {
      if (this.checkPointLimits([id, positionRatio])) {
        this.state.selectedPoints[id][0] = positionRatio;
        this.state.selectedPoints[id][1] = valueClosest;
      } else if (this.state.selectedPointsLimits) {
        const { min, max } = this.state.selectedPointsLimits[id];
        this.state.selectedPoints[id][0] = getClosestNumber(positionRatio, [min, max]) ?? min;
        if (this.props.range) {
          this.state.selectedPoints[id][1] = this.getRoundedValueByStep(
            this.getValueByPositionRatio(this.state.selectedPoints[id][0], this.props.range),
            this.props.range,
          );
        } else if (this.props.pointsMap) {
          this.state.selectedPoints[id][1] = this.props.pointsMap[this.state.selectedPoints[id][0]];
        } else {
          throw new Error('Neither "range", nor "pointsMap" is defined');
        }
      } else {
        throw new Error('"selectedPointsLimits" is not defined');
      }
    }
    this.notifyObservers({ currentPoint: [id, this.state.selectedPoints[id]] });
  }

  public selectPointLimits(id: string): void {
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
    if (this.state.selectedPointsLimits) {
      // if (!allowSameSelection)
      this.state.selectedPointsLimits[id] = { min: newMin, max: newMax };
    } else {
      throw new Error('"selectedPointsLimits" is not defined');
    }
    this.notifyObservers({ currentPointLimits: [id, { min, max }] });
    console.log({ id, newMin, newMax });
  }

  private initialize(): void {
    if (this.props.range) {
      this.generateValuesArrayFromRange(this.props.range);
    }
    if (this.props.valuesArray) {
      this.generatePointsMapFromArray(this.props.valuesArray);
    } else {
      throw new Error('Neither "range", nor "valuesArray" is defined');
    }
  }

  private generateValuesArrayFromRange(
    { min, max, step }: { min: number; max: number; step: number },
  ): void {
    if (this.props.range) {
      const pointsNumber = Math.ceil((max - min) / step);
      this.props.range.positionStep = 1 / pointsNumber;
      this.props.valuesArray = [] as number[];

      const maxPointsNumber = 100;
      let visiblePointsNumber = pointsNumber;
      let visibleStep = step;
      if (pointsNumber > maxPointsNumber) {
        visiblePointsNumber = Math.round(pointsNumber / Math.round(pointsNumber / maxPointsNumber));
        visibleStep = step * Math.round(pointsNumber / visiblePointsNumber);
      }
      for (let index = 0; index < visiblePointsNumber; index += 1) {
        const point = index * visibleStep + min;
        this.props.valuesArray.push(Number(point.toFixed(this.props.valuesPrecision)));
      }
      this.props.valuesArray.push(Number(max.toFixed(this.props.valuesPrecision)));
      console.log({ pointsNumber, visiblePointsNumber, visibleStep });
    }
  }

  private generatePointsMapFromArray(array: number[] | string[]): void {
    const pointsNumber = array.length;
    let valuesArray = array;
    let min = 0;
    let max = pointsNumber - 1;
    if (isNumberArray(array)) {
      valuesArray = array.sort((a, b) => a - b);
      // eslint-disable-next-line prefer-destructuring
      min = valuesArray[0];
      max = valuesArray[pointsNumber - 1];
    }
    this.props.pointsMap = {};
    if (this.props.range) {
      this.props.pointsMapPrecision = 6;
    } else {
      this.props.pointsMapPrecision = pointsNumber <= 10 ? 2 : Math.ceil(Math.log10(pointsNumber));
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
    this.props.positionsArray = Object.keys(this.props.pointsMap).map((key) => Number(key))
      .sort((a, b) => a - b);

    console.log(this.props.pointsMap);
    console.log('pointsMapPrecision', this.props.pointsMapPrecision);
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

  private getRoundedValueByStep(
    value: number,
    { min, max, step }: { min: number; max: number; step: number },
  ): number {
    const roundedValue = Number((Math.round((value - min) / step) * step + min)
      .toFixed(this.props.valuesPrecision));
    if (value <= min) {
      return min;
    }
    if (value >= max) {
      return max;
    }
    return roundedValue;
  }

  private checkPointLimits([id, positionRatio]: [string, number]): boolean {
    if (this.state.selectedPointsLimits && this.state.selectedPointsLimits[id]) {
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

export default Model;
