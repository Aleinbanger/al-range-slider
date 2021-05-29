import bind from 'bind-decorator';

import SubView from '../SubView';

interface ITrackViewState {
  positionRatio?: number;
}

class TrackView extends SubView<ITrackViewState> {
  protected renderMarkup(): HTMLElement {
    const element = document.createElement('div');
    element.setAttribute('class', `${this.props.cssClass} js-${this.props.cssClass}`);
    return element;
  }

  protected override initialize(): void {
    this.state = {};
  }

  protected override addEventListeners(): void {
    this.element.addEventListener('pointerdown', this.handleTrackPointerDown);
  }

  @bind
  private handleTrackPointerDown(): void {
    this.setReferenceFrame(this.element);

    this.element.addEventListener('pointerup', this.handleTrackPointerUp);
  }

  @bind
  private handleTrackPointerUp(event: PointerEvent): void {
    const positionRatio = this.getRelativePointerPositionRatio(event);
    this.notifyObservers({ positionRatio });

    this.element.removeEventListener('pointerup', this.handleTrackPointerUp);
  }
}

export type { ITrackViewState };
export default TrackView;
