import bind from 'bind-decorator';

import Observable from '../Observable/Observable';
import TrackView from './TrackView/TrackView';
import RangeView from './RangeView/RangeView';
import KnobView from './KnobView/KnobView';
import {
  TOrientation,
  TSelectedPosition,
  IViewProps,
  IViewState,
} from './ViewTypes';
import './View.scss';

class View extends Observable<TSelectedPosition> {
  private input: HTMLInputElement;

  private wrapper!: HTMLElement;

  private track!: TrackView;

  private range!: RangeView;

  private knobs: Record<string, KnobView>;

  private readonly props: IViewProps;

  private state: IViewState;

  constructor(input: HTMLInputElement) {
    super();
    this.input = input;
    this.knobs = {};

    this.props = {
      cssClass: 'al-range-slider',
    };
    this.state = {
      selectedPositions: {},
    };

    this.initialize();
  }

  public getState(): IViewState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public setInputValue(id: string, value: string): void {
    this.input.value = value;
  }

  public setSelectedPosition(id: string, positionRatio: number): void {
    if (positionRatio < 0 || positionRatio > 1) {
      throw new Error('Invalid "positionRatio" value, must be in between 0 and 1');
    }
    this.state.selectedPositions[id] = positionRatio;
    this.knobs[id].setPosition(positionRatio);
    if (id === 'from' || id === 'to') {
      this.range.setSelectedPosition(id, positionRatio);
    }
  }

  public initializePoint(id: string): void {
    this.addKnob(id);
    // addInput
  }

  private initialize(): void {
    this.input.classList.add(`${this.props.cssClass}__input`, `js-${this.props.cssClass}__input`);

    this.wrapper = document.createElement('div');
    this.wrapper.setAttribute('class', `${this.props.cssClass} js-${this.props.cssClass}`);
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
  }

  private addKnob(id: string): void {
    this.knobs[id] = new KnobView({
      parent: this.track.element,
      cssClass: `${this.props.cssClass}__knob`,
    });

    const handleKnobPositionChange = (positionRatio: number) => {
      this.handleKnobPositionChange(id, positionRatio);
    };
    this.knobs[id].addObserver('positionChange', handleKnobPositionChange);
  }

  private handleKnobPositionChange(id: string, positionRatio: number): void {
    // if (smooth)
    if (id === 'from' || id === 'to') {
      this.range.setSelectedPosition(id, positionRatio);
    }

    this.notifyObservers('selectedPositionChange', [id, positionRatio]);
  }
}

export default View;
