/* eslint-disable import/prefer-default-export */

type TPointValue = number | string;

type TPoint = [position: number, value: TPointValue];

type TCurrentPoint = [id: string, point: TPoint];

interface IModelProps {
  readonly initialSelectedValues: Record<string, TPointValue>;
  readonly valuesPrecision: number;
  readonly collideKnobs: boolean;
  readonly onInit?: (state?: IModelState, props?: IModelProps) => void;
  range?: {
    min: number;
    max: number;
    step: number;
    positionStep?: number;
  };
  valuesArray?: number[] | string[];
  pointsMap?: Record<number, TPointValue>;
  pointsMapPrecision?: number;
  positionsArray?: number[];
}

interface IModelState {
  selectedPoints: Record<string, TPoint>;
  selectedPointsLimits: Record<string, { min: number; max: number }>;
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
