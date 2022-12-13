import bind from 'bind-decorator';

import Observable from 'shared/scripts/Observable/Observable';
import { cloneDeep } from 'shared/scripts/utils/utils';
import { ExtractMethodsKeys, ExtractMethodArgs } from 'shared/scripts/utils/typeUtils';

import SubView from './SubView/SubView';
import WrapperView from './SubView/WrapperView/WrapperView';
import TrackView, { TTrackViewEvent } from './SubView/TrackView/TrackView';
import GridView, { TGridViewEvent } from './SubView/GridView/GridView';
import KnobView, { TKnobViewEvent } from './SubView/KnobView/KnobView';
import BarView from './SubView/BarView/BarView';
import InputView, { TInputViewEvent } from './SubView/InputView/InputView';
import TooltipView from './SubView/TooltipView/TooltipView';
import { IViewProps, IViewState, TViewEvent } from './ViewTypes';

require('./View.scss');

interface ISubViews {
  wrapper: WrapperView;
  track?: TrackView;
  grid?: GridView;
  knobs?: Record<string, KnobView | undefined>;
  bars?: Record<string, BarView | undefined>;
  inputs?: Record<string, InputView | undefined>;
  tooltips?: Record<string, TooltipView | undefined>;
}

class View extends Observable<TViewEvent> {
  readonly #parent: HTMLElement;

  readonly #props: IViewProps;

  #state: IViewState;

  #subViews!: ISubViews;

  constructor(parent: HTMLElement, props: IViewProps) {
    super();
    this.#parent = parent;
    this.#props = cloneDeep(props);
    this.#state = {
      selectedValues: {},
      selectedPrettyValues: {},
    };
    this.#initialize();
  }

  public destroy(): void {
    this.#callAllSubViews('destroy');
  }

  public disable(disabled = true): void {
    this.#callAllSubViews('disable', disabled);
  }

  public getState(): IViewState {
    return cloneDeep(this.#state);
  }

  public setState(state: IViewState): void {
    const {
      currentPosition,
      currentPositionLimits,
      currentActiveStatus,
      currentValue,
    } = state;

    if (currentPosition) {
      const [id, positionRatio] = currentPosition;
      this.#state.currentPosition = currentPosition;
      this.#subViews.knobs?.[id]?.setState({ positionRatio });
      this.#updateBar(currentPosition);
    }
    if (currentPositionLimits) {
      const [id, positionRatioLimits] = currentPositionLimits;
      this.#state.currentPositionLimits = currentPositionLimits;
      this.#subViews.knobs?.[id]?.setState({ positionRatioLimits });
    }
    if (currentActiveStatus) {
      const [id, active] = currentActiveStatus;
      this.#state.currentActiveStatus = currentActiveStatus;
      this.#subViews.knobs?.[id]?.setState({ active });
      this.#subViews.inputs?.[id]?.setState({ active });
      this.#subViews.tooltips?.[id]?.setState({ active });
      if (active) {
        this.#stackKnobs(id);
      }
    }
    if (currentValue) {
      const [id, value] = currentValue;
      const prettyValue = this.#props.prettify?.(String(value)) ?? String(value);
      this.#state.currentValue = currentValue;
      if (this.#state.selectedValues) {
        this.#state.selectedValues[id] = value;
      }
      if (this.#state.selectedPrettyValues) {
        this.#state.selectedPrettyValues[id] = prettyValue;
      }
      this.#subViews.inputs?.[id]?.setState({ value: String(value) });
      this.#subViews.tooltips?.[id]?.setState({ value: prettyValue, lastValue: prettyValue });
      if (this.#props.collideTooltips) {
        this.#collideTooltips(id);
      }
    }
  }

  #initialize(): void {
    const {
      cssClass, orientation, theme, selectedIds, grid, showInputs, showTooltips, prettify,
    } = this.#props;
    this.#subViews = {
      wrapper: new WrapperView(this.#parent, { cssClass, orientation, theme }),
    };
    this.#subViews.track = new TrackView(
      this.#subViews.wrapper.element,
      { cssClass: `${cssClass}__track`, orientation },
    );
    this.#subViews.track.addObserver(this.handleTrackGridChange);
    if (grid) {
      const { pointsMap, minTicksStep, marksStep } = grid;
      this.#subViews.grid = new GridView(
        this.#subViews.track.element,
        {
          cssClass: `${cssClass}__grid`,
          orientation,
          pointsMap,
          minTicksStep,
          marksStep,
          prettify,
        },
      );
      this.#subViews.grid.addObserver(this.handleTrackGridChange);
    }

    this.#subViews.knobs = {};
    this.#subViews.bars = {};
    if (showInputs) {
      this.#subViews.inputs = {};
    }
    if (showTooltips) {
      this.#subViews.tooltips = {};
    }
    selectedIds.forEach((id) => {
      this.#addKnob(id);
      this.#addInput(id);
      this.#addTooltip(id);
    });
    this.#addBars(selectedIds);
  }

  @bind
  private handleTrackGridChange(event: TTrackViewEvent | TGridViewEvent): void {
    const { kind, data } = event;
    const isEventCorrect = kind === 'track position change' || kind === 'grid position change';
    if (isEventCorrect) {
      this.notifyObservers({ kind: 'unknown position change', data });
    }
  }

  #addKnob(id: string): void {
    if (this.#subViews.knobs) {
      const { cssClass, orientation, allowSmoothTransition } = this.#props;
      this.#subViews.knobs[id] = new KnobView(
        this.#subViews.track?.element ?? this.#subViews.wrapper.element,
        { cssClass: `${cssClass}__knob`, orientation, allowSmoothTransition },
      );
      this.#subViews.knobs[id]?.addObserver(this.handleKnobChange.bind(this, id));
    }
  }

  private handleKnobChange(id: string, event: TKnobViewEvent): void {
    switch (event.kind) {
      case 'knob active change': {
        const active = event.data;
        this.notifyObservers({ kind: 'active status change', data: [id, active] });
        break;
      }
      case 'knob position change': {
        const positionRatio = event.data;
        this.notifyObservers({ kind: 'position change', data: [id, positionRatio] });
        if (this.#props.allowSmoothTransition) {
          this.#updateBar([id, positionRatio]);
        }
        break;
      }
      default:
        break;
    }
  }

  #stackKnobs(currentId: string): void {
    if (this.#subViews.knobs) {
      const minZIndex = 2;
      const newZIndexes: number[] = [];
      const sortedKnobs = Object.values(this.#subViews.knobs).sort((knob1, knob2) => (
        (knob1?.getState()?.zIndex ?? minZIndex) - (knob2?.getState()?.zIndex ?? minZIndex)
      ));
      sortedKnobs.forEach((knob, index) => {
        const zIndex = index + minZIndex;
        newZIndexes.push(zIndex);
        knob?.setState({ zIndex });
      });
      this.#subViews.knobs[currentId]?.setState({ zIndex: Math.max(...newZIndexes) + 1 });
    }
  }

  #addBars(ids: string[]): void {
    const { bars } = this.#subViews;
    if (bars) {
      const { cssClass, orientation } = this.#props;
      const fullIds = new Set(ids.map((id) => View.#getBarId(id)?.fullId ?? ''));
      fullIds.delete('');
      fullIds.forEach((id) => {
        bars[id] = new BarView(
          this.#subViews.track?.element ?? this.#subViews.wrapper.element,
          { cssClass: `${cssClass}__bar`, orientation },
        );
      });
    }
  }

  #updateBar([id, positionRatio]: [string, number]): void {
    const { bars } = this.#subViews;
    const barId = View.#getBarId(id);
    const isBarDefined = bars && barId;
    if (isBarDefined) {
      bars[barId.fullId]?.setState({ [barId.match]: positionRatio });
    }
  }

  static #getBarId(id: string): {
    match: 'from';
    fullId: string;
  } | {
    match: 'to';
    fullId: string;
  } | null {
    const fromMatch = id.match(/^(from)(.*)$/i);
    const toMatch = id.match(/^(to)(.*)$/i);
    if (fromMatch) {
      const pairedId = `to${fromMatch[2]}`;
      const fullId = `${id}-${pairedId}`;
      return { match: 'from' as const, fullId };
    }
    if (toMatch) {
      const pairedId = `from${toMatch[2]}`;
      const fullId = `${pairedId}-${id}`;
      return { match: 'to' as const, fullId };
    }
    return null;
  }

  #addInput(id: string): void {
    if (this.#subViews.inputs) {
      const { cssClass, orientation, showInputs } = this.#props;
      const hidden = showInputs === 'hidden';
      this.#subViews.inputs[id] = new InputView(
        this.#subViews.wrapper.element,
        {
          cssClass: `${cssClass}__input`,
          orientation,
          name: id,
          hidden,
        },
      );
      this.#subViews.inputs[id]?.addObserver(this.handleInputChange.bind(this, id));
    }
  }

  private handleInputChange(id: string, event: TInputViewEvent): void {
    switch (event.kind) {
      case 'input active change': {
        const active = event.data;
        this.notifyObservers({ kind: 'active status change', data: [id, active] });
        break;
      }
      case 'input value change': {
        const value = event.data;
        this.notifyObservers({ kind: 'value change', data: [id, value] });
        break;
      }
      default:
        break;
    }
  }

  #addTooltip(id: string): void {
    if (this.#subViews.tooltips) {
      const { cssClass, orientation } = this.#props;
      this.#subViews.tooltips[id] = new TooltipView(
        this.#subViews.knobs?.[id]?.element ?? this.#subViews.wrapper.element,
        { cssClass: `${cssClass}__tooltip`, orientation },
      );
    }
  }

  #collideTooltips(currentId:string): void {
    const { tooltips } = this.#subViews;
    const resetTooltip = (tooltip?: TooltipView) => {
      const value = tooltip?.getState()?.lastValue;
      tooltip?.setState({ hidden: false, value, mergedWith: new Set() });
    };
    if (tooltips) {
      const currentTooltip = tooltips[currentId];
      const mergedTooltipsIds = currentTooltip?.getState()?.mergedWith;
      const isCurrentTooltipMerged = currentTooltip
        && mergedTooltipsIds && mergedTooltipsIds.size > 0;
      if (isCurrentTooltipMerged) {
        mergedTooltipsIds.delete(currentId);
        mergedTooltipsIds.forEach((id) => {
          resetTooltip(tooltips[id]);
        });
        resetTooltip(currentTooltip);
        mergedTooltipsIds.forEach((id) => {
          this.#checkTooltipsCollision(id, [...mergedTooltipsIds]);
        });
        this.#checkTooltipsCollision(currentId, [...mergedTooltipsIds]);
      }
      this.#checkTooltipsCollision(currentId, Object.keys(tooltips));
    }
  }

  #checkTooltipsCollision(currentId: string, restIds: string[]): void {
    const { tooltips, knobs } = this.#subViews;
    const currentTooltip = tooltips?.[currentId];
    const currentRect = currentTooltip?.element.getBoundingClientRect();
    const sortIds = (ids: string[]) => ids.sort((id1, id2) => (
      (knobs?.[id1]?.getState()?.positionRatio ?? 0)
        - (knobs?.[id2]?.getState()?.positionRatio ?? 0)));
    // eslint-disable-next-line no-restricted-syntax
    for (const nextId of sortIds(restIds)) {
      const nextTooltip = tooltips?.[nextId];
      const nextRect = nextTooltip?.element.getBoundingClientRect();
      const isComparisonValid = currentId !== nextId && currentTooltip && currentRect
        && nextTooltip && nextRect;
      if (isComparisonValid) {
        const isColliding = this.#props.orientation === 'vertical'
          ? currentRect.top < nextRect.bottom && currentRect.bottom > nextRect.top
          : currentRect.left < nextRect.right && currentRect.right > nextRect.left;
        if (isColliding) {
          const currentTooltipMergedWith = currentTooltip.getState()?.mergedWith;
          const nextTooltipMergedWith = nextTooltip.getState()?.mergedWith;
          currentTooltipMergedWith?.add(nextId);
          nextTooltipMergedWith?.add(currentId);
          const mergedWith = new Set([
            ...(currentTooltipMergedWith ?? []),
            ...(nextTooltipMergedWith ?? []),
          ]);
          const value = sortIds([...mergedWith])
            .map((id) => tooltips?.[id]?.getState()?.lastValue)
            .join(this.#props.tooltipsSeparator);
          currentTooltip.setState({ value });
          nextTooltip.setState({ hidden: true });
          mergedWith.forEach((id) => {
            tooltips[id]?.setState({ mergedWith });
          });
          break;
        }
      }
    }
  }

  #callAllSubViews<T extends ExtractMethodsKeys<SubView>>(
    method: T, arg?: ExtractMethodArgs<SubView, T>, subViews = this.#subViews,
  ): void {
    Object.values(subViews).forEach((subView) => {
      const isMethodValid = subView instanceof SubView && typeof subView[method] === 'function';
      if (isMethodValid) {
        (subView[method] as ((tArg: typeof arg) => void)).call(subView, arg);
      } else if (typeof subView === 'object') {
        this.#callAllSubViews(method, arg, subView as ISubViews);
      }
    });
  }
}

export type {
  IViewProps, IViewState, ISubViews, TViewEvent,
};
export default View;
