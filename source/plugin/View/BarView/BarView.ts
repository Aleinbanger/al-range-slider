import SubView from '../SubView';

interface IBarViewState {
  from?: number;
  to?: number;
}

class BarView extends SubView<IBarViewState> {
  protected state: IBarViewState = {
    from: 0,
    to: 1,
  };

  protected renderMarkup(): HTMLElement {
    const element = document.createElement('span');
    element.setAttribute('class', `${this.props.cssClass} js-${this.props.cssClass}`);
    if (this.props.orientation === 'vertical') {
      element.classList.add(`${this.props.cssClass}_vertical`);
    } else {
      element.classList.remove(`${this.props.cssClass}_vertical`);
    }
    return element;
  }

  protected renderState({ from, to }: IBarViewState): void {
    let percentFrom: number;
    let percentTo: number;
    if (typeof from !== 'undefined' && typeof this.state.to !== 'undefined') {
      if (from < 0) {
        percentFrom = 0;
      } else if (from > 1) {
        percentFrom = 100;
      } else {
        percentFrom = from * 100;
      }
      percentTo = this.state.to * 100;
      if (this.props.orientation === 'vertical') {
        this.element.style.top = `${percentFrom}%`;
        this.element.style.height = `${percentTo - percentFrom}%`;
      } else {
        this.element.style.left = `${percentFrom}%`;
        this.element.style.width = `${percentTo - percentFrom}%`;
      }
    }
    if (typeof to !== 'undefined' && typeof this.state.from !== 'undefined') {
      if (to < 0) {
        percentTo = 0;
      } else if (to > 1) {
        percentTo = 100;
      } else {
        percentTo = to * 100;
      }
      percentFrom = this.state.from * 100;
      if (this.props.orientation === 'vertical') {
        this.element.style.height = `${percentTo - percentFrom}%`;
      } else {
        this.element.style.width = `${percentTo - percentFrom}%`;
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  protected bindEventListeners(): void {}
}

export default BarView;
