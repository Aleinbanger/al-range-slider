import SubView from '../SubView';

interface IRangeViewState {
  from?: number;
  to?: number;
}

class RangeView extends SubView<IRangeViewState> {
  protected state: IRangeViewState = {
    from: 0,
    to: 1,
  };

  protected renderMarkup(): HTMLElement {
    const element = document.createElement('span');
    element.setAttribute('class', `${this.props.cssClass} js-${this.props.cssClass}`);
    return element;
  }

  protected renderState({ from, to }: IRangeViewState): void {
    let percentFrom: number;
    let percentTo: number;
    if (typeof from !== 'undefined' && typeof this.state.to !== 'undefined') {
      if (from < 0 || from > 1) {
        throw new Error('Invalid "from" value, must be in between 0 and 1');
      }
      percentFrom = from * 100;
      percentTo = this.state.to * 100;
      this.element.style.left = `${percentFrom}%`;
      this.element.style.width = `${percentTo - percentFrom}%`;
    }
    if (typeof to !== 'undefined' && typeof this.state.from !== 'undefined') {
      if (to < 0 || to > 1) {
        throw new Error('Invalid "to" value, must be in between 0 and 1');
      }
      percentFrom = this.state.from * 100;
      percentTo = to * 100;
      this.element.style.width = `${percentTo - percentFrom}%`;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  protected bindEventListeners(): void {}
}

export default RangeView;
