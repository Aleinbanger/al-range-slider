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
  TSelectedPoint,
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
        min: -152,
        max: 937,
        step: 76.37,
      },
    };

    this.state = {
      selectedPoints: {
        from: [0, 0],
        to: [0, 100],
        asdo: [0, 300],
      },
    };

    this.initialize();
  }

  public getState(): IModelState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public getSelectedPoints(): TSelectedPoint[] {
    return Object.entries(this.state.selectedPoints);
  }

  // pointsMap
  public selectPointByPosition([id, positionRatio]: [string, number]): void | never {
    if (positionRatio < 0 || positionRatio > 1) {
      throw new Error('Invalid "positionRatio" value, must be in between 0 and 1');
    }

    if (this.props.pointsMap && this.props.pointsMapPrecision) {
      const positionRatioFixed = Number(positionRatio
        .toFixed(Number(this.props.pointsMapPrecision)));
      if (typeof this.props.pointsMap[positionRatioFixed] !== 'undefined') {
        this.state.selectedPoints[id][0] = positionRatioFixed;
        this.state.selectedPoints[id][1] = this.props.pointsMap[positionRatioFixed];

        this.notifyObservers({ selectedPoint: [id, this.state.selectedPoints[id]] });
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
        this.state.selectedPoints[id][0] = Number(positionRatio);

        this.notifyObservers({ selectedPoint: [id, this.state.selectedPoints[id]] });
        // move to the bottom
      }
    } else {
      throw new Error('"pointsMap" is not defined'); // add methods w/o pointsMap
    }

    // will also be used for setting position from input
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
        / (max - min)).toFixed(Number(this.props.pointsMapPrecision)));
      this.props.pointsMap[positionRatio] = Number(value.toFixed(5));
    } else {
      throw new Error('"pointsMap" is not defined');
    }
  }
}

export default Model;
