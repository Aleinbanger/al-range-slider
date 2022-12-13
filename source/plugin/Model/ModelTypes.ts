/* eslint-disable import/prefer-default-export */

type TPointValue = number | string;

type TPoint = [position: number, value: TPointValue];

type TSelectedPoint = [id: string, point: TPoint];

type TPositionLimits = { min: number; max: number };

type TSelectedPositionLimits = [id: string, limits: TPositionLimits];

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
  selectedPointsLimits: Record<string, TPositionLimits>;
}

type TPointEvent = {
  kind: 'point change';
  data: TSelectedPoint;
};

type TPositionLimitsEvent = {
  kind: 'position limits change';
  data: TSelectedPositionLimits;
};

type TModelEvent = TPointEvent | TPositionLimitsEvent;

export type {
  TPointValue,
  TSelectedPoint,
  TSelectedPositionLimits,
  IModelProps,
  IModelState,
  TModelEvent,
};
