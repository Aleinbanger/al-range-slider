import bind from 'bind-decorator';

import { cloneDeep } from 'shared/scripts/utils/utils';

import Model, { IModelData } from '../Model/Model';
import View, { IViewState } from '../View/View';
import { IProps, IState, IData } from './PresenterTypes';

class Presenter {
  private readonly parent: HTMLElement;

  private props: IProps;

  private state?: IState;

  private model?: Model;

  private view?: View;

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

  public restart(props?: Partial<IProps>): void {
    if (typeof props === 'object') {
      const oldProps = this.props;
      this.props = { ...oldProps, ...cloneDeep(props) };
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

  public getState(): IState | undefined {
    this.updateState();
    return cloneDeep(this.state);
  }

  private initialize(): void {
    const { parent } = this;
    const {
      initialSelectedValues = { to: 0 },
      valuesPrecision = 4,
      range = { min: -100, max: 100, step: 1 },
      valuesArray,
      pointsMap,
      orientation = 'horizontal',
      theme = 'light',
      grid = { minTicksStep: 1, marksStep: 1 },
      showInputs = true,
      showTooltips = true,
      collideTooltips = true,
      collideKnobs = true,
      allowSmoothTransition = true,
    } = this.props;

    this.model = new Model({
      initialSelectedValues,
      valuesPrecision,
      collideKnobs,
      range,
      valuesArray,
      pointsMap,
    });
    this.view = new View(
      parent,
      {
        cssClass: 'al-range-slider',
        orientation,
        theme,
        selectedIds: Object.keys(initialSelectedValues).map((id) => id),
        grid: {
          ...grid,
          pointsMap: grid.pointsMap ?? this.model.getPointsMap(),
        },
        showInputs,
        showTooltips,
        collideTooltips,
        allowSmoothTransition,
      },
    );
    this.addObservers();

    Object.entries(initialSelectedValues).forEach((currentValue) => {
      this.model?.selectPointByValue(currentValue);
    });
    if (typeof this.props.onInit === 'function') {
      this.updateState();
      this.props.onInit.call(this, this.state);
    }
  }

  private addObservers(): void {
    this.model?.addObserver(this.handleCurrentPointLimitsChange);
    this.model?.addObserver(this.handleCurrentPointChange);
    this.view?.addObserver(this.handleCurrentActiveStatusChange);
    this.view?.addObserver(this.handleCurrentPositionChange);
    this.view?.addObserver(this.handleCurrentValueChange);
    this.view?.addObserver(this.handleUnknownPositionChange);
  }

  private removeObservers(): void {
    this.model?.removeObserver(this.handleCurrentPointLimitsChange);
    this.model?.removeObserver(this.handleCurrentPointChange);
    this.view?.removeObserver(this.handleCurrentActiveStatusChange);
    this.view?.removeObserver(this.handleCurrentPositionChange);
    this.view?.removeObserver(this.handleCurrentValueChange);
    this.view?.removeObserver(this.handleUnknownPositionChange);
  }

  private updateState(): void {
    this.state = {
      ...this.model?.getState(),
      ...this.view?.getState(),
    };
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
}

export type { IProps, IState, IData };
export default Presenter;
