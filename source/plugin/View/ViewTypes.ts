/* eslint-disable import/prefer-default-export */

type TOrientation = 'horizontal' | 'vertical';

type TReferenceFrame = {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

type TPointsMap = [position: string, value: number | string][];

interface IViewProps {
  readonly cssClass: string;
}

interface IViewState {
  currentPosition?: [id: string, position: number];
  currentPositionLimits?: [id: string, limits: { min: number; max: number }];
  currentActiveStatus?: [id: string, active: boolean];
  currentValue?: [id: string, value: string];
  unknownPosition?: number;
}

interface ISubViewProps extends IViewProps {
  readonly parent: HTMLElement;
  orientation?: TOrientation;
  referenceFrame?: TReferenceFrame;
}

export type {
  TOrientation,
  TPointsMap,
  IViewProps,
  IViewState,
  ISubViewProps,
};
