/* eslint-disable import/prefer-default-export */

type TPointValue = number | string;

type TOrientation = 'horizontal' | 'vertical';

type TReferenceFrame = {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

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

interface ISubViewProps {
  readonly parent: HTMLElement;
  readonly cssClass: string;
  orientation?: TOrientation;
  referenceFrame?: TReferenceFrame;
}

export type {
  TPointValue,
  TOrientation,
  IPointValue,
  IPositionRatio,
  IViewState,
  ISubViewProps,
};
