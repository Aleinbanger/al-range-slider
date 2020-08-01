/* eslint-disable import/prefer-default-export */

interface IModelState {
  value: {
    min: number;
    max: number;
    step: number;
  };
  currentPositionRatio: {
    from: number;
    to?: number;
  };
  currentPoint: {
    from: number | string;
    to?: number | string;
  };
  pointsMap: Record<number, number | string>; // also can be defined from config
  pointsArray?: number[] | string[];
  type: 'single' | 'double';
  orientation: 'horizontal' | 'vertical';
  showInput: boolean;
  showScale: boolean;
  showTooltips: boolean;
}

export type { IModelState };

// move static properties to config (including Map and Array)
