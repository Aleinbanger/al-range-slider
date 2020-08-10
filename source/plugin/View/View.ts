import bind from 'bind-decorator';

import Observable from '../Observable/Observable';
import TrackView from './TrackView/TrackView';
import RangeView from './RangeView/RangeView';
import KnobView, { IKnobViewState } from './KnobView/KnobView';
import {
  IPointValue,
  IPositionRatio,
  IViewState,
} from './ViewTypes';
import './View.scss';

class View extends Observable<IViewState> {
  private input: HTMLInputElement;

  private wrapper!: HTMLElement;

  private track!: TrackView;

  private knob!: KnobView;

  private range!: RangeView;

  private state: IViewState;

  private readonly props: { readonly cssClass: string } = { cssClass: 'al-range-slider' }; // temp

  constructor(input: HTMLInputElement) {
    super();
    this.input = input;

    this.state = {
      positionRatio: {
        from: 0,
      },
    };

    this.initialize();
  }

  public getState(): IViewState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public setInputValue({ from, to }: IPointValue): void {
    this.input.value = String(from);
  }

  public setCurrentPositionRatio({ from, to }: IPositionRatio): void {
    this.state.positionRatio = { from, to };

    this.knob.setState({ positionRatio: from });
    this.range.setState({ positionRatio: { from: to!, to: from } }); // refactor everything to reverse to & from
  }

  private initialize(): void {
    this.input.classList.add(`${this.props.cssClass}__input`, `js-${this.props.cssClass}__input`);

    this.wrapper = document.createElement('div');
    this.wrapper.classList.add(`${this.props.cssClass}`, `js-${this.props.cssClass}`);
    this.input.parentNode?.appendChild(this.wrapper);
    this.wrapper.appendChild(this.input);

    this.track = new TrackView({
      parent: this.wrapper,
      cssClass: `${this.props.cssClass}__track`,
    });

    this.range = new RangeView({
      parent: this.track.element,
      cssClass: `${this.props.cssClass}__range`,
    });

    this.knob = new KnobView({
      parent: this.track.element,
      cssClass: `${this.props.cssClass}__knob`,
    });

    this.knob.addObserver(this.updateState);
  }

  @bind
  private updateState({ positionRatio }: IKnobViewState): void {
    const tempState = this.getState();
    tempState.positionRatio.from = positionRatio;
    this.notifyObservers(tempState);

    this.range.setState({ positionRatio: { from: 0, to: positionRatio } });
  }
}

export default View;
