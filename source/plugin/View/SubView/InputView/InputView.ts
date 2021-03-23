import bind from 'bind-decorator';

import SubView, { ISubViewProps } from '../SubView';

interface IInputViewProps extends ISubViewProps {
  readonly name: string;
  readonly hidden: boolean;
}

interface IInputViewState {
  value?: string;
  active?: boolean;
}

class InputView extends SubView<IInputViewState, IInputViewProps, HTMLInputElement> {
  protected state: IInputViewState = {
    value: '',
    active: false,
  };

  public disable(disabled = true): void {
    super.disable(disabled);
    this.element.disabled = disabled;
  }

  protected renderMarkup(): HTMLInputElement {
    const element = document.createElement('input');
    element.setAttribute('class', `${this.props.cssClass} js-${this.props.cssClass}`);
    element.name = this.props.name;
    element.type = 'text';
    if (this.props.hidden) {
      element.classList.add(`${this.props.cssClass}_hidden`);
    } else {
      element.classList.remove(`${this.props.cssClass}_hidden`);
    }
    return element;
  }

  protected addEventListeners(): void {
    this.element.addEventListener('focus', this.handleInputFocus);
    this.element.addEventListener('blur', this.handleInputBlur);
    this.element.addEventListener('change', this.handleInputChange);
  }

  protected renderState({ value }: IInputViewState): void {
    if (typeof value !== 'undefined') {
      this.element.value = value;
    }
  }

  @bind
  private handleInputFocus(): void {
    this.notifyObservers({ active: true });
  }

  @bind
  private handleInputBlur(): void {
    this.notifyObservers({ active: false });
  }

  @bind
  private handleInputChange(event: Event): void {
    const { value } = event.currentTarget as HTMLInputElement;
    this.notifyObservers({ value });
  }
}

export type { IInputViewProps, IInputViewState };
export default InputView;
