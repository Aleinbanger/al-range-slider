import bind from 'bind-decorator';

import SubView from '../SubView';

interface ITrackViewState {
  positionRatio?: number;
}

class TrackView extends SubView<ITrackViewState> {
  protected state: ITrackViewState = {};

  protected addEventListeners(): void {
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
