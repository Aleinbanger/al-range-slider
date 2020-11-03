import bind from 'bind-decorator';

import SubView from '../SubView';
import { TPointsMap, ISubViewProps } from '../ViewTypes';

interface IGridViewProps extends ISubViewProps {
  readonly pointsMap: TPointsMap;
  readonly minTicksGap: number;
  readonly marksStep: number,
}

interface IGridViewState {
  ticksStep?: number;
  positionRatio?: number;
}

class GridView extends SubView<IGridViewState, IGridViewProps> {
  protected state: IGridViewState = {
    ticksStep: 1,
  };

  protected renderState({ ticksStep }: IGridViewState): void {
    if (ticksStep) {
      const ceiledGridStep = Math.ceil(Math.abs(ticksStep));
      const ticks: HTMLElement[] = [];
      const marks: HTMLElement[] = [];
      while (this.element.firstChild) {
        if (this.element.lastChild) {
          this.element.removeChild(this.element.lastChild);
        }
      }
      this.props.pointsMap.forEach(([positionRatio], index) => {
        if (index % ceiledGridStep === 0 || index === this.props.pointsMap.length - 1) {
          const tick = document.createElement('span');
          tick.setAttribute('class', `${this.props.cssClass}-tick js-${this.props.cssClass}-tick`);
          if (this.props.orientation === 'vertical') {
            tick.classList.add(`${this.props.cssClass}-tick_vertical`);
            tick.style.top = `${Number(positionRatio) * 100}%`;
          } else {
            tick.classList.remove(`${this.props.cssClass}-tick_vertical`);
            tick.style.left = `${Number(positionRatio) * 100}%`;
          }
          tick.dataset.position = positionRatio;
          ticks.push(tick);
          this.element.appendChild(tick);
        }
      });
      ticks.forEach((tick, index) => {
        let newIndex: number | undefined;
        if (index % this.props.marksStep === 0) {
          newIndex = index * ticksStep;
        }
        if (index === ticks.length - 1) {
          newIndex = this.props.pointsMap.length - 1;
        }
        if (typeof newIndex !== 'undefined' && newIndex < this.props.pointsMap.length) {
          const mark = document.createElement('span');
          mark.setAttribute('class', `${this.props.cssClass}-mark js-${this.props.cssClass}-mark`);
          if (this.props.orientation === 'vertical') {
            mark.classList.add(`${this.props.cssClass}-mark_vertical`);
          } else {
            mark.classList.remove(`${this.props.cssClass}-mark_vertical`);
          }
          mark.textContent = String(this.props.pointsMap[newIndex][1]);
          marks.push(mark);
          tick.appendChild(mark);
        }
      });
      marks.slice(1, marks.length - 1).forEach((mark, index) => {
        const rect1 = mark.getBoundingClientRect();
        const rect2 = marks[index + 2].getBoundingClientRect();
        let isOverlapping: boolean;
        if (this.props.orientation === 'vertical') {
          isOverlapping = rect1.bottom > rect2.top;
        } else {
          isOverlapping = rect1.right > rect2.left;
        }
        if (isOverlapping) {
          mark.classList.add(`${this.props.cssClass}-mark_hidden`);
        } else {
          mark.classList.remove(`${this.props.cssClass}-mark_hidden`);
        }
      });
    }
  }

  protected bindEventListeners(): void {
    window.addEventListener('load', this.handleWindowLoadAndResize);
    window.addEventListener('resize', this.handleWindowLoadAndResize);
    this.element.addEventListener('mousedown', this.handleGridMouseDown);
  }

  @bind
  private handleWindowLoadAndResize(): void {
    this.setReferenceFrame(this.props.parent);
    if (this.props.referenceFrame) {
      const { width, height } = this.props.referenceFrame;
      let ticksStep: number;
      if (this.props.orientation === 'vertical') {
        ticksStep = Math.ceil(Math.abs((
          this.props.minTicksGap * this.props.pointsMap.length) / height));
      } else {
        ticksStep = Math.ceil(Math.abs((
          this.props.minTicksGap * this.props.pointsMap.length) / width));
      }
      this.setState({ ticksStep });
      console.log({ ticksStep });
    }
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
