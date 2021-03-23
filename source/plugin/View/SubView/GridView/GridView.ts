import bind from 'bind-decorator';

import SubView, { ISubViewProps } from '../SubView';
import { TPointsMap } from '../../ViewTypes';

interface IGridViewProps extends ISubViewProps {
  readonly pointsMap: TPointsMap;
  minTicksStep: number;
  marksStep: number,
  minTicksGap?: number;
  ticks?: HTMLElement[];
  marks?: HTMLElement[];
}

interface IGridViewState {
  ticksStep?: number;
  positionRatio?: number;
}

class GridView extends SubView<IGridViewState, IGridViewProps> {
  protected state: IGridViewState = {
    ticksStep: 1,
  };

  public destroy(): void {
    super.destroy();
    window.removeEventListener('resize', this.handleWindowResize);
  }

  protected renderMarkup(): HTMLElement {
    const element = document.createElement('div');
    element.setAttribute('class', `${this.props.cssClass} js-${this.props.cssClass}`);
    return element;
  }

  protected initialize(): void {
    this.props.ticks = [];
    this.props.marks = [];
    this.props.minTicksStep = Math.ceil(Math.abs(this.props.minTicksStep));
    this.props.marksStep = Math.ceil(Math.abs(this.props.marksStep));
    this.setState({ ticksStep: this.props.minTicksStep });

    let marksWidths: number[];
    if (this.props.orientation === 'vertical') {
      marksWidths = this.props.marks.map((mark) => mark.getBoundingClientRect().height);
    } else {
      marksWidths = this.props.marks.map((mark) => mark.getBoundingClientRect().width);
    }
    this.props.minTicksGap = Math.max(...marksWidths) / this.props.marksStep;
    this.updateState();
  }

  protected addEventListeners(): void {
    window.addEventListener('resize', this.handleWindowResize);
    this.element.addEventListener('pointerdown', this.handleGridPointerDown);
  }

  protected renderState({ ticksStep }: IGridViewState): void {
    if (ticksStep) {
      const ceiledTicksStep = Math.ceil(Math.abs(ticksStep));
      this.props.ticks?.forEach((tick) => tick.remove()); this.props.ticks = [];
      this.props.marks?.forEach((mark) => mark.remove()); this.props.marks = [];
      this.props.pointsMap.forEach(([positionRatio], index) => {
        if (index % ceiledTicksStep === 0 || index === this.props.pointsMap.length - 1) {
          const tick = document.createElement('span');
          tick.setAttribute('class', `${this.props.cssClass}-tick js-${this.props.cssClass}-tick`);
          if (this.props.orientation === 'vertical') {
            tick.style.top = `${Number(positionRatio) * 100}%`;
          } else {
            tick.style.left = `${Number(positionRatio) * 100}%`;
          }
          tick.dataset.position = positionRatio;
          this.props.ticks?.push(tick);
          this.element.appendChild(tick);
        }
      });
      this.props.ticks.forEach((tick, index) => {
        let newIndex: number | undefined;
        if (index % this.props.marksStep === 0) {
          newIndex = index * ceiledTicksStep;
        }
        if (this.props.ticks && index === this.props.ticks.length - 1) {
          newIndex = this.props.pointsMap.length - 1;
        }
        if (typeof newIndex !== 'undefined' && newIndex < this.props.pointsMap.length) {
          const mark = document.createElement('span');
          mark.setAttribute('class', `${this.props.cssClass}-mark js-${this.props.cssClass}-mark`);
          mark.textContent = String(this.props.pointsMap[newIndex][1]);
          this.props.marks?.push(mark);
          tick.appendChild(mark);
          tick.classList.add(`${this.props.cssClass}-tick_long`);
        }
      });
      for (let index = 0; index < this.props.marks.length - 2; index += 1) {
        const rect1 = this.props.marks[index].getBoundingClientRect();
        const rect2 = this.props.marks[index + 1].getBoundingClientRect();
        const rect3 = this.props.marks[index + 2].getBoundingClientRect();
        let isOverlapping = false;
        if (this.props.orientation === 'vertical') {
          isOverlapping = rect1.bottom > rect2.top || rect2.bottom > rect3.top;
        } else {
          isOverlapping = rect1.right > rect2.left || rect2.right > rect3.left;
        }
        if (isOverlapping) {
          this.props.marks[index + 1].classList.add(`${this.props.cssClass}-mark_hidden`);
          index += 1;
        } else {
          this.props.marks[index + 1].classList.remove(`${this.props.cssClass}-mark_hidden`);
        }
      }
    }
  }

  private updateState(): void {
    const { minTicksStep, minTicksGap } = this.props;
    let ticksStep = minTicksStep;
    this.setReferenceFrame(this.parent);
    if (this.props.referenceFrame && minTicksGap) {
      const { width, height } = this.props.referenceFrame;
      if (this.props.orientation === 'vertical') {
        ticksStep = Math.ceil((minTicksGap * this.props.pointsMap.length) / height);
      } else {
        ticksStep = Math.ceil((minTicksGap * this.props.pointsMap.length) / width);
      }
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
