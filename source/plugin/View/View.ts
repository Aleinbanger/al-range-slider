import bind from 'bind-decorator';

import { getClosestNumber } from 'shared/scripts/utils';

import Observable from '../Observable/Observable';
import WrapperView from './WrapperView/WrapperView';
import TrackView, { ITrackViewState } from './TrackView/TrackView';
import GridView, { IGridViewState } from './GridView/GridView';
import KnobView, { IKnobViewState } from './KnobView/KnobView';
import BarView from './BarView/BarView';
import InputView, { IInputViewState } from './InputView/InputView';
import TooltipView from './TooltipView/TooltipView';
import {
  TPointsMap,
  IViewProps,
  IViewState,
} from './ViewTypes';
import './View.scss';

class View extends Observable<IViewState> {
  private readonly props: IViewProps;

  private state: IViewState;

  private wrapper!: WrapperView;

  private track!: TrackView;

  private grid!: GridView;

  private knobs!: Record<string, KnobView>;

  private bars!: Record<string, BarView>;

  private inputs!: Record<string, InputView>;

  private tooltips!: Record<string, TooltipView>;

  constructor(props: IViewProps) {
    super();
    this.props = props;
    this.state = {};
    this.initialize();
  }

  public getState(): IViewState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public setState(state: IViewState): void {
    const {
      currentPosition,
      currentPositionLimits,
      currentActiveStatus,
      currentValue,
    } = state;

    if (currentPosition) {
      this.state.currentPosition = currentPosition;
      const [id, positionRatio] = currentPosition;
      this.knobs[id].setState({ positionRatio });
      this.updateBar(currentPosition);
    }
    if (currentPositionLimits) {
      this.state.currentPositionLimits = currentPositionLimits;
      const [id, positionRatioLimits] = currentPositionLimits;
      this.knobs[id].setState({ positionRatioLimits });
    }
    if (currentActiveStatus) {
      this.state.currentActiveStatus = currentActiveStatus;
      const [id, active] = currentActiveStatus;
      this.knobs[id].setState({ active });
      this.tooltips[id].setState({ active });
    }
    if (currentValue) {
      this.state.currentValue = currentValue;
      const [id, value] = currentValue;
      this.inputs[id].setState({ value });
      this.tooltips[id].setState({ value });
      // if (collideTooltips)
      this.collideTooltips(id);
    }
  }

  public initializeGrid(
    { pointsMap, minTicksGap, marksStep }: {
      pointsMap: TPointsMap; minTicksGap: number; marksStep: number;
    },
  ): void {
    this.grid = new GridView({
      parent: this.track.element,
      cssClass: `${this.props.cssClass}__grid`,
      orientation: this.props.orientation,
      pointsMap,
      minTicksGap,
      marksStep,
    });
    this.grid.addObserver(this.handleGridPositionChange);
  }

  public initializeBars(ids: string[]): void {
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
        if (combinedId) {
          this.bars[combinedId] = new BarView({
            parent: this.track.element,
            cssClass: `${this.props.cssClass}__bar`,
            orientation: this.props.orientation,
          });
        }
      }
    });
  }

  public initializePoint(id: string): void {
    this.addKnob(id);
    // if (showInputs)
    this.addInput(id);
    // if (showTooltips)
    this.addTooltip(id);
  }

  private initialize(): void {
    this.wrapper = new WrapperView({
      parent: this.props.parent,
      cssClass: this.props.cssClass,
      orientation: this.props.orientation,
    });

    this.track = new TrackView({
      parent: this.wrapper.element,
      cssClass: `${this.props.cssClass}__track`,
      orientation: this.props.orientation,
    });
    this.track.addObserver(this.handleTrackPositionChange);

    this.knobs = {};
    this.bars = {};
    this.inputs = {};
    this.tooltips = {};
  }

  @bind
  private handleGridPositionChange({ positionRatio }: IGridViewState): void {
    if (typeof positionRatio !== 'undefined') {
      this.notifyObservers({ unknownPosition: positionRatio });
    }
  }

  @bind
  private handleTrackPositionChange({ positionRatio }: ITrackViewState): void {
    if (typeof positionRatio !== 'undefined') {
      this.notifyObservers({ unknownPosition: positionRatio });
    }
  }

  private addKnob(id: string): void {
    this.knobs[id] = new KnobView({
      parent: this.track.element,
      cssClass: `${this.props.cssClass}__knob`,
      orientation: this.props.orientation,
    });

    const handleKnobActiveStatusChange = (state: IKnobViewState) => {
      this.handleKnobActiveStatusChange(id, state);
    };
    const handleKnobPositionChange = (state: IKnobViewState) => {
      this.handleKnobPositionChange(id, state);
    };
    this.knobs[id].addObserver(handleKnobActiveStatusChange);
    this.knobs[id].addObserver(handleKnobPositionChange);
  }

  private handleKnobActiveStatusChange(id: string, { active }: IKnobViewState): void {
    if (typeof active !== 'undefined') {
      this.notifyObservers({ currentActiveStatus: [id, active] });
    }
  }

  private handleKnobPositionChange(id: string, { positionRatio }: IKnobViewState): void {
    if (typeof positionRatio !== 'undefined') {
      this.notifyObservers({ currentPosition: [id, positionRatio] });

      // if (smooth)
      this.updateBar([id, positionRatio]);
    }
  }

  private updateBar([id, positionRatio]: [string, number]): void {
    const fromMatch = id.match(/^(from)(.*)$/i);
    const toMatch = id.match(/^(to)(.*)$/i);
    if (fromMatch) {
      const pairedId = `to${fromMatch[2]}`;
      const combinedId = `${id}${pairedId}`;
      this.bars[combinedId].setState({ from: positionRatio });
    } else if (toMatch) {
      const pairedId = `from${toMatch[2]}`;
      const combinedId = `${pairedId}${id}`;
      this.bars[combinedId].setState({ to: positionRatio });
    }
  }

  private addInput(id: string): void {
    this.inputs[id] = new InputView({
      name: id,
      parent: this.wrapper.element,
      cssClass: `${this.props.cssClass}__input`,
      orientation: this.props.orientation,
    });

    const handleInputActiveStatusChange = (state: IInputViewState) => {
      this.handleInputActiveStatusChange(id, state);
    };
    const handleInputValueChange = (state: IInputViewState) => {
      this.handleInputValueChange(id, state);
    };
    this.inputs[id].addObserver(handleInputActiveStatusChange);
    this.inputs[id].addObserver(handleInputValueChange);
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
    this.tooltips[id] = new TooltipView({
      parent: this.knobs[id].element,
      cssClass: `${this.props.cssClass}__tooltip`,
      orientation: this.props.orientation,
    });
  }

  private collideTooltips(currentId: string): void {
    const tooltips = Object.entries(this.tooltips);
    const collidedIdsSets: Set<string>[] = [];
    tooltips.forEach(([tooltipId, tooltip]) => {
      const currentRect = tooltip.element.getBoundingClientRect();
      const collidedIdsSet = new Set([tooltipId]);
      tooltips.forEach(([nextTooltipId, nextTooltip]) => {
        if (nextTooltipId !== tooltipId) {
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
        let lastUsedId = idsArray.find((tmpId) => this.tooltips[tmpId].getState().lastUsed) ?? '';
        if (idsSet.has(currentId)) {
          mainId = currentId;
          tooltips.forEach(([, tooltip]) => {
            if (tooltip.getState().lastUsed) {
              tooltip.setState({ lastUsed: false });
            }
          });
          this.tooltips[currentId].setState({ lastUsed: true });
        } else if (idsSet.has(lastUsedId)) {
          mainId = lastUsedId;
        } else {
          const closestPosition = getClosestNumber(
            this.knobs[currentId].getState().positionRatio ?? 0,
            idsArray.map((tmpId) => this.knobs[tmpId].getState().positionRatio ?? 0),
          );
          lastUsedId = idsArray.find((tmpId) => (
            this.knobs[tmpId].getState().positionRatio === closestPosition)) ?? '';
          if (lastUsedId !== '') {
            mainId = lastUsedId;
          }
        }
        const sortedIdsArray = idsArray.sort((id1, id2) => (
          (this.knobs[id1].getState().positionRatio ?? 0)
            - (this.knobs[id2].getState().positionRatio ?? 0)));
        const value = sortedIdsArray.map((tmpId) => this.inputs[tmpId].getState().value).join('; ');
        this.tooltips[mainId].setState({ value, hidden: false });
        idsArray.forEach((tmpId) => {
          if (tmpId !== mainId) {
            this.tooltips[tmpId].setState({ hidden: true });
          }
        });
      } else {
        const tmpId = idsArray[0];
        this.tooltips[tmpId].setState({
          value: this.inputs[tmpId].getState().value,
          hidden: false,
        });
      }
    });
  }
}

export default View;
