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

interface IViewState {
  positionRatio: IPositionRatio;
}

export type {
  TPointValue,
  IPointValue,
  IPositionRatio,
  IViewState,
};
