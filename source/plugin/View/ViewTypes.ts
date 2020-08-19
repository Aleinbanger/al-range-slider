/* eslint-disable import/prefer-default-export */

type TOrientation = 'horizontal' | 'vertical';

type TReferenceFrame = {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

interface IViewProps {
  readonly cssClass: string;
}

interface IViewState {
  selectedPosition?: [string, number];
  selectedValue?: [string, string];
}

interface ISubViewProps extends IViewProps {
  readonly parent: HTMLElement;
  orientation?: TOrientation;
  referenceFrame?: TReferenceFrame;
}

export type {
  TOrientation,
  IViewProps,
  IViewState,
  ISubViewProps,
};
