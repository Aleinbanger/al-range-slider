import bind from 'bind-decorator';

import Observable from '../Observable/Observable';
import WrapperView from './WrapperView/WrapperView';
import TrackView from './TrackView/TrackView';
import RangeView from './RangeView/RangeView';
import KnobView, { IKnobViewState } from './KnobView/KnobView';
import InputView, { IInputViewState } from './InputView/InputView';
import {
  TOrientation,
  IViewProps,
  IViewState,
} from './ViewTypes';
import './View.scss';

class View extends Observable<IViewState> {
  private readonly props: IViewProps;

  private state: IViewState;

  private wrapper: WrapperView;

  private track!: TrackView;

  private range!: RangeView;

  private knobs!: Record<string, KnobView>;

  private inputs!: Record<string, InputView>;

  constructor(parent: HTMLElement) {
    super();
    this.props = {
      cssClass: 'al-range-slider',
    };
    this.state = {
      selectedPosition: ['', 0],
      selectedValue: ['', ''],
    };

    this.wrapper = new WrapperView({
      parent,
      cssClass: this.props.cssClass,
    });

    this.initialize();
  }

  public getState(): IViewState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public setState({ selectedPosition, selectedValue }: IViewState): void {
    if (selectedPosition) {
      this.state.selectedPosition = selectedPosition;
      const [id, positionRatio] = selectedPosition;
      this.knobs[id].setState({ positionRatio });
      if (id === 'from' || id === 'to') {
        this.range.setState({ [id]: positionRatio });
      }
    }

    if (selectedValue) {
      this.state.selectedValue = selectedValue;
      const [id, value] = selectedValue;
      this.inputs[id].setState({ value });
    }
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

    this.range = new RangeView({
      parent: this.track.element,
      cssClass: `${this.props.cssClass}__range`,
    });

    this.knobs = {};
    this.inputs = {};
  }

  private addKnob(id: string): void {
    this.knobs[id] = new KnobView({
      parent: this.track.element,
      cssClass: `${this.props.cssClass}__knob`,
    });

    const handleKnobPositionChange = (state: IKnobViewState) => {
      this.handleKnobPositionChange(id, state);
    };
    this.knobs[id].addObserver(handleKnobPositionChange);
  }

  private handleKnobPositionChange(id: string, { positionRatio }: IKnobViewState): void {
    if (typeof positionRatio !== 'undefined') {
      // if (smooth)
      if (id === 'from' || id === 'to') {
        this.range.setState({ [id]: positionRatio });
      }

      this.notifyObservers({ selectedPosition: [id, positionRatio] });
    }
  }

  private addInput(id: string): void {
    this.inputs[id] = new InputView({
      name: id,
      parent: this.wrapper.element,
      cssClass: `${this.props.cssClass}__input`,
    });

    const handleInputValueChange = (state: IInputViewState) => {
      this.handleInputValueChange(id, state);
    };
    this.inputs[id].addObserver(handleInputValueChange);
  }

  private handleInputValueChange(id: string, { value }: IInputViewState): void {
    if (typeof value !== 'undefined') {
      this.notifyObservers({ selectedValue: [id, value] });
    }
  }
}

export default View;
