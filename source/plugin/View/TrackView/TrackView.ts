import bind from 'bind-decorator';

import SubView from '../SubView';

interface ITrackViewState {
  positionRatio?: number;
}

class TrackView extends SubView<ITrackViewState> {
  protected state: ITrackViewState = {};

  protected renderMarkup(): HTMLElement {
    const element = document.createElement('div');
    element.setAttribute('class', `${this.props.cssClass} js-${this.props.cssClass}`);
    return element;
  }

  // eslint-disable-next-line class-methods-use-this
  protected renderState(): void {}

  protected bindEventListeners(): void {
    this.element.addEventListener('click', this.handleTrackClick);
  }

  @bind
  private handleTrackClick(event: MouseEvent): void {
    event.preventDefault();
    this.setReferenceFrame(this.element);
    const positionRatio = this.getRelativeMousePositionRatio(event);

    this.notifyObservers({ positionRatio });
  }
}

export type { ITrackViewState };
export default TrackView;
