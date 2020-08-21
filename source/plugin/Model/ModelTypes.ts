/* eslint-disable import/prefer-default-export */

type TPointValue = number | string;

type TPoint = [position: number, value: TPointValue];

type TSelectedPoint = [id: string, point: TPoint];

interface IModelProps {
  type: 'single' | 'double';
  orientation: 'horizontal' | 'vertical';
  showInputs: boolean;
  showGrid: boolean;
  showTooltips: boolean;
  range?: {
    min: number;
    max: number;
    step: number;
    callback?: (point: number) => number;
  };
  valuesArray?: number[] | string[]; // also can be defined from config
  pointsMap?: Record<number, TPointValue>; // also can be defined from config
  pointsMapPrecision?: number;
}

interface IModelState {
  selectedPoints: Record<string, TPoint>;
}

interface IModelData {
  selectedPoint?: TSelectedPoint;
}

export type {
  TPointValue,
  TSelectedPoint,
  IModelProps,
  IModelState,
  IModelData,
};
