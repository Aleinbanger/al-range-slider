import bind from 'bind-decorator';

import Observable from '../Observable/Observable';
import { IViewState } from './ViewTypes';
import './View.scss';

class View extends Observable {
  private $input: JQuery<HTMLElement>;

  private $wrapper!: JQuery<HTMLElement>;

  private $track!: JQuery<HTMLElement>;

  private $trackOffset!: JQuery.Coordinates;

  private $trackWidth!: number;

  private $knob!: JQuery<HTMLElement>;

  private $range!: JQuery<HTMLElement>;

  private state: IViewState = {
    currentPositionRatio: {
      from: 0,
    },
  };

  constructor(input: HTMLElement) {
    super();
    this.$input = $(input);
    this.initialize();
    this.bindEventListeners();
  }

  public setInputValue(value: number | string): void {
    this.$input.val(value);
  }

  public setCurrentPositionRatio({ from, to }: {from: number; to?: number}): void {
    this.state.currentPositionRatio = { from, to };
  }

  public getState(): IViewState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public renderPosition(positionRatio: number): void {
    const percent = positionRatio * 100;
    this.$knob.css('left', `${percent}%`);
    this.$range.css('width', `${percent}%`);
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
    const positionRatio = this.getRelativeMousePositionRatio(event);
    // if (smooth === true)
    this.renderPosition(positionRatio);

    this.notifyObservers(positionRatio); // improve, use distinct types
  }

  @bind
  private handleKnobMouseUp(): void {
    this.$knob.removeClass('al-range-slider__knob_active');

    console.log(this.state.currentPositionRatio.from);
    this.renderPosition(this.state.currentPositionRatio.from);

    $(document).off('mousemove', this.handleKnobMouseMove);
    $(document).off('mouseup', this.handleKnobMouseUp);
  }

  private getRelativeMousePositionRatio(event: JQuery.Event): number {
    // if (orientation === 'vertical') {
    //   const percent = ((Number(event.pageY) - this.$trackOffset.top) / this.$trackWidth);
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
