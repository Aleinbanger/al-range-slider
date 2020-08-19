import SubView from '../SubView';

class WrapperView extends SubView {
  protected renderMarkup(): HTMLElement {
    const element = document.createElement('div');
    element.setAttribute('class', `${this.props.cssClass} js-${this.props.cssClass}`);
    return element;
  }

  // eslint-disable-next-line class-methods-use-this
  protected renderState(): void {}

  // eslint-disable-next-line class-methods-use-this
  protected bindEventListeners(): void {}
}

export default WrapperView;
