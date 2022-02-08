import bind from 'bind-decorator';

import SubView, { ISubViewProps } from '../SubView';
import { TPointsMap } from '../../ViewTypes';

interface IGridViewProps extends ISubViewProps {
  readonly pointsMap: TPointsMap;
  minTicksStep: number;
  marksStep: number,
  readonly prettify?: (value: string) => string;
  minTicksGap?: number;
  ticks?: HTMLElement[];
  marks?: HTMLElement[];
}

interface IGridViewState {
  ticksStep?: number;
  positionRatio?: number;
}

class GridView extends SubView<IGridViewState, IGridViewProps> {
  public override destroy(): void {
    super.destroy();
    window.removeEventListener('resize', this.handleWindowResize);
  }

  protected renderMarkup(): HTMLElement {
    const element = document.createElement('div');
    element.setAttribute('class', `${this.props.cssClass} js-${this.props.cssClass}`);
    return element;
  }

  protected override initialize(): void {
    this.state = {
      ticksStep: 1,
    };
    this.props.ticks = [];
    this.props.marks = [];
    this.props.minTicksStep = Math.ceil(Math.abs(this.props.minTicksStep));
    this.props.marksStep = Math.ceil(Math.abs(this.props.marksStep));
    this.setState({ ticksStep: this.props.minTicksStep });

    const marksWidths = this.props.orientation === 'vertical'
      ? this.props.marks.map((mark) => mark.getBoundingClientRect().height)
      : this.props.marks.map((mark) => mark.getBoundingClientRect().width);
    this.props.minTicksGap = Math.max(...marksWidths) / this.props.marksStep;
    this.updateState();
  }

  protected override addEventListeners(): void {
    window.addEventListener('resize', this.handleWindowResize);
    this.element.addEventListener('pointerdown', this.handleGridPointerDown);
  }

  protected override renderState({ ticksStep }: IGridViewState): void {
    if (ticksStep) {
      const ceiledTicksStep = Math.ceil(Math.abs(ticksStep));
      const { cssClass, orientation, pointsMap } = this.props;
      this.props.ticks?.forEach((tick) => tick.remove()); this.props.ticks = [];
      this.props.marks?.forEach((mark) => mark.remove()); this.props.marks = [];
      pointsMap.forEach(([positionRatio], index) => {
        const isIndexValid = index % ceiledTicksStep === 0
          || index === pointsMap.length - 1;
        if (isIndexValid) {
          const tick = document.createElement('span');
          tick.setAttribute('class', `${cssClass}-tick js-${cssClass}-tick`);
          if (orientation === 'vertical') {
            tick.style.bottom = `${Number(positionRatio) * 100}%`;
          } else {
            tick.style.left = `${Number(positionRatio) * 100}%`;
          }
          tick.dataset.position = positionRatio;
          this.props.ticks?.push(tick);
          this.element.appendChild(tick);
        }
      });
      const getMarkIndex = (tickIndex: number): number | undefined => {
        let markIndex: number | undefined;
        if (tickIndex % this.props.marksStep === 0) {
          markIndex = tickIndex * ceiledTicksStep;
        }
        const isLastIndex = this.props.ticks && tickIndex === this.props.ticks.length - 1;
        if (isLastIndex) {
          markIndex = pointsMap.length - 1;
        }
        return markIndex;
      };
      this.props.ticks.forEach((tick, index) => {
        const markIndex = getMarkIndex(index);
        const isMarksIndexValid = typeof markIndex !== 'undefined'
          && markIndex < pointsMap.length;
        if (isMarksIndexValid) {
          const value = String(pointsMap[markIndex][1]);
          const mark = document.createElement('span');
          mark.setAttribute('class', `${cssClass}-mark js-${cssClass}-mark`);
          mark.textContent = this.props.prettify?.(value) ?? value;
          this.props.marks?.push(mark);
          tick.appendChild(mark);
          tick.classList.add(`${cssClass}-tick_long`);
        }
      });
      const checkedMarks: HTMLElement[] = [];
      for (let index = 0; index < this.props.marks.length / 2; index += 1) {
        const firstMark = this.props.marks[index];
        const lastMark = this.props.marks[this.props.marks.length - index - 1];
        const wereMarksChecked = checkedMarks.includes(firstMark)
          || checkedMarks.includes(lastMark);
        if (!wereMarksChecked) {
          const firstRect = firstMark.getBoundingClientRect();
          const lastRect = lastMark.getBoundingClientRect();
          this.props.marks?.forEach((nextMark) => {
            const wasNextMarkChecked = checkedMarks.includes(nextMark)
              || nextMark === firstMark || nextMark === lastMark;
            if (!wasNextMarkChecked) {
              const nextRect = nextMark.getBoundingClientRect();
              const isOverlapping = orientation === 'vertical'
                ? firstRect.top < nextRect.bottom || lastRect.bottom > nextRect.top
                : firstRect.right > nextRect.left || lastRect.left < nextRect.right;
              if (isOverlapping) {
                nextMark.classList.add(`${cssClass}-mark_hidden`);
                checkedMarks.push(nextMark);
              } else {
                nextMark.classList.remove(`${cssClass}-mark_hidden`);
              }
            }
          });
        }
        checkedMarks.push(firstMark);
        checkedMarks.push(lastMark);
      }
    }
  }

  private updateState(): void {
    const { minTicksStep, minTicksGap } = this.props;
    let ticksStep = minTicksStep;
    this.setReferenceFrame(this.parent);
    if (this.props.referenceFrame) {
      const { width, height } = this.props.referenceFrame;
      ticksStep = this.props.orientation === 'vertical'
        ? Math.ceil(((minTicksGap ?? 0) * this.props.pointsMap.length) / height)
        : Math.ceil(((minTicksGap ?? 0) * this.props.pointsMap.length) / width);
    }
    if (ticksStep < minTicksStep) {
      ticksStep = minTicksStep;
    }
    this.setState({ ticksStep });
  }

  @bind
  private handleWindowResize(): void {
    this.updateState();
  }

  @bind
  private handleGridPointerDown(event: PointerEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains(`js-${this.props.cssClass}-mark`)) {
      event.stopPropagation();
      this.element.addEventListener('pointerup', this.handleGridPointerUp);
    }
  }

  @bind
  private handleGridPointerUp(event: PointerEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains(`js-${this.props.cssClass}-mark`)) {
      const positionRatio = Number(target.parentElement?.dataset.position);
      if (!Number.isNaN(positionRatio)) {
        this.notifyObservers({ positionRatio });
      }
    }
    this.element.removeEventListener('pointerup', this.handleGridPointerUp);
  }
}

export type { IGridViewProps, IGridViewState };
export default GridView;
