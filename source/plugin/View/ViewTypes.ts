/* eslint-disable import/prefer-default-export */

import { TPointValue, TSelectedPositionLimits } from '../Model/ModelTypes';

type TOrientation = 'horizontal' | 'vertical';

type TTheme = 'light' | 'dark';

type TReferenceFrame = {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

type TPointsMap = [position: string, value: TPointValue][];

interface ICommonViewProps {
  readonly cssClass: string;
  readonly orientation: TOrientation;
}

interface IViewProps extends ICommonViewProps {
  readonly theme: TTheme;
  readonly selectedIds: string[];
  readonly grid: {
    readonly pointsMap: TPointsMap;
    readonly minTicksStep: number;
    readonly marksStep: number;
  } | undefined;
  readonly allowSmoothTransition: boolean;
  readonly showInputs: boolean | 'hidden';
  readonly showTooltips: boolean;
  readonly collideTooltips: boolean;
  readonly tooltipsSeparator: string;
  readonly prettify?: (value: string) => string;
}

interface IViewState {
  selectedValues?: Record<string, TPointValue>;
  selectedPrettyValues?: Record<string, string>;
  currentPositionLimits?: TSelectedPositionLimits;
  currentPosition?: [id: string, position: number];
  currentValue?: [id: string, value: TPointValue];
  currentActiveStatus?: [id: string, active: boolean];
}

type TPositionEvent = {
  kind: 'position change';
  data: NonNullable<IViewState['currentPosition']>;
};

type TValueEvent = {
  kind: 'value change';
  data: NonNullable<IViewState['currentValue']>;
};

type TActiveStatusEvent = {
  kind: 'active status change';
  data: NonNullable<IViewState['currentActiveStatus']>;
};

type TUnknownPositionEvent = {
  kind: 'unknown position change';
  data: number;
};

type TViewEvent = TPositionEvent | TValueEvent | TActiveStatusEvent | TUnknownPositionEvent;

export type {
  TOrientation,
  TTheme,
  TReferenceFrame,
  TPointsMap,
  ICommonViewProps,
  IViewProps,
  IViewState,
  TViewEvent,
};
