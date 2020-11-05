import bind from 'bind-decorator';

import SubView from '../SubView';
import { ISubViewProps } from '../ViewTypes';

interface IInputViewProps extends ISubViewProps {
  readonly name: string;
}

interface IInputViewState {
  value?: string;
  active?: boolean;
}

class InputView extends SubView<IInputViewState, IInputViewProps> {
  protected state: IInputViewState = {
    value: '',
  };

  protected renderMarkup(): HTMLInputElement {
    const element = document.createElement('input');
    element.setAttribute('class', `${this.props.cssClass} js-${this.props.cssClass}`);
    element.name = this.props.name;
    element.type = 'text';
    return element;
  }

  protected renderState({ value }: IInputViewState): void {
    if (typeof value !== 'undefined') {
      (this.element as HTMLInputElement).value = value;
    }
  }

  protected bindEventListeners(): void {
    this.element.addEventListener('focus', this.handleInputFocus);
    this.element.addEventListener('blur', this.handleInputBlur);
    this.element.addEventListener('change', this.handleInputChange);
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

export type { IInputViewState };
export default InputView;
