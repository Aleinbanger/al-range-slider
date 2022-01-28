/* eslint-disable import/prefer-default-export */

import { TPointValue } from '../Model/ModelTypes';

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
  currentPosition?: [id: string, position: number];
  currentPositionLimits?: [id: string, limits: { min: number; max: number }];
  currentActiveStatus?: [id: string, active: boolean];
  currentValue?: [id: string, value: TPointValue];
  unknownPosition?: number;
}

export type {
  TOrientation,
  TTheme,
  TReferenceFrame,
  TPointsMap,
  ICommonViewProps,
  IViewProps,
  IViewState,
};
