import bind from 'bind-decorator';

import SubView, { ISubViewProps } from '../SubView';

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
  zIndex?: number;
}

class KnobView extends SubView<IKnobViewState, IKnobViewProps> {
  protected renderMarkup(): HTMLElement {
    const element = document.createElement('span');
    element.setAttribute('class', `${this.props.cssClass} js-${this.props.cssClass}`);
    return element;
  }

  protected initialize(): void {
    this.state = {
      positionRatio: 0,
      positionRatioLimits: {
        min: 0,
        max: 1,
      },
      active: false,
      zIndex: 2,
    };
  }

  protected addEventListeners(): void {
    this.element.addEventListener('pointerdown', this.handleKnobPointerDown);
  }

  protected renderState({ positionRatio, active, zIndex }: IKnobViewState): void {
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
    if (typeof zIndex !== 'undefined') {
      let newZIndex = Math.ceil(zIndex);
      if (newZIndex < 2) {
        newZIndex = 2;
      }
      this.element.style.zIndex = String(newZIndex);
    }
  }

  @bind
  private handleKnobPointerDown(event: PointerEvent): void {
    event.stopPropagation();
    this.setReferenceFrame(this.parent);
    this.notifyObservers({ active: true });

    this.element.setPointerCapture(event.pointerId);
    this.element.addEventListener('pointermove', this.handleKnobPointerMove);
    this.element.addEventListener('pointerup', this.handleKnobPointerUp);
    this.element.addEventListener('pointercancel', this.handleKnobPointerCancel);
  }

  @bind
  private handleKnobPointerMove(event: PointerEvent): void {
    event.preventDefault();
    const positionRatio = this.getRelativePointerPositionRatio(event);
    if (this.checkLimits(positionRatio)) {
      this.notifyObservers({ positionRatio });
      if (this.props.allowSmoothTransition) {
        this.renderState({ positionRatio });
      }
    }
  }

  @bind
  private handleKnobPointerUp(event: PointerEvent): void {
    this.setState({ active: false });
    if (this.state) {
      this.notifyObservers(this.state);
    }

    this.handleKnobPointerCancel(event);
  }

  @bind
  private handleKnobPointerCancel(event: PointerEvent): void {
    this.element.releasePointerCapture(event.pointerId);
    this.element.removeEventListener('pointermove', this.handleKnobPointerMove);
    this.element.removeEventListener('pointerup', this.handleKnobPointerUp);
    this.element.removeEventListener('pointercancel', this.handleKnobPointerCancel);
  }

  private checkLimits(positionRatio: number): boolean {
    if (this.state?.positionRatioLimits) {
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

export type { IKnobViewProps, IKnobViewState };
export default KnobView;
