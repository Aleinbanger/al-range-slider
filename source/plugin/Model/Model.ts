import {
  getKeyByValue,
  getClosestNumber,
  isNumeric,
  isNumberArray,
  isStringArray,
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
      orientation: 'horizontal',
      showInputs: true,
      showGrid: false,
      showTooltips: false,
      range: {
        min: -100,
        max: 100,
        step: 1,
      },
    };

    this.state = {
      selectedPoints: {
        from: [0, 0],
        to: [0, 20],
        asdo: [0, 40],
      },
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

  // pointsMap
  public selectPointByPosition([id, positionRatio]: [string, number]): void | never {
    if (positionRatio < 0 || positionRatio > 1) {
      throw new Error('Invalid "positionRatio" value, must be in between 0 and 1');
    }

    if (this.props.pointsMap && this.props.pointsMapPrecision) {
      const positionRatioFixed = Number(positionRatio.toFixed(this.props.pointsMapPrecision));
      if (typeof this.props.pointsMap[positionRatioFixed] !== 'undefined') {
        if (this.checkPointLimits([id, positionRatio])) {
          this.state.selectedPoints[id][0] = positionRatioFixed;
          this.state.selectedPoints[id][1] = this.props.pointsMap[positionRatioFixed];
        }
        this.notifyObservers({ currentPoint: [id, this.state.selectedPoints[id]] });
      }
    } else {
      throw new Error('"pointsMap" is not defined'); // add methods w/o pointsMap
    }
  }

  // pointsMap
  public selectPointByValue([id, value]: [string, TPointValue]): void | never {
    let valueClosest: TPointValue | undefined;
    if (isNumeric(value) && isNumberArray(this.props.valuesArray)) {
      valueClosest = getClosestNumber(Number(value), this.props.valuesArray);
    } else {
      valueClosest = value; // improve // add methods w/o pointsArray
    }
    if (typeof valueClosest !== 'undefined') {
      this.state.selectedPoints[id][1] = valueClosest;
    } else {
      throw new Error('Could not find the closest value in "valuesArray"');
    }

    // add methods for string[]

    if (this.props.pointsMap) {
      const positionRatio = getKeyByValue(
        this.props.pointsMap,
        this.state.selectedPoints[id][1],
      );
      if (typeof positionRatio !== 'undefined') {
        if (this.checkPointLimits([id, Number(positionRatio)])) {
          this.state.selectedPoints[id][0] = Number(positionRatio);
        } else if (this.state.selectedPointsLimits) {
          const { min, max } = this.state.selectedPointsLimits[id];
          this.state.selectedPoints[id][0] = getClosestNumber(Number(positionRatio), [min, max])
            ?? min;
          this.state.selectedPoints[id][1] = this.props.pointsMap[this.state.selectedPoints[id][0]];
        } else {
          throw new Error('"selectedPointsLimits" is not defined');
        }

        this.notifyObservers({ currentPoint: [id, this.state.selectedPoints[id]] });
        // move to the bottom
      }
    } else {
      throw new Error('"pointsMap" is not defined'); // add methods w/o pointsMap
    }

    // will also be used for setting position from input
  }

  public selectPointLimits(selectedId: string): void {
    const selectedPoints = this.getSelectedPoints();
    const selectedIndex = selectedPoints.findIndex(([id]) => id === selectedId);
    let positions: number[] | undefined;
    if (this.props.pointsMap) {
      positions = Object.keys(this.props.pointsMap).map((key) => Number(key))
        .sort((a, b) => a - b);
    }

    let min = 0;
    let newMin = min;
    let max = 1;
    let newMax = max;
    if (selectedPoints[selectedIndex - 1]) {
      min = Number(selectedPoints[selectedIndex - 1][1][0]);
      if (positions) {
        newMin = positions[positions.indexOf(min) + 1];
      } else if (this.props.range) {
        newMin = min; // improve + positionRatio step
      }
    }
    if (selectedPoints[selectedIndex + 1]) {
      max = Number(selectedPoints[selectedIndex + 1][1][0]);
      if (positions) {
        newMax = positions[positions.indexOf(max) - 1];
      } else if (this.props.range) {
        newMax = max; // improve - positionRatio step
      }
    }

    this.state.selectedPointsLimits = {};
    // if (!allowSameSelection)
    this.state.selectedPointsLimits[selectedId] = { min: newMin, max: newMax };

    this.notifyObservers({ currentPointLimits: [selectedId, { min, max }] });

    console.log({ selectedId, newMin, newMax });
  }

  private initialize(): void {
    if (this.props.range) { // improve?
      this.generateValuesArrayFromRange(this.props.range);
    }
    if (isNumberArray(this.props.valuesArray)) {
      this.generatePointsMapFromNumberArray(this.props.valuesArray);
    }
    // allow only number[] | string[], for the latter use equal step
    // (number | string)[] can only be initialized from pointsMap?
  }

  private generateValuesArrayFromRange(
    { max, min, step }: { max: number; min: number; step: number },
  ): void {
    this.props.valuesArray = [] as number[];
    const pointsNumber = Math.ceil((max - min) / step);

    for (let index = 0; index < pointsNumber; index += 1) {
      const point = index * step + min;
      this.props.valuesArray.push(Number(point.toFixed(5)));
    }
    this.props.valuesArray.push(Number(max.toFixed(5)));
  }

  private generatePointsMapFromNumberArray(valuesArray: number[]): void {
    this.props.pointsMap = {};

    const pointsNumber = valuesArray.length;
    this.calculatePointsMapPrecision(pointsNumber);

    const max = valuesArray[pointsNumber - 1];
    const min = valuesArray[0];
    valuesArray.forEach((value) => {
      this.addNumberPointToPointsMap(value, { max, min });
    });

    console.log(this.props.pointsMap);
  }

  private calculatePointsMapPrecision(pointsNumber: number): void {
    if (pointsNumber <= 10) {
      this.props.pointsMapPrecision = 2;
    } else {
      this.props.pointsMapPrecision = Math.ceil(Math.log10(pointsNumber));
    }
    console.log('pointsMapPrecision', this.props.pointsMapPrecision);
  }

  private addNumberPointToPointsMap(
    value: number,
    { max, min }: { max: number; min: number },
  ): void | never {
    if (this.props.pointsMap && this.props.pointsMapPrecision) {
      const positionRatio = Number(((value - min)
        / (max - min)).toFixed(this.props.pointsMapPrecision));
      this.props.pointsMap[positionRatio] = Number(value.toFixed(5));
    } else {
      throw new Error('"pointsMap" is not defined');
    }
  }

  private checkPointLimits([id, positionRatio]: [string, number]): boolean {
    if (this.state.selectedPointsLimits) {
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
