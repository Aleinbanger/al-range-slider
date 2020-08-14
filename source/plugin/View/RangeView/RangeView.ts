import SubView from '../SubView';

interface IRangeViewState {
  positionRatio: {
    from: number;
    to: number;
  }
}

class RangeView extends SubView<IRangeViewState, number> {
  protected state: IRangeViewState = {
    positionRatio: { from: 0, to: 1 },
  };

  public setSelectedPosition(id: 'from' | 'to', positionRatio: number): void {
    this.state.positionRatio[id] = positionRatio;
    this.renderSelectedPosition(id, positionRatio);
  }

  protected renderMarkup(): HTMLElement {
    const element = document.createElement('span');
    element.setAttribute('class', `${this.props.cssClass} js-${this.props.cssClass}`);
    return element;
  }

  protected renderSelectedPosition(id: 'from' | 'to', positionRatio: number): void {
    let percentFrom: number;
    let percentTo: number;
    switch (id) {
      case 'from':
        percentFrom = positionRatio * 100;
        percentTo = this.state.positionRatio.to * 100;
        this.element.style.left = `${percentFrom}%`;
        this.element.style.width = `${percentTo - percentFrom}%`;
        break;
      case 'to':
        percentFrom = this.state.positionRatio.from * 100;
        percentTo = positionRatio * 100;
        this.element.style.width = `${percentTo - percentFrom}%`;
        break;
      default:
        throw new Error('Range can only have the following ID values: "from", "to"');
    }
  }

  // eslint-disable-next-line class-methods-use-this
  protected bindEventListeners(): void {}
}

export default RangeView;
