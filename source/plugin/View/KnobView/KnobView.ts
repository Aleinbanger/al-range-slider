import bind from 'bind-decorator';

import SubView from '../SubView';
import { ISubViewProps } from '../ViewTypes';

interface IKnobViewProps extends ISubViewProps {
  readonly allowSmoothTransition: boolean;
}

interface IKnobViewState {
  positionRatio?: number;
  positionRatioLimits?: {
    min: number;
    max: number;
  };
  active?: boolean;
}

class KnobView extends SubView<IKnobViewState, IKnobViewProps> {
  protected state: IKnobViewState = {
    positionRatio: 0,
    positionRatioLimits: {
      min: 0,
      max: 1,
    },
    active: false,
  };

  protected renderMarkup(): HTMLElement {
    const element = document.createElement('span');
    element.setAttribute('class', `${this.props.cssClass} js-${this.props.cssClass}`);
    return element;
  }

  protected renderState({ positionRatio, active }: IKnobViewState): void {
    if (typeof positionRatio !== 'undefined') {
      let percent: number;
      if (positionRatio < 0) {
        percent = 0;
      } else if (positionRatio > 1) {
        percent = 100;
      } else {
        percent = positionRatio * 100;
      }
      if (this.props.orientation === 'vertical') {
        this.element.style.top = `${percent}%`;
      } else {
        this.element.style.left = `${percent}%`;
      }
    }
    if (typeof active !== 'undefined') {
      if (active) {
        this.element.classList.add(`${this.props.cssClass}_active`);
      } else {
        this.element.classList.remove(`${this.props.cssClass}_active`);
      }
    }
  }

  protected bindEventListeners(): void {
    this.element.addEventListener('touchstart', this.handleKnobTouchStart);
    this.element.addEventListener('mousedown', this.handleKnobMouseDown);
  }

  @bind
  private handleKnobTouchStart(event: TouchEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.activateKnob();

    this.element.addEventListener('touchmove', this.handleKnobTouchMove);
    this.element.addEventListener('touchend', this.handleKnobTouchEnd);
  }

  @bind
  private handleKnobTouchMove(event: TouchEvent): void {
    event.preventDefault();
    const positionRatio = this.getRelativeTouchPositionRatio(event);
    this.moveKnob(positionRatio);
  }

  @bind
  private handleKnobTouchEnd(): void {
    this.deactivateKnob();

    this.element.removeEventListener('touchmove', this.handleKnobTouchMove);
    this.element.removeEventListener('touchend', this.handleKnobTouchEnd);
  }

  @bind
  private handleKnobMouseDown(event: MouseEvent): void {
    event.stopPropagation();
    this.activateKnob();

    document.addEventListener('mousemove', this.handleDocumentMouseMove);
    document.addEventListener('mouseup', this.handleDocumentMouseUp);
  }

  @bind
  private handleDocumentMouseMove(event: MouseEvent): void {
    event.preventDefault();
    const positionRatio = this.getRelativeMousePositionRatio(event);
    this.moveKnob(positionRatio);
  }

  @bind
  private handleDocumentMouseUp(): void {
    this.deactivateKnob();

    document.removeEventListener('mousemove', this.handleDocumentMouseMove);
    document.removeEventListener('mouseup', this.handleDocumentMouseUp);
  }

  private activateKnob(): void {
    this.setReferenceFrame(this.props.parent);
    this.notifyObservers({ active: true });
  }

  private moveKnob(positionRatio: number): void {
    if (this.checkLimits(positionRatio)) {
      this.notifyObservers({ positionRatio });
      if (this.props.allowSmoothTransition) {
        this.renderState({ positionRatio });
      }
    }
  }

  private deactivateKnob(): void {
    this.setState({ active: false });
    this.notifyObservers(this.state);
  }

  private checkLimits(positionRatio: number): boolean {
    if (this.state.positionRatioLimits) {
      const { min, max } = this.state.positionRatioLimits;
      const isInsideLimits = positionRatio >= min && positionRatio <= max;
      if (isInsideLimits) {
        return true;
      }
      return false;
    }
    return true;
  }
}

export type { IKnobViewState };
export default KnobView;
