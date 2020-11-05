import bind from 'bind-decorator';

import SubView from '../SubView';

interface ITooltipViewState {
  value?: string;
  active?: boolean;
}

class TooltipView extends SubView<ITooltipViewState> {
  protected state: ITooltipViewState = {
    value: '',
    active: false,
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

  protected renderState({ value, active }: ITooltipViewState): void {
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
  }

  protected bindEventListeners(): void {
    // this.element.addEventListener('mousedown', this.handleTooltipMouseDown);
  }

  // @bind
  // private handleTooltipMouseDown(): void {
  //   document.addEventListener('mouseup', this.handleDocumentMouseUp);
  // }

  // @bind
  // private handleDocumentMouseUp(): void {
  //   document.removeEventListener('mouseup', this.handleDocumentMouseUp);
  // }
}

export type { ITooltipViewState };
export default TooltipView;
