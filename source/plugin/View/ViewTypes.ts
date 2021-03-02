/* eslint-disable import/prefer-default-export */

type TOrientation = 'horizontal' | 'vertical';

type TTheme = 'light' | 'dark';

type TReferenceFrame = {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

type TPointsMap = [position: string, value: number | string][];

interface ICommonViewProps {
  readonly parent: HTMLElement;
  readonly cssClass: string;
  readonly orientation: TOrientation;
}

interface IViewProps extends ICommonViewProps {
  readonly theme: TTheme;
  readonly grid: {
    readonly minTicksStep: number;
    readonly marksStep: number;
  } | undefined;
  readonly showInputs: boolean | 'hidden';
  readonly showTooltips: boolean;
  readonly collideTooltips: boolean;
  readonly allowSmoothTransition: boolean;
}

interface IViewState {
  currentPosition?: [id: string, position: number];
  currentPositionLimits?: [id: string, limits: { min: number; max: number }];
  currentActiveStatus?: [id: string, active: boolean];
  currentValue?: [id: string, value: string];
  unknownPosition?: number;
}

interface ISubViewProps extends ICommonViewProps {
  referenceFrame?: TReferenceFrame;
}

export type {
  TTheme,
  TPointsMap,
  IViewProps,
  IViewState,
  ISubViewProps,
};
