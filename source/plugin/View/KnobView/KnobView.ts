import bind from 'bind-decorator';

import SubView from '../SubView';

interface IKnobViewState {
  positionRatio?: number;
}

class KnobView extends SubView<IKnobViewState> {
  protected state: IKnobViewState = {
    positionRatio: 0,
  };

  protected renderMarkup(): HTMLElement {
    const element = document.createElement('span');
    element.setAttribute('class', `${this.props.cssClass} js-${this.props.cssClass}`);
    return element;
  }

  protected renderState({ positionRatio }: IKnobViewState): void {
    if (typeof positionRatio !== 'undefined') {
      if (positionRatio < 0 || positionRatio > 1) {
        throw new Error('Invalid "positionRatio" value, must be in between 0 and 1');
      }
      const percent = positionRatio * 100;
      this.element.style.left = `${percent}%`;
    }
  }

  protected bindEventListeners(): void {
    this.element.addEventListener('mousedown', this.handleKnobMouseDown);
  }

  @bind
  private handleKnobMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.setReferenceFrame(this.props.parent);

    this.element.classList.add(`${this.props.cssClass}_active`);

    document.addEventListener('mousemove', this.handleDocumentMouseMove);
    document.addEventListener('mouseup', this.handleDocumentMouseUp);
  }

  @bind
  private handleDocumentMouseMove(event: MouseEvent): void {
    event.preventDefault();
    const positionRatio = this.getRelativeMousePositionRatio(event);

    // if (smooth)
    this.renderState({ positionRatio });

    this.notifyObservers({ positionRatio });
  }

  @bind
  private handleDocumentMouseUp(): void {
    this.element.classList.remove(`${this.props.cssClass}_active`);

    this.notifyObservers(this.state);

    document.removeEventListener('mousemove', this.handleDocumentMouseMove);
    document.removeEventListener('mouseup', this.handleDocumentMouseUp);
  }
}

export type { IKnobViewState };
export default KnobView;
