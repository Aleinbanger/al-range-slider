import { IModelProps, IModelState } from '../Model/ModelTypes';
import { IViewProps, IViewState, TPointsMap } from '../View/ViewTypes';

interface IProps extends Omit<IModelProps, 'pointsMapPrecision' | 'positionsArray' | 'onInit'>,
  Omit<IViewProps, 'cssClass' | 'selectedIds' | 'grid'> {
  readonly grid: {
    readonly minTicksStep: number;
    readonly marksStep: number;
    readonly pointsMap?: TPointsMap;
  };
  readonly onInit?: (state?: IState, props?: IProps) => void;
  readonly onStart?: (state?: IState) => void;
  readonly onFinish?: (state?: IState) => void;
  readonly onChange?: (state?: IState) => void;
  readonly onUpdate?: (state?: IState) => void;
}

interface IState extends Partial<IViewState>, Partial<IModelState> {}

interface IData {
  values?: IProps['initialSelectedValues'];
  positions?: Record<string, number>;
}

export type {
  IProps,
  IState,
  IData,
};
