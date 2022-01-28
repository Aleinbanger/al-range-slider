import bind from 'bind-decorator';

import { cloneDeep, isNumeric, isNumberArray } from 'shared/scripts/utils/utils';

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
      const oldProps = this.#props;
      this.#props = { ...oldProps, ...cloneDeep(props) };
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
      this.#updateState();
      this.#props.onUpdate.call(this, this.#state);
    }
  }

  public getState(): IState | undefined {
    this.#updateState();
    return cloneDeep(this.#state);
  }

  #initialize(): void {
    this.#validateProps();
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
      this.#updateState();
      this.#props.onInit.call(this, this.#state, cloneDeep(this.#props));
    }
  }

  #validateProps(): void {
    if (this.#props.valuesArray || this.#props.pointsMap) {
      delete this.#props.range;
    }
    if (this.#props.range) {
      const { min, max, step } = this.#props.range;
      const minStep = 1 / 10 ** this.#props.valuesPrecision;
      if (min > max) {
        this.#props.range.min = max;
        this.#props.range.max = min;
      } else if (min === max) {
        this.#props.range.max = min + minStep;
      }
      const rangeDifference = Number((this.#props.range.max - this.#props.range.min)
        .toFixed(this.#props.valuesPrecision));
      if (step > rangeDifference) {
        this.#props.range.step = rangeDifference;
      }
      if (this.#props.range.step <= 0) {
        this.#props.range.step = minStep;
      }
    }
    if (this.#props.valuesArray) {
      if (!isNumberArray(this.#props.valuesArray)) {
        this.#props.valuesArray = this.#props.valuesArray.map((value) => String(value).trim())
          .filter((value) => Boolean(value));
      }
    } else if (this.#props.pointsMap) {
      const validatePositionRatio = (positionRatio: string) => {
        const numPosition = Number(positionRatio);
        const isPositionValid = !(Number.isNaN(numPosition) || numPosition < 0 || numPosition > 1);
        return isPositionValid;
      };
      this.#props.pointsMap = Object.fromEntries(Object.entries(this.#props.pointsMap)
        .filter(([position]) => validatePositionRatio(position)));
    }
    const {
      initialSelectedValues, range, valuesArray, pointsMap,
    } = this.#props;
    Object.entries(initialSelectedValues).forEach(([id, value]) => {
      if (range && !isNumeric(value)) {
        initialSelectedValues[id] = range.min;
      } else if (valuesArray && !valuesArray.includes(value as never)) {
        [initialSelectedValues[id]] = valuesArray;
      } else if (pointsMap && !Object.values(pointsMap).includes(value)) {
        [initialSelectedValues[id]] = Object.values(pointsMap);
      }
    });
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

  #updateState(): void {
    this.#state = {
      ...this.#model?.getState(),
      ...this.#view?.getState(),
    };
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
        this.#updateState();
        this.#props.onChange.call(this, this.#state);
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
          this.#updateState();
          this.#props.onStart.call(this, this.#state);
        }
      } else if (typeof this.#props.onFinish === 'function') {
        this.#updateState();
        this.#props.onFinish.call(this, this.#state);
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
