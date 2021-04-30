import bind from 'bind-decorator';

import Component from 'shared/scripts/Component/Component';

import './InputToggle.scss';

interface IInputToggleState {
  checked?: boolean;
}

class InputToggle extends Component<IInputToggleState> {
  declare protected state: IInputToggleState;

  declare protected children: {
    input: HTMLInputElement | null;
  };

  constructor(parent: HTMLElement | null) {
    super(parent, 'input-toggle');
  }

  protected initialize(): void {
    this.children = {
      input: this.element.querySelector('input'),
    };
    this.state = {
      checked: this.children.input?.checked,
    };
  }

  protected addEventListeners(): void {
    this.element.addEventListener('click', this.handleElementClick);
  }

  protected renderState({ checked }: IInputToggleState): void {
    if (typeof checked !== 'undefined' && this.children.input) {
      this.children.input.checked = checked;
    }
  }

  @bind
  private handleElementClick(): void {
    this.state.checked = this.children.input?.checked;
    this.notifyObservers(this.state);
    this.children.input?.blur();
  }
}

export type { IInputToggleState };
export default InputToggle;
