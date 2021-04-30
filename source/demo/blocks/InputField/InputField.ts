import bind from 'bind-decorator';

import Component from 'shared/scripts/Component/Component';

import './InputField.scss';

interface IInputFieldState {
  value?: string;
}

class InputField extends Component<IInputFieldState> {
  declare protected state: IInputFieldState;

  declare protected children: {
    input: HTMLInputElement | null;
  };

  constructor(parent: HTMLElement | null) {
    super(parent, 'input-field');
  }

  protected initialize(): void {
    this.state = {
      value: '',
    };
    this.children = {
      input: this.element.querySelector(`.js-${this.cssClass}__field`),
    };
  }

  protected addEventListeners(): void {
    this.children.input?.addEventListener('change', this.handleInputChange);
  }

  protected renderState({ value }: IInputFieldState): void {
    if (typeof value !== 'undefined' && this.children.input) {
      this.children.input.value = value;
    }
  }

  @bind
  private handleInputChange(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    const isValid = input.reportValidity();
    if (!isValid) {
      input.focus();
    } else {
      this.state.value = input.value;
      this.notifyObservers(this.state);
    }
  }
}

export type { IInputFieldState };
export default InputField;
