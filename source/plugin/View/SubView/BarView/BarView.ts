import SubView from '../SubView';

interface IBarViewState {
  from?: number;
  to?: number;
}

class BarView extends SubView<IBarViewState> {
  protected renderMarkup(): HTMLElement {
    const element = document.createElement('span');
    element.setAttribute('class', `${this.props.cssClass} js-${this.props.cssClass}`);
    return element;
  }

  protected override initialize(): void {
    this.state = {
      from: 0,
      to: 1,
    };
  }

  protected override renderState({ from, to }: IBarViewState): void {
    if (typeof from !== 'undefined') {
      const percentFrom = BarView.#getPercent(from);
      const percentTo = (this.state?.to ?? 1) * 100;
      const difference = BarView.#getDifference(percentTo, percentFrom);
      if (this.props.orientation === 'vertical') {
        this.element.style.bottom = `${percentFrom}%`;
        this.element.style.height = `${difference}%`;
      } else {
        this.element.style.left = `${percentFrom}%`;
        this.element.style.width = `${difference}%`;
      }
    }
    if (typeof to !== 'undefined') {
      const percentTo = BarView.#getPercent(to);
      const percentFrom = (this.state?.from ?? 0) * 100;
      const difference = BarView.#getDifference(percentTo, percentFrom);
      if (this.props.orientation === 'vertical') {
        this.element.style.height = `${difference}%`;
      } else {
        this.element.style.width = `${difference}%`;
      }
    }
  }

  static #getPercent(positionRatio: number): number {
    let percent: number;
    if (positionRatio < 0) {
      percent = 0;
    } else if (positionRatio > 1) {
      percent = 100;
    } else {
      percent = positionRatio * 100;
    }
    return percent;
  }

  static #getDifference(percentTo: number, percentFrom: number): number {
    const difference = percentTo - percentFrom;
    return difference < 0 ? 0 : difference;
  }
}

export type { IBarViewState };
export default BarView;
