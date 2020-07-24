import './AlRangeSlider.scss';

import bind from 'bind-decorator';

import IModelState from './IModelState';

import IViewState from './IViewState';

import { getKeyByValue, getClosestNumber } from '../shared/scripts/utils';

class AlRangeSlider {
  private $input: JQuery<HTMLElement>;

  private $wrapper!: JQuery<HTMLElement>;

  private $track!: JQuery<HTMLElement>;

  private $trackOffset!: JQuery.Coordinates;

  private $trackWidth!: number;

  private $knob!: JQuery<HTMLElement>;

  private $range!: JQuery<HTMLElement>;

  private modelState: IModelState = {
    value: {
      min: 0,
      max: 1000,
      step: 1,
    },
    currentPoint: {
      from: 0,
      // to: 0,
    },
    pointsMap: {},
    type: 'single',
    orientation: 'horizontal',
    showInput: true,
    showScale: false,
    showTooltips: false,
  };

  private viewState: IViewState = {
    currentPositionRatio: {
      from: 0,
    },
  };

  private temp: Record<string, unknown> = {};

  constructor(input: HTMLElement) {
    this.$input = $(input);
    this.initialize();
    this.bindEventListeners();
  }

  private initialize(): void {
    this.renderMarkup();

    this.populateSliderPoints(this.modelState.value);

    this.setSliderPosition(this.modelState.currentPoint.from, this.modelState.pointsMap);
    this.setInputValue(this.viewState.currentPositionRatio.from); // to simplify?
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
    // get track from parent() when separated
    this.$trackOffset = this.$track.offset() as JQuery.Coordinates;
    this.$trackWidth = this.$track.width() as number;

    this.$knob.addClass('al-range-slider__knob_active');

    $(document).on('mousemove', this.handleKnobMouseMove);
    $(document).on('mouseup', this.handleKnobMouseUp);
  }

  @bind
  private handleKnobMouseMove(event: JQuery.Event): void {
    const positionRatio = this.getRelativeMousePositionRatio(event);
    const positionRatioFixed = Number(positionRatio
      .toFixed(Number(this.temp.positionRatioPrecision)));
    this.renderPosition(positionRatio);

    if (typeof this.modelState.pointsMap[positionRatioFixed] !== 'undefined') {
      this.viewState.currentPositionRatio.from = positionRatioFixed;
      this.setInputValue(this.viewState.currentPositionRatio.from);
    }
  }

  @bind
  private handleKnobMouseUp(): void {
    this.$knob.removeClass('al-range-slider__knob_active');

    this.renderPosition(this.viewState.currentPositionRatio.from);

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

  private renderPosition(positionRatio: number): void {
    const percent = positionRatio * 100;
    this.$knob.css('left', `${percent}%`);
    this.$range.css('width', `${percent}%`);
  }

  private setSliderPosition(point: number | string, pointsMap: Record<number, number | string>):
  void {
    let closestPoint: number | string;
    if (typeof point === 'number') {
      closestPoint = getClosestNumber(point, Object.values(pointsMap) as number[]);
    } else {
      closestPoint = point;
    }
    this.viewState.currentPositionRatio.from = Number(getKeyByValue(pointsMap, closestPoint));

    this.renderPosition(this.viewState.currentPositionRatio.from);
  }

  // model

  private populateSliderPoints({ max, min, step }:
  { max: number; min: number; step: number }): void {
    const pointsNumber = Math.ceil((max - min) / step);

    this.temp.positionRatioPrecision = Math.log10(pointsNumber);

    for (let index = 0; index < pointsNumber; index += 1) {
      const point = index * step + min;
      this.addNumberPoint(point, { max, min, step });
    }
    this.addNumberPoint(max, { max, min, step });

    console.log(this.modelState.pointsMap);
  }

  private addNumberPoint(point: number, { max, min }:
  { max: number; min: number; step: number }): void {
    const positionRatio = Number(((point - min)
        / (max - min)).toFixed(Number(this.temp.positionRatioPrecision)));
    this.modelState.pointsMap[positionRatio] = Number(point.toFixed(4));
  }

  private setInputValue(positionRatio: number): void {
    this.modelState.currentPoint.from = this.modelState.pointsMap[positionRatio];
    this.$input.val(this.modelState.currentPoint.from);
  }
}

export default AlRangeSlider;
