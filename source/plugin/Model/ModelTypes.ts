/* eslint-disable import/prefer-default-export */

type TPointValue = number | string;

interface IPointValue {
  from: TPointValue;
  to?: TPointValue;
}

interface IPositionRatio {
  from: number;
  to?: number;
}

interface IModelConfig {
  type: 'single' | 'double';
  orientation: 'horizontal' | 'vertical';
  showInput: boolean;
  showGrid: boolean;
  showTooltips: boolean;
  range?: {
    min: number;
    max: number;
    step: number;
    callback?: (point: number) => number;
  };
  pointsArray?: number[] | string[]; // also can be defined from config
  pointsMap?: Record<number, TPointValue>; // also can be defined from config
  pointsMapPrecision?: number;
}

interface IModelState {
  pointValue: IPointValue;
  positionRatio: IPositionRatio;
}

export type {
  TPointValue,
  IPointValue,
  IPositionRatio,
  IModelConfig,
  IModelState,
};
