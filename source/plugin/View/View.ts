import bind from 'bind-decorator';

import Observable from '../Observable/Observable';
import {
  IPointValue,
  IPositionRatio,
  IViewState,
} from './ViewTypes';
import './View.scss';

class View extends Observable<IViewState> {
  private $input: JQuery<HTMLElement>;

  private $wrapper!: JQuery<HTMLElement>;

  private $track!: JQuery<HTMLElement>;

  private $trackOffset!: JQuery.Coordinates;

  private $trackWidth!: number;

  private $knob!: JQuery<HTMLElement>;

  private $range!: JQuery<HTMLElement>;

  private state: IViewState;

  constructor(input: HTMLElement) {
    super();
    this.state = {
      positionRatio: {
        from: 0,
      },
    };

    this.$input = $(input);
    this.initialize();
    this.bindEventListeners();
  }

  public getState(): IViewState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public setInputValue({ from, to }: IPointValue): void {
    this.$input.val(from);
  }

  public setCurrentPositionRatio({ from, to }: IPositionRatio): void {
    this.state.positionRatio = { from, to };
  }

  public renderPosition({ from, to }: IPositionRatio): void {
    const percentFrom = from * 100;
    this.$knob.css('left', `${percentFrom}%`);
    this.$range.css('width', `${percentFrom}%`);
  }

  private initialize(): void {
    this.renderMarkup();
  }

  private renderMarkup(): void {
    this.$input.addClass('al-range-slider__input js-al-range-slider__input');

    this.$wrapper = $(this.$input).wrap($('<div>', {
      class: 'al-range-slider js-al-range-slider',
    })).parent();

    this.$track = $('<div>', {
      class: 'al-range-slider__track js-al-range-slider__track',
    });
    this.$track.appendTo(this.$wrapper);

    this.$knob = $('<span>', {
      class: 'al-range-slider__knob js-al-range-slider__knob',
    });
    this.$knob.appendTo(this.$track);

    this.$range = $('<span>', {
      class: 'al-range-slider__range js-al-range-slider__range',
    });
    this.$range.appendTo(this.$track);
  }

  private bindEventListeners(): void {
    // this.$track.on('click', this.handleTrackClick);
    this.$knob.on('mousedown', this.handleKnobMouseDown);
  }

  // @bind
  // private handleTrackClick(event: JQuery.Event): void {

  // }

  @bind
  private handleKnobMouseDown(event: JQuery.Event): void {
    event.preventDefault();
    // get track from parent() when separated
    this.$trackOffset = this.$track.offset() as JQuery.Coordinates;
    this.$trackWidth = this.$track.width() as number;

    this.$knob.addClass('al-range-slider__knob_active');

    $(document).on('mousemove', this.handleKnobMouseMove);
    $(document).on('mouseup', this.handleKnobMouseUp);
  }

  @bind
  private handleKnobMouseMove(event: JQuery.Event): void {
    event.preventDefault();
    const positionRatioFrom = this.getRelativeMousePositionRatio(event);
    const tempState = this.getState();
    tempState.positionRatio = {
      from: positionRatioFrom,
    };

    // if (smooth === true)
    this.renderPosition(tempState.positionRatio);

    this.notifyObservers(tempState);
  }

  @bind
  private handleKnobMouseUp(): void {
    this.$knob.removeClass('al-range-slider__knob_active');

    console.log(this.state.positionRatio.from);
    this.renderPosition(this.state.positionRatio);

    $(document).off('mousemove', this.handleKnobMouseMove);
    $(document).off('mouseup', this.handleKnobMouseUp);
  }

  private getRelativeMousePositionRatio(event: JQuery.Event): number {
    // if (orientation === 'vertical') {
    //   const ratio = ((Number(event.pageY) - this.$trackOffset.top) / this.$trackWidth);
    // }
    const ratio = (Number(event.pageX) - this.$trackOffset.left) / this.$trackWidth;

    if (ratio < 0) {
      return 0;
    }
    if (ratio > 1) {
      return 1;
    }
    return ratio;
  }
}

export default View;
