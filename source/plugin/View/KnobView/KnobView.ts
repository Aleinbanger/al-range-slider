import bind from 'bind-decorator';

import SubView from '../SubView';

interface IKnobViewState {
  positionRatio?: number;
  positionRatioLimits?: {
    min: number;
    max: number;
  };
  active?: boolean;
}

class KnobView extends SubView<IKnobViewState> {
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
      if (positionRatio < 0 || positionRatio > 1) {
        throw new Error('Invalid "positionRatio" value, must be in between 0 and 1');
      }
      const percent = positionRatio * 100;
      this.element.style.left = `${percent}%`;
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
    this.element.addEventListener('mousedown', this.handleKnobMouseDown);
  }

  @bind
  private handleKnobMouseDown(event: MouseEvent): void {
    event.stopPropagation();
    this.setReferenceFrame(this.props.parent);
    this.setState({ active: true });
    this.notifyObservers({ active: true });

    document.addEventListener('mousemove', this.handleDocumentMouseMove);
    document.addEventListener('mouseup', this.handleDocumentMouseUp);
  }

  @bind
  private handleDocumentMouseMove(event: MouseEvent): void {
    event.preventDefault();
    const positionRatio = this.getRelativeMousePositionRatio(event);

    if (this.checkLimits(positionRatio)) {
      this.notifyObservers({ positionRatio });

      // if (smooth)
      this.renderState({ positionRatio });
    }
  }

  @bind
  private handleDocumentMouseUp(): void {
    this.setState({ active: false });
    this.notifyObservers(this.state);

    document.removeEventListener('mousemove', this.handleDocumentMouseMove);
    document.removeEventListener('mouseup', this.handleDocumentMouseUp);
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
