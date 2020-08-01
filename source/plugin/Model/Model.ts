import { getKeyByValue, getClosestNumber } from 'shared/scripts/utils';

import Observable from '../Observable/Observable';
import { IModelState } from './ModelTypes';

class Model extends Observable {
  private state: IModelState = {
    value: {
      min: 415,
      max: 687,
      step: 17,
    },
    currentPositionRatio: {
      from: 0,
    },
    currentPoint: {
      from: 503,
      // to: 0,
    },
    pointsMap: {},
    type: 'single',
    orientation: 'horizontal',
    showInput: true,
    showScale: false,
    showTooltips: false,
  };

  private temp: Record<string, unknown> = {};

  constructor() {
    super();
    this.initialize();
  }

  public setCurrentPointFromPosition(positionRatio: number): void {
    const fromFixed = Number(positionRatio.toFixed(Number(this.temp.positionRatioPrecision)));
    if (typeof this.state.pointsMap[fromFixed] !== 'undefined') {
      this.state.currentPositionRatio.from = fromFixed;
      this.state.currentPoint.from = this.state.pointsMap[fromFixed];

      this.notifyObservers(this.state); // improve
    }

    // add methods w/o pointsMap
  }

  public setCurrentPositionFromPoint(point: number | string): void | never {
    let closestPoint: number | string;
    if (typeof point === 'number') {
      closestPoint = getClosestNumber(point, Object.values(this.state.pointsMap) as number[]);
    } else {
      closestPoint = point;
    }
    this.state.currentPoint.from = closestPoint;

    const positionRatio = getKeyByValue(this.state.pointsMap, closestPoint);
    if (typeof positionRatio !== 'undefined') {
      this.state.currentPositionRatio.from = Number(positionRatio);

      this.notifyObservers(this.state); // improve
    } else {
      throw new Error('The position is not found');
    }

    // will also be used for setting position from input
  }

  public getState(): IModelState {
    return JSON.parse(JSON.stringify(this.state));
  }

  private initialize(): void {
    this.populatePointsMap(this.state.value);
  }

  private populatePointsMap({ max, min, step }:
  { max: number; min: number; step: number }): void {
    const pointsNumber = Math.ceil((max - min) / step);
    console.log('pointsNumber', pointsNumber);

    // move to config
    if (pointsNumber <= 10) {
      this.temp.positionRatioPrecision = 2;
    } else {
      this.temp.positionRatioPrecision = Math.ceil(Math.log10(pointsNumber));
    }
    console.log('positionRatioPrecision', this.temp.positionRatioPrecision);

    for (let index = 0; index < pointsNumber; index += 1) {
      const point = index * step + min;
      this.addNumberPoint(point, { max, min, step });
    }
    this.addNumberPoint(max, { max, min, step });

    console.log(this.state.pointsMap);
  }

  private addNumberPoint(point: number, { max, min }:
  { max: number; min: number; step: number }): void {
    const positionRatio = Number(((point - min)
        / (max - min)).toFixed(Number(this.temp.positionRatioPrecision)));
    this.state.pointsMap[positionRatio] = Number(point.toFixed(4));
  }
}

export default Model;
