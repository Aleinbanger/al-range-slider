import SubView from '../SubView';

class TrackView extends SubView {
  protected renderMarkup(): HTMLElement {
    const element = document.createElement('div');
    element.setAttribute('class', `${this.props.cssClass} js-${this.props.cssClass}`);
    return element;
  }

  protected renderState(): void {}

  protected bindEventListeners(): void {}
}

export default TrackView;
