import bind from 'bind-decorator';

import { cloneDeep } from 'shared/scripts/utils';

import View from '../View/View';
import { IViewProps, IViewState } from '../View/ViewTypes';
import Model from '../Model/Model';
import { IModelProps, IModelState, IModelData } from '../Model/ModelTypes';

interface IProps extends Omit<IViewProps, 'cssClass'>,
  Omit<IModelProps, 'pointsMapPrecision' | 'positionsArray'> {
  onInit?: (state?: IState) => void;
  onStart?: (state?: IState) => void;
  onFinish?: (state?: IState) => void;
  onChange?: (state?: IState) => void;
  onUpdate?: (state?: IState) => void;
}
interface IState extends Partial<IViewState>, Partial<IModelState> {}
interface IData {
  values?: IProps['initialSelectedValues'];
  positions?: Record<string, number>;
}

class Presenter {
  private readonly parent: HTMLElement;

  private props: IProps;

  private state?: IState;

  private view?: View;

  private model?: Model;

  constructor(parent: HTMLElement, props: IProps) {
    this.parent = parent;
    this.props = cloneDeep(props);
    this.initialize();
  }

  public destroy(): void {
    this.view?.destroy();
    delete this.view;
    delete this.model;
  }

  public disable(disabled = true): void {
    this.view?.disable(disabled);
    if (disabled) {
      this.removeObservers();
    } else {
      this.addObservers();
    }
  }

  public restart(props?: IProps): void {
    if (typeof props === 'object') {
      this.props = cloneDeep(props);
    }
    this.destroy();
    this.initialize();
  }

  public update(data?: IData): void {
    if (data) {
      const { values, positions } = data;
      if (typeof values === 'object') {
        Object.entries(values).forEach((currentValue) => {
          this.model?.selectPointByValue(currentValue);
        });
      }
      if (typeof positions === 'object') {
        Object.entries(positions).forEach((currentPosition) => {
          this.model?.selectPointByPosition(currentPosition);
        });
      }
    }
    if (typeof this.props.onUpdate === 'function') {
      this.updateState();
      this.props.onUpdate.call(this, this.state);
    }
  }

  private initialize(): void {
    const { parent } = this;
    const {
      orientation = 'horizontal',
      theme = 'light',
      grid = { minTicksStep: 1, marksStep: 1 },
      showInputs = true,
      showTooltips = true,
      collideTooltips = true,
      collideKnobs = true,
      allowSmoothTransition = true,
      initialSelectedValues = { to: 0 },
      valuesPrecision = 4,
      range = { min: -100, max: 100, step: 1 },
      valuesArray,
      pointsMap,
    } = this.props;
    this.view = new View(
      parent,
      {
        cssClass: 'al-range-slider',
        orientation,
        theme,
        grid,
        showInputs,
        showTooltips,
        collideTooltips,
        allowSmoothTransition,
      },
    );
    this.model = new Model({
      initialSelectedValues,
      valuesPrecision,
      collideKnobs,
      range,
      valuesArray,
      pointsMap,
    });
    this.addObservers();

    const selectedValues = Object.entries(initialSelectedValues);
    this.view.initializeGrid(this.model.getPointsMap());
    this.view.initializeBars(selectedValues.map(([id]) => id));
    selectedValues.forEach(([id, value]) => {
      this.view?.initializePoint(id);
      this.model?.selectPointByValue([id, value]);
    });

    if (typeof this.props.onInit === 'function') {
      this.updateState();
      this.props.onInit.call(this, this.state);
    }
  }

  private addObservers(): void {
    this.view?.addObserver(this.handleCurrentActiveStatusChange);
    this.view?.addObserver(this.handleCurrentPositionChange);
    this.view?.addObserver(this.handleCurrentValueChange);
    this.view?.addObserver(this.handleUnknownPositionChange);
    this.model?.addObserver(this.handleCurrentPointLimitsChange);
    this.model?.addObserver(this.handleCurrentPointChange);
  }

  private removeObservers(): void {
    this.view?.removeObserver(this.handleCurrentActiveStatusChange);
    this.view?.removeObserver(this.handleCurrentPositionChange);
    this.view?.removeObserver(this.handleCurrentValueChange);
    this.view?.removeObserver(this.handleUnknownPositionChange);
    this.model?.removeObserver(this.handleCurrentPointLimitsChange);
    this.model?.removeObserver(this.handleCurrentPointChange);
  }

  private updateState(): void {
    this.state = {
      ...this.view?.getState(),
      ...this.model?.getState(),
    };
  }

  @bind
  private handleCurrentActiveStatusChange({ currentActiveStatus }: IViewState): void {
    if (currentActiveStatus) {
      const [id, active] = currentActiveStatus;
      this.view?.setState({ currentActiveStatus });
      if (active) {
        this.model?.selectPointLimits(id);
        if (typeof this.props.onStart === 'function') {
          this.updateState();
          this.props.onStart.call(this, this.state);
        }
      } else if (typeof this.props.onFinish === 'function') {
        this.updateState();
        this.props.onFinish.call(this, this.state);
      }
    }
  }

  @bind
  private handleCurrentPositionChange({ currentPosition }: IViewState): void {
    if (currentPosition) {
      this.model?.selectPointByPosition(currentPosition);
    }
  }

  @bind
  private handleCurrentValueChange({ currentValue }: IViewState): void {
    if (currentValue) {
      this.model?.selectPointByValue(currentValue);
    }
  }

  @bind
  private handleUnknownPositionChange({ unknownPosition }: IViewState): void {
    if (typeof unknownPosition !== 'undefined') {
      this.model?.selectPointByUnknownPosition(unknownPosition);
    }
  }

  @bind
  private handleCurrentPointLimitsChange({ currentPointLimits }: IModelData): void {
    if (currentPointLimits) {
      this.view?.setState({ currentPositionLimits: currentPointLimits });
    }
  }

  @bind
  private handleCurrentPointChange({ currentPoint }: IModelData): void {
    if (currentPoint) {
      const [id, point] = currentPoint;
      this.view?.setState({
        currentPosition: [id, point[0]],
        currentValue: [id, String(point[1])],
      });
      if (typeof this.props.onChange === 'function') {
        this.updateState();
        this.props.onChange.call(this, this.state);
      }
    }
  }
}

export type { IProps, IState };
export default Presenter;
