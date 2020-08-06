import {
  getKeyByValue,
  getClosestNumber,
  isNumberArray,
  isStringArray,
} from 'shared/scripts/utils';

import Observable from '../Observable/Observable';
import {
  TPointValue,
  IPointValue,
  IPositionRatio,
  IModelProps,
  IModelState,
} from './ModelTypes';

class Model extends Observable<IModelState> {
  private readonly props: IModelProps;

  private state: IModelState;

  constructor() {
    super();
    this.props = {
      type: 'single',
      orientation: 'horizontal',
      showInput: true,
      showGrid: false,
      showTooltips: false,
      range: {
        min: -152,
        max: 937,
        step: 76.37,
      },
    };

    this.state = {
      pointValue: {
        from: 132,
        // to: 0,
      },
      positionRatio: {
        from: 0,
      },
    };

    this.initialize();
  }

  public getState(): IModelState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public getStatePointValue(): IPointValue {
    return JSON.parse(JSON.stringify(this.state.pointValue));
  }

  // pointsMap
  public setCurrentPointFromPosition({ from, to }: IPositionRatio): void | never {
    if (this.props.pointsMap && this.props.pointsMapPrecision) {
      const fromFixed = Number(from.toFixed(Number(this.props.pointsMapPrecision)));
      if (typeof this.props.pointsMap[fromFixed] !== 'undefined') {
        this.state.positionRatio.from = fromFixed;
        this.state.pointValue.from = this.props.pointsMap[fromFixed];

        this.notifyObservers(this.state); // improve?
      }
    } else {
      throw new Error('pointsMap is not defined'); // add methods w/o pointsMap
    }
  }

  // pointsMap
  public setCurrentPositionFromPoint({ from, to }: IPointValue): void | never {
    let fromClosest: TPointValue;
    if (typeof from === 'number' && isNumberArray(this.props.pointsArray)) {
      fromClosest = getClosestNumber(from, this.props.pointsArray);
    } else {
      fromClosest = from; // improve // add methods w/o pointsArray
    }
    this.state.pointValue.from = fromClosest;

    // add methods for string[]

    if (this.props.pointsMap) {
      const positionRatioFrom = getKeyByValue(this.props.pointsMap, this.state.pointValue.from);
      this.state.positionRatio.from = Number(positionRatioFrom);

      this.notifyObservers(this.state); // improve? // move to the bottom
    } else {
      throw new Error('pointsMap is not defined'); // add methods w/o pointsMap
    }

    // will also be used for setting position from input
  }

  private initialize(): void {
    if (this.props.range) { // improve?
      this.generatePointsArrayFromRange(this.props.range);
    }
    if (isNumberArray(this.props.pointsArray)) {
      this.generatePointsMapFromNumberArray(this.props.pointsArray);
    }
    // allow only number[] | string[], for the latter use equal step
    // (number | string)[] can only be initialized from pointsMap?
  }

  private generatePointsArrayFromRange({ max, min, step }:
  { max: number; min: number; step: number }): void {
    this.props.pointsArray = [] as number[];
    const pointsNumber = Math.ceil((max - min) / step);

    for (let index = 0; index < pointsNumber; index += 1) {
      const point = index * step + min;
      this.props.pointsArray.push(Number(point.toFixed(5)));
    }
    this.props.pointsArray.push(Number(max.toFixed(5)));
  }

  private generatePointsMapFromNumberArray(pointsArray: number[]): void {
    this.props.pointsMap = {};

    const pointsNumber = pointsArray.length;
    this.calculatePointsMapPrecision(pointsNumber);

    const max = pointsArray[pointsNumber - 1];
    const min = pointsArray[0];
    pointsArray.forEach((point) => {
      this.addNumberPointToPointsMap(point, { max, min });
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

  private addNumberPointToPointsMap(point: number, { max, min }:
  { max: number; min: number }): void | never {
    if (this.props.pointsMap && this.props.pointsMapPrecision) {
      const positionRatio = Number(((point - min)
          / (max - min)).toFixed(Number(this.props.pointsMapPrecision)));
      this.props.pointsMap[positionRatio] = Number(point.toFixed(5));
    } else {
      throw new Error('pointsMap is not defined');
    }
  }
}

export default Model;
