import bind from 'bind-decorator';

import { cloneDeep, getClosestNumber } from 'shared/scripts/utils';
import { ExtractFunctionKeys, ExtractFunctionArgs } from 'shared/scripts/typeUtils';

import Observable from '../Observable/Observable';
import SubView from './SubView/SubView';
import WrapperView from './SubView/WrapperView/WrapperView';
import TrackView, { ITrackViewState } from './SubView/TrackView/TrackView';
import GridView, { IGridViewState } from './SubView/GridView/GridView';
import KnobView, { IKnobViewState } from './SubView/KnobView/KnobView';
import BarView from './SubView/BarView/BarView';
import InputView, { IInputViewState } from './SubView/InputView/InputView';
import TooltipView from './SubView/TooltipView/TooltipView';
import { IViewProps, IViewState } from './ViewTypes';
import './View.scss';

class View extends Observable<IViewState> {
  private readonly parent: HTMLElement;

  private readonly props: IViewProps;

  private state: IViewState;

  private subViews!: {
    wrapper: WrapperView;
    track?: TrackView;
    grid?: GridView;
    knobs?: Record<string, KnobView | undefined>;
    bars?: Record<string, BarView | undefined>;
    inputs?: Record<string, InputView | undefined>;
    tooltips?: Record<string, TooltipView | undefined>;
  };

  constructor(parent: HTMLElement, props: IViewProps) {
    super();
    this.parent = parent;
    this.props = cloneDeep(props);
    this.state = {};
    this.initialize();
  }

  public destroy(): void {
    View.callAllSubViews(this.subViews, 'destroy');
  }

  public disable(disabled = true): void {
    View.callAllSubViews(this.subViews, 'disable', disabled);
  }

  public getState(): IViewState {
    return cloneDeep(this.state);
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
      this.state.currentPosition = currentPosition;
      this.subViews.knobs?.[id]?.setState({ positionRatio });
      this.updateBar(currentPosition);
    }
    if (currentPositionLimits) {
      const [id, positionRatioLimits] = currentPositionLimits;
      this.state.currentPositionLimits = currentPositionLimits;
      this.subViews.knobs?.[id]?.setState({ positionRatioLimits });
    }
    if (currentActiveStatus) {
      const [id, active] = currentActiveStatus;
      this.state.currentActiveStatus = currentActiveStatus;
      this.subViews.knobs?.[id]?.setState({ active });
      this.subViews.inputs?.[id]?.setState({ active });
      this.subViews.tooltips?.[id]?.setState({ active });
      if (active) {
        this.stackKnobs(id);
      }
    }
    if (currentValue) {
      const [id, value] = currentValue;
      this.state.currentValue = currentValue;
      this.subViews.inputs?.[id]?.setState({ value });
      this.subViews.tooltips?.[id]?.setState({ value, lastValue: value });
      if (this.props.collideTooltips) {
        this.collideTooltips(id);
      }
    }
  }

  private initialize(): void {
    const { parent } = this;
    const {
      cssClass, orientation, theme, selectedIds, grid, showInputs, showTooltips,
    } = this.props;
    this.subViews = {
      wrapper: new WrapperView(parent, { cssClass, orientation, theme }),
    };
    this.subViews.track = new TrackView(
      this.subViews.wrapper.element,
      { cssClass: `${cssClass}__track`, orientation },
    );
    this.subViews.track.addObserver(this.handleTrackAndGridPositionChange);
    if (grid) {
      const { pointsMap, minTicksStep, marksStep } = grid;
      this.subViews.grid = new GridView(
        this.subViews.track.element,
        {
          cssClass: `${cssClass}__grid`,
          orientation,
          pointsMap,
          minTicksStep,
          marksStep,
        },
      );
      this.subViews.grid.addObserver(this.handleTrackAndGridPositionChange);
    }

    this.subViews.knobs = {};
    this.subViews.bars = {};
    if (showInputs) {
      this.subViews.inputs = {};
    }
    if (showTooltips) {
      this.subViews.tooltips = {};
    }
    selectedIds.forEach((id) => {
      this.addKnob(id);
      this.addInput(id);
      this.addTooltip(id);
    });
    this.addBars(selectedIds);
  }

  @bind
  private handleTrackAndGridPositionChange({ positionRatio }:
  ITrackViewState | IGridViewState): void {
    if (typeof positionRatio !== 'undefined') {
      this.notifyObservers({ unknownPosition: positionRatio });
    }
  }

  private addKnob(id: string): void {
    if (this.subViews.knobs) {
      const { cssClass, orientation, allowSmoothTransition } = this.props;
      this.subViews.knobs[id] = new KnobView(
        this.subViews.track?.element ?? this.subViews.wrapper.element,
        { cssClass: `${cssClass}__knob`, orientation, allowSmoothTransition },
      );
      this.subViews.knobs[id]?.addObserver(this.handleKnobActiveStatusChange.bind(this, id));
      this.subViews.knobs[id]?.addObserver(this.handleKnobPositionChange.bind(this, id));
    }
  }

  private handleKnobActiveStatusChange(id: string, { active }: IKnobViewState): void {
    if (typeof active !== 'undefined') {
      this.notifyObservers({ currentActiveStatus: [id, active] });
    }
  }

  private handleKnobPositionChange(id: string, { positionRatio }: IKnobViewState): void {
    if (typeof positionRatio !== 'undefined') {
      this.notifyObservers({ currentPosition: [id, positionRatio] });
      if (this.props.allowSmoothTransition) {
        this.updateBar([id, positionRatio]);
      }
    }
  }

  private stackKnobs(currentId: string): void {
    if (this.subViews.knobs) {
      const minZIndex = 2;
      const newZIndexes: number[] = [];
      const sortedKnobs = Object.values(this.subViews.knobs).sort((knob1, knob2) => (
        (knob1?.getState()?.zIndex ?? minZIndex) - (knob2?.getState()?.zIndex ?? minZIndex)
      ));
      sortedKnobs.forEach((knob, index) => {
        const zIndex = index + minZIndex;
        newZIndexes.push(zIndex);
        knob?.setState({ zIndex });
      });
      this.subViews.knobs[currentId]?.setState({ zIndex: Math.max(...newZIndexes) + 1 });
    }
  }

  private addBars(ids: string[]): void {
    if (this.subViews.bars) {
      const { cssClass, orientation } = this.props;
      const usedIds: string[] = [];
      ids.forEach((id) => {
        if (!usedIds.some((tmpId) => tmpId === id)) {
          const fromMatch = id.match(/^(from)(.*)$/i);
          const toMatch = id.match(/^(to)(.*)$/i);
          let pairedId = '';
          let combinedId = '';
          if (fromMatch) {
            pairedId = `to${fromMatch[2]}`;
            combinedId = `${id}${pairedId}`;
          } else if (toMatch) {
            pairedId = `from${toMatch[2]}`;
            combinedId = `${pairedId}${id}`;
          }
          if (ids.includes(pairedId)) {
            usedIds.push(pairedId);
          }
          if (this.subViews.bars && combinedId) {
            this.subViews.bars[combinedId] = new BarView(
              this.subViews.track?.element ?? this.subViews.wrapper.element,
              { cssClass: `${cssClass}__bar`, orientation },
            );
          }
        }
      });
    }
  }

  private updateBar([id, positionRatio]: [string, number]): void {
    if (this.subViews.bars) {
      const fromMatch = id.match(/^(from)(.*)$/i);
      const toMatch = id.match(/^(to)(.*)$/i);
      if (fromMatch) {
        const pairedId = `to${fromMatch[2]}`;
        const combinedId = `${id}${pairedId}`;
        this.subViews.bars[combinedId]?.setState({ from: positionRatio });
      } else if (toMatch) {
        const pairedId = `from${toMatch[2]}`;
        const combinedId = `${pairedId}${id}`;
        this.subViews.bars[combinedId]?.setState({ to: positionRatio });
      }
    }
  }

  private addInput(id: string): void {
    if (this.subViews.inputs) {
      const { cssClass, orientation, showInputs } = this.props;
      const hidden = showInputs === 'hidden';
      this.subViews.inputs[id] = new InputView(
        this.subViews.wrapper.element,
        {
          cssClass: `${cssClass}__input`,
          orientation,
          name: id,
          hidden,
        },
      );
      this.subViews.inputs[id]?.addObserver(this.handleInputActiveStatusChange.bind(this, id));
      this.subViews.inputs[id]?.addObserver(this.handleInputValueChange.bind(this, id));
    }
  }

  private handleInputActiveStatusChange(id: string, { active }: IInputViewState): void {
    if (typeof active !== 'undefined') {
      this.notifyObservers({ currentActiveStatus: [id, active] });
    }
  }

  private handleInputValueChange(id: string, { value }: IInputViewState): void {
    if (typeof value !== 'undefined') {
      this.notifyObservers({ currentValue: [id, value] });
    }
  }

  private addTooltip(id: string): void {
    if (this.subViews.tooltips) {
      const { cssClass, orientation } = this.props;
      this.subViews.tooltips[id] = new TooltipView(
        this.subViews.knobs?.[id]?.element ?? this.subViews.wrapper.element,
        { cssClass: `${cssClass}__tooltip`, orientation },
      );
    }
  }

  private collideTooltips(currentId: string): void {
    if (this.subViews.tooltips && this.subViews.knobs) {
      const tooltips = Object.entries(this.subViews.tooltips);
      const collidedIdsSets: Set<string>[] = [];
      tooltips.forEach(([tooltipId, tooltip]) => {
        if (tooltip) {
          const currentRect = tooltip.element.getBoundingClientRect();
          const collidedIdsSet = new Set([tooltipId]);
          tooltips.forEach(([nextTooltipId, nextTooltip]) => {
            if (nextTooltip && nextTooltipId !== tooltipId) {
              const nextRect = nextTooltip.element.getBoundingClientRect();
              let isColliding = false;
              if (this.props.orientation === 'vertical') {
                const isCollidingOnTop = currentRect.top < nextRect.bottom
                  && currentRect.top > nextRect.top;
                const isCollidingOnBottom = currentRect.bottom > nextRect.top
                  && currentRect.bottom < nextRect.bottom;
                isColliding = isCollidingOnTop || isCollidingOnBottom;
              } else {
                const isCollidingOnLeft = currentRect.left < nextRect.right
                  && currentRect.left > nextRect.left;
                const isCollidingOnRight = currentRect.right > nextRect.left
                  && currentRect.right < nextRect.right;
                isColliding = isCollidingOnLeft || isCollidingOnRight;
              }
              if (isColliding) {
                collidedIdsSet.add(nextTooltipId);
              }
            }
          });
          collidedIdsSets.push(collidedIdsSet);
        }
      });
      const mergedCollidedIdsSets: Set<string>[] = [];
      const usedCollidedIdsSets: Set<string>[] = [];
      collidedIdsSets.forEach((idsSet) => {
        if (!usedCollidedIdsSets.some((tmpSet) => tmpSet === idsSet)) {
          let mergedCollidedIdsSet = new Set([...idsSet]);
          collidedIdsSets.forEach((nextIdsSet) => {
            if (idsSet !== nextIdsSet) {
              const isIdDuplicated = [...idsSet].some((tmpSet) => nextIdsSet.has(tmpSet));
              if (isIdDuplicated) {
                mergedCollidedIdsSet = new Set([...mergedCollidedIdsSet, ...nextIdsSet]);
                usedCollidedIdsSets.push(nextIdsSet);
              }
            }
          });
          mergedCollidedIdsSets.push(mergedCollidedIdsSet);
        }
      });
      mergedCollidedIdsSets.forEach((idsSet) => {
        const idsArray = [...idsSet];
        if (idsArray.length > 1) {
          let mainId = '';
          let lastUsedId = idsArray.find((tmpId) => this.subViews.tooltips?.[tmpId]?.getState()?.lastUsed) ?? '';
          if (idsSet.has(currentId)) {
            mainId = currentId;
            tooltips.forEach(([, tooltip]) => {
              if (tooltip?.getState()?.lastUsed) {
                tooltip.setState({ lastUsed: false });
              }
            });
            this.subViews.tooltips?.[currentId]?.setState({ lastUsed: true });
          } else if (idsSet.has(lastUsedId)) {
            mainId = lastUsedId;
          } else {
            const closestPosition = getClosestNumber(
              idsArray.map((tmpId) => this.subViews.knobs?.[tmpId]?.getState()?.positionRatio ?? 0),
              this.subViews.knobs?.[currentId]?.getState()?.positionRatio ?? 0,
            );
            lastUsedId = idsArray.find((tmpId) => (
              this.subViews.knobs?.[tmpId]?.getState()?.positionRatio === closestPosition)) ?? '';
            if (lastUsedId !== '') {
              mainId = lastUsedId;
            }
          }
          const sortedIdsArray = idsArray.sort((id1, id2) => (
            (this.subViews.knobs?.[id1]?.getState()?.positionRatio ?? 0)
              - (this.subViews.knobs?.[id2]?.getState()?.positionRatio ?? 0)));
          const value = sortedIdsArray.map((tmpId) => this.subViews.tooltips?.[tmpId]?.getState()?.lastValue).join('; ');
          this.subViews.tooltips?.[mainId]?.setState({ value, hidden: false });
          idsArray.forEach((tmpId) => {
            if (tmpId !== mainId) {
              this.subViews.tooltips?.[tmpId]?.setState({ hidden: true });
            }
          });
        } else {
          const tmpId = idsArray[0];
          this.subViews.tooltips?.[tmpId]?.setState({
            value: this.subViews.tooltips[tmpId]?.getState()?.lastValue,
            hidden: false,
          });
        }
      });
    }
  }

  private static callAllSubViews<T extends ExtractFunctionKeys<SubView>>(
    subViews: View['subViews'], method: T, arg?: ExtractFunctionArgs<SubView, T>,
  ): void {
    Object.values(subViews).forEach((subView) => {
      if (subView instanceof SubView && typeof subView[method] === 'function') {
        (subView[method] as ((tArg: typeof arg) => void)).call(subView, arg);
      } else if (typeof subView === 'object') {
        View.callAllSubViews(subView as unknown as View['subViews'], method, arg);
      }
    });
  }
}

export type { IViewProps, IViewState };
export default View;
