import bind from 'bind-decorator';

import SubView from '../SubView';

type TTrackViewEvent = {
  kind: 'track position change';
  data: number;
};

class TrackView extends SubView<TTrackViewEvent> {
  protected renderMarkup(): HTMLElement {
    const element = document.createElement('div');
    element.setAttribute('class', `${this.props.cssClass} js-${this.props.cssClass}`);
    return element;
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
    this.notifyObservers({ kind: 'track position change', data: positionRatio });

    this.element.removeEventListener('pointerup', this.handleTrackPointerUp);
  }
}

export type { TTrackViewEvent };
export default TrackView;
