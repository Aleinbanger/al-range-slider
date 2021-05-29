import SubView from '../SubView';

interface ITooltipViewState {
  value?: string;
  lastValue?: string;
  active?: boolean;
  hidden?: boolean;
  lastUsed?: boolean;
}

class TooltipView extends SubView<ITooltipViewState> {
  protected renderMarkup(): HTMLElement {
    const element = document.createElement('span');
    element.setAttribute('class', `${this.props.cssClass} js-${this.props.cssClass}`);
    return element;
  }

  protected override initialize(): void {
    this.state = {
      value: '',
      lastValue: '',
      active: false,
      hidden: false,
      lastUsed: false,
    };
  }

  protected override renderState({ value, active, hidden }: ITooltipViewState): void {
    if (typeof value !== 'undefined') {
      this.element.textContent = value;
    }
    if (typeof active !== 'undefined') {
      if (active) {
        this.element.classList.add(`${this.props.cssClass}_active`);
      } else {
        this.element.classList.remove(`${this.props.cssClass}_active`);
      }
    }
    if (typeof hidden !== 'undefined') {
      if (hidden) {
        this.element.classList.add(`${this.props.cssClass}_hidden`);
      } else {
        this.element.classList.remove(`${this.props.cssClass}_hidden`);
      }
    }
  }
}

export type { ITooltipViewState };
export default TooltipView;
