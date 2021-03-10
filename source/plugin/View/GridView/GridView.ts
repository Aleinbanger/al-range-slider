import bind from 'bind-decorator';

import SubView from '../SubView';
import { TPointsMap, ISubViewProps } from '../ViewTypes';

interface IGridViewProps extends ISubViewProps {
  readonly pointsMap: TPointsMap;
  minTicksStep: number;
  marksStep: number,
  minTicksGap?: number;
}

interface IGridViewState {
  ticksStep?: number;
  positionRatio?: number;
}

class GridView extends SubView<IGridViewState, IGridViewProps> {
  protected state: IGridViewState = {
    ticksStep: 1,
  };

  private ticks: HTMLElement[] = [];

  private marks: HTMLElement[] = [];

  public destroy(): void {
    super.destroy();
    window.removeEventListener('resize', this.handleWindowResize);
  }

  protected initialize(): void {
    this.ticks = [];
    this.marks = [];
    this.props.minTicksStep = Math.ceil(Math.abs(this.props.minTicksStep));
    this.props.marksStep = Math.ceil(Math.abs(this.props.marksStep));
    this.setState({ ticksStep: this.props.minTicksStep });

    let marksWidths: number[];
    if (this.props.orientation === 'vertical') {
      marksWidths = this.marks.map((mark) => mark.getBoundingClientRect().height);
    } else {
      marksWidths = this.marks.map((mark) => mark.getBoundingClientRect().width);
    }
    this.props.minTicksGap = Math.max(...marksWidths) / this.props.marksStep;
    this.updateState();
  }

  protected bindEventListeners(): void {
    window.addEventListener('resize', this.handleWindowResize);
    this.element.addEventListener('mousedown', this.handleGridMouseDown);
  }

  protected renderState({ ticksStep }: IGridViewState): void {
    if (ticksStep) {
      this.ticks.forEach((tick) => tick.remove());
      this.marks.forEach((mark) => mark.remove());
      this.ticks = [];
      this.marks = [];
      const ceiledTicksStep = Math.ceil(Math.abs(ticksStep));
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
          this.ticks.push(tick);
          this.element.appendChild(tick);
        }
      });
      this.ticks.forEach((tick, index) => {
        let newIndex: number | undefined;
        if (index % this.props.marksStep === 0) {
          newIndex = index * ceiledTicksStep;
        }
        if (index === this.ticks.length - 1) {
          newIndex = this.props.pointsMap.length - 1;
        }
        if (typeof newIndex !== 'undefined' && newIndex < this.props.pointsMap.length) {
          const mark = document.createElement('span');
          mark.setAttribute('class', `${this.props.cssClass}-mark js-${this.props.cssClass}-mark`);
          mark.textContent = String(this.props.pointsMap[newIndex][1]);
          this.marks.push(mark);
          tick.appendChild(mark);
          tick.classList.add(`${this.props.cssClass}-tick_long`);
        }
      });
      for (let index = 0; index < this.marks.length - 2; index += 1) {
        const rect1 = this.marks[index].getBoundingClientRect();
        const rect2 = this.marks[index + 1].getBoundingClientRect();
        const rect3 = this.marks[index + 2].getBoundingClientRect();
        let isOverlapping = false;
        if (this.props.orientation === 'vertical') {
          isOverlapping = rect1.bottom > rect2.top || rect2.bottom > rect3.top;
        } else {
          isOverlapping = rect1.right > rect2.left || rect2.right > rect3.left;
        }
        if (isOverlapping) {
          this.marks[index + 1].classList.add(`${this.props.cssClass}-mark_hidden`);
          index += 1;
        } else {
          this.marks[index + 1].classList.remove(`${this.props.cssClass}-mark_hidden`);
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
  private handleGridMouseDown(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains(`js-${this.props.cssClass}-mark`)) {
      event.stopPropagation();
      this.element.addEventListener('mouseup', this.handleGridMouseUp);
    }
  }

  @bind
  private handleGridMouseUp(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains(`js-${this.props.cssClass}-mark`)) {
      const positionRatio = Number(target.parentElement?.dataset.position);
      if (!Number.isNaN(positionRatio)) {
        this.notifyObservers({ positionRatio });
      }
    }
    this.element.removeEventListener('mouseup', this.handleGridMouseUp);
  }
}

export type { IGridViewState };
export default GridView;
