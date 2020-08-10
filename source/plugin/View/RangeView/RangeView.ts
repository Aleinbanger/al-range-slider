import SubView from '../SubView';

interface IRangeViewState {
  positionRatio: {
    from: number;
    to: number;
  }
}

class RangeView extends SubView<IRangeViewState> {
  protected state: IRangeViewState = {
    positionRatio: { from: 0, to: 1 },
  };

  protected renderMarkup(): HTMLElement {
    const element = document.createElement('span');
    element.setAttribute('class', `${this.props.cssClass} js-${this.props.cssClass}`);
    return element;
  }

  protected renderState({ positionRatio }: IRangeViewState): void {
    const percentFrom = positionRatio.from * 100;
    const percentTo = positionRatio.to * 100;
    this.element.style.left = `${percentFrom}%`;
    this.element.style.width = `${percentTo}%`;
  }

  // eslint-disable-next-line class-methods-use-this
  protected bindEventListeners(): void {}
}

export type { IRangeViewState };
export default RangeView;
