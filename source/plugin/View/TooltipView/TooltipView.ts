import SubView from '../SubView';

interface ITooltipViewState {
  value?: string;
  active?: boolean;
  hidden?: boolean;
  lastUsed?: boolean;
}

class TooltipView extends SubView<ITooltipViewState> {
  protected state: ITooltipViewState = {
    value: '',
    active: false,
    hidden: false,
    lastUsed: false,
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

  protected renderState({ value, active, hidden }: ITooltipViewState): void {
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

  // eslint-disable-next-line class-methods-use-this
  protected bindEventListeners(): void {}
}

export type { ITooltipViewState };
export default TooltipView;
