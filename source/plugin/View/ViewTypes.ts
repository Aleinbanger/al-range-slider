/* eslint-disable import/prefer-default-export */

type TOrientation = 'horizontal' | 'vertical';

type TReferenceFrame = {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

type TSelectedPosition = [string, number];

interface IViewProps {
  readonly cssClass: string;
}

interface IViewState {
  selectedPositions: Record<string, number>;
}

interface ISubViewProps extends IViewProps {
  readonly parent: HTMLElement;
  orientation?: TOrientation;
  referenceFrame?: TReferenceFrame;
}

export type {
  TOrientation,
  TSelectedPosition,
  IViewProps,
  IViewState,
  ISubViewProps,
};
