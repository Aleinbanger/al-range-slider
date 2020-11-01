import bind from 'bind-decorator';

import Observable from '../Observable/Observable';
import WrapperView from './WrapperView/WrapperView';
import TrackView, { ITrackViewState } from './TrackView/TrackView';
import GridView, { IGridViewState } from './GridView/GridView';
import RangeView from './RangeView/RangeView';
import KnobView, { IKnobViewState } from './KnobView/KnobView';
import InputView, { IInputViewState } from './InputView/InputView';
import {
  TOrientation,
  TPointsMap,
  IViewProps,
  IViewState,
} from './ViewTypes';
import './View.scss';

class View extends Observable<IViewState> {
  private readonly props: IViewProps;

  private state: IViewState;

  private wrapper: WrapperView;

  private track!: TrackView;

  private grid!: GridView;

  private range!: RangeView;

  private knobs!: Record<string, KnobView>;

  private inputs!: Record<string, InputView>;

  constructor(parent: HTMLElement) {
    super();
    this.props = {
      cssClass: 'al-range-slider',
    };
    this.state = {};

    this.wrapper = new WrapperView({
      parent,
      cssClass: this.props.cssClass,
    });

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
      if (id === 'from' || id === 'to') {
        this.range.setState({ [id]: positionRatio });
      }
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
    }
    if (currentValue) {
      this.state.currentValue = currentValue;
      const [id, value] = currentValue;
      this.inputs[id].setState({ value });
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
      pointsMap,
      minTicksGap,
      marksStep,
    });
    this.grid.addObserver(this.handleGridPositionChange);
  }

  public initializePoint(id: string): void {
    this.addKnob(id);
    this.addInput(id);
  }

  private initialize(): void {
    this.track = new TrackView({
      parent: this.wrapper.element,
      cssClass: `${this.props.cssClass}__track`,
    });
    this.track.addObserver(this.handleTrackPositionChange);

    this.range = new RangeView({
      parent: this.track.element,
      cssClass: `${this.props.cssClass}__range`,
    });

    this.knobs = {};
    this.inputs = {};
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
    if (active) {
      this.notifyObservers({ currentActiveStatus: [id, active] });
    }
  }

  private handleKnobPositionChange(id: string, { positionRatio }: IKnobViewState): void {
    if (typeof positionRatio !== 'undefined') {
      this.notifyObservers({ currentPosition: [id, positionRatio] });

      // if (smooth)
      if (id === 'from' || id === 'to') {
        this.range.setState({ [id]: positionRatio });
      }
    }
  }

  private addInput(id: string): void {
    this.inputs[id] = new InputView({
      name: id,
      parent: this.wrapper.element,
      cssClass: `${this.props.cssClass}__input`,
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
    if (active) {
      this.notifyObservers({ currentActiveStatus: [id, active] });
      this.setState({ currentActiveStatus: [id, active] });
    } else {
      this.setState({ currentActiveStatus: [id, false] });
    }
  }

  private handleInputValueChange(id: string, { value }: IInputViewState): void {
    if (typeof value !== 'undefined') {
      this.notifyObservers({ currentValue: [id, value] });
    }
  }
}

export default View;
