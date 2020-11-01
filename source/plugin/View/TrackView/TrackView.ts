import bind from 'bind-decorator';

import SubView from '../SubView';

interface ITrackViewState {
  positionRatio?: number;
}

class TrackView extends SubView<ITrackViewState> {
  protected state: ITrackViewState = {};

  // eslint-disable-next-line class-methods-use-this
  protected renderState(): void {}

  protected bindEventListeners(): void {
    this.element.addEventListener('mousedown', this.handleTrackMouseDown);
  }

  @bind
  private handleTrackMouseDown(): void {
    this.element.addEventListener('mouseup', this.handleTrackMouseUp);
  }

  @bind
  private handleTrackMouseUp(event: MouseEvent): void {
    this.setReferenceFrame(this.element);
    const positionRatio = this.getRelativeMousePositionRatio(event);
    this.notifyObservers({ positionRatio });

    this.element.removeEventListener('mouseup', this.handleTrackMouseUp);
  }
}

export type { ITrackViewState };
export default TrackView;
