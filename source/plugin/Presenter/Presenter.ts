import bind from 'bind-decorator';

import { cloneDeep, filterObject } from 'shared/scripts/utils/utils';

import Model, { IModelData } from '../Model/Model';
import View, { IViewState } from '../View/View';
import { IProps, IState, IData } from './PresenterTypes';

class Presenter {
  readonly #parent: HTMLElement;

  #props: IProps;

  #state?: IState;

  #model?: Model;

  #view?: View;

  constructor(parent: HTMLElement, props: IProps) {
    this.#parent = parent;
    this.#props = cloneDeep(props);
    this.#initialize();
  }

  public destroy(): void {
    this.#view?.destroy();
    this.#view = undefined;
    this.#model = undefined;
  }

  public disable(disabled = true): void {
    this.#view?.disable(disabled);
    if (disabled) {
      this.#removeObservers();
    } else {
      this.#addObservers();
    }
  }

  public restart(props?: Partial<IProps>): void {
    if (typeof props === 'object') {
      this.#props = { ...this.#props, ...cloneDeep(props) };
    }
    this.destroy();
    this.#initialize();
  }

  public update(data?: IData): void {
    if (data) {
      const { values, positions } = data;
      if (typeof values === 'object') {
        Object.entries(values).forEach((currentValue) => {
          this.#model?.selectPointByValue(currentValue);
        });
      }
      if (typeof positions === 'object') {
        Object.entries(positions).forEach((currentPosition) => {
          this.#model?.selectPointByPosition(currentPosition);
        });
      }
    }
    if (typeof this.#props.onUpdate === 'function') {
      this.#props.onUpdate.call(this, this.getState());
    }
  }

  public getState(): IState | undefined {
    this.#state = {
      ...this.#model?.getState(),
      ...this.#view?.getState(),
    };
    return cloneDeep(this.#state);
  }

  #initialize(): void {
    const {
      initialSelectedValues, valuesPrecision, collideKnobs, range, valuesArray, pointsMap,
      orientation, theme, grid, allowSmoothTransition, showInputs,
      showTooltips, collideTooltips, tooltipsSeparator, prettify,
    } = this.#props;

    this.#model = new Model({
      initialSelectedValues,
      valuesPrecision,
      collideKnobs,
      range,
      valuesArray,
      pointsMap,
      onInit: (_, props) => {
        if (props) {
          this.#props = {
            ...this.#props,
            ...filterObject(props, ([key]) => key in this.#props && key !== 'onInit'),
          };
        }
      },
    });
    this.#view = new View(
      this.#parent,
      {
        cssClass: 'al-range-slider',
        orientation,
        theme,
        selectedIds: Object.keys(initialSelectedValues).map((id) => id),
        grid: {
          ...grid,
          pointsMap: grid.pointsMap ?? this.#model.getPointsMap(),
        },
        allowSmoothTransition,
        showInputs,
        showTooltips,
        collideTooltips,
        tooltipsSeparator,
        prettify,
      },
    );
    this.#addObservers();

    Object.entries(initialSelectedValues).forEach((currentValue) => {
      this.#model?.selectPointByValue(currentValue);
    });
    if (typeof this.#props.onInit === 'function') {
      this.#props.onInit.call(this, this.getState(), cloneDeep(this.#props));
    }
  }

  #addObservers(): void {
    this.#model?.addObserver(this.handleCurrentPointLimitsChange);
    this.#model?.addObserver(this.handleCurrentPointChange);
    this.#view?.addObserver(this.handleCurrentActiveStatusChange);
    this.#view?.addObserver(this.handleCurrentPositionChange);
    this.#view?.addObserver(this.handleCurrentValueChange);
    this.#view?.addObserver(this.handleUnknownPositionChange);
  }

  #removeObservers(): void {
    this.#model?.removeObserver(this.handleCurrentPointLimitsChange);
    this.#model?.removeObserver(this.handleCurrentPointChange);
    this.#view?.removeObserver(this.handleCurrentActiveStatusChange);
    this.#view?.removeObserver(this.handleCurrentPositionChange);
    this.#view?.removeObserver(this.handleCurrentValueChange);
    this.#view?.removeObserver(this.handleUnknownPositionChange);
  }

  @bind
  private handleCurrentPointLimitsChange({ currentPointLimits }: IModelData): void {
    if (currentPointLimits) {
      this.#view?.setState({ currentPositionLimits: currentPointLimits });
    }
  }

  @bind
  private handleCurrentPointChange({ currentPoint }: IModelData): void {
    if (currentPoint) {
      const [id, point] = currentPoint;
      this.#view?.setState({
        currentPosition: [id, point[0]],
        currentValue: [id, point[1]],
      });
      if (typeof this.#props.onChange === 'function') {
        this.#props.onChange.call(this, this.getState());
      }
    }
  }

  @bind
  private handleCurrentActiveStatusChange({ currentActiveStatus }: IViewState): void {
    if (currentActiveStatus) {
      const [id, active] = currentActiveStatus;
      this.#view?.setState({ currentActiveStatus });
      if (active) {
        this.#model?.selectPointLimits(id);
        if (typeof this.#props.onStart === 'function') {
          this.#props.onStart.call(this, this.getState());
        }
      } else if (typeof this.#props.onFinish === 'function') {
        this.#props.onFinish.call(this, this.getState());
      }
    }
  }

  @bind
  private handleCurrentPositionChange({ currentPosition }: IViewState): void {
    if (currentPosition) {
      this.#model?.selectPointByPosition(currentPosition);
    }
  }

  @bind
  private handleCurrentValueChange({ currentValue }: IViewState): void {
    if (currentValue) {
      this.#model?.selectPointByValue(currentValue);
    }
  }

  @bind
  private handleUnknownPositionChange({ unknownPosition }: IViewState): void {
    if (typeof unknownPosition !== 'undefined') {
      this.#model?.selectPointByUnknownPosition(unknownPosition);
    }
  }
}

export type { IProps, IState, IData };
export default Presenter;
