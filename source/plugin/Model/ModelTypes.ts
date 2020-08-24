/* eslint-disable import/prefer-default-export */

type TPointValue = number | string;

type TPoint = [position: number, value: TPointValue];

type TCurrentPoint = [id: string, point: TPoint];

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
  selectedPointsLimits?: Record<string, { min: number; max: number }>;
}

interface IModelData {
  currentPoint?: TCurrentPoint;
  currentPointLimits?: [id: string, limits: { min: number; max: number }];
}

export type {
  TPointValue,
  TCurrentPoint,
  IModelProps,
  IModelState,
  IModelData,
};
