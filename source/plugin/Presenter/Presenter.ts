import bind from 'bind-decorator';

import { cloneDeep, filterObject } from 'shared/scripts/utils/utils';

import Model, { TModelEvent } from '../Model/Model';
import View, { TViewEvent } from '../View/View';
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
    this.#model?.addObserver(this.handleModelChange);
    this.#view?.addObserver(this.handleViewChange);
  }

  #removeObservers(): void {
    this.#model?.removeObserver(this.handleModelChange);
    this.#view?.removeObserver(this.handleViewChange);
  }

  @bind
  private handleModelChange(event: TModelEvent): void {
    switch (event.kind) {
      case 'position limits change': {
        this.#view?.setState({ currentPositionLimits: event.data });
        break;
      }
      case 'point change': {
        const [id, point] = event.data;
        this.#view?.setState({
          currentPosition: [id, point[0]],
          currentValue: [id, point[1]],
        });
        if (typeof this.#props.onChange === 'function') {
          this.#props.onChange.call(this, this.getState());
        }
        break;
      }
      default:
        break;
    }
  }

  @bind
  private handleViewChange(event: TViewEvent): void {
    switch (event.kind) {
      case 'active status change': {
        const currentActiveStatus = event.data;
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
        break;
      }
      case 'position change': {
        this.#model?.selectPointByPosition(event.data);
        break;
      }
      case 'value change': {
        this.#model?.selectPointByValue(event.data);
        break;
      }
      case 'unknown position change': {
        this.#model?.selectPointByUnknownPosition(event.data);
        break;
      }
      default:
        break;
    }
  }
}

export type { IProps, IState, IData };
export default Presenter;
