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

type TInputViewEvent = {
  kind: 'input value change';
  data: NonNullable<IInputViewState['value']>;
} | {
  kind: 'input active change';
  data: NonNullable<IInputViewState['active']>;
};

class InputView extends SubView<
TInputViewEvent, IInputViewState, IInputViewProps, HTMLInputElement> {
  public override disable(disabled = true): void {
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

  protected override initialize(): void {
    this.state = {
      value: '',
      active: false,
    };
  }

  protected override addEventListeners(): void {
    this.element.addEventListener('focus', this.handleInputFocus);
    this.element.addEventListener('blur', this.handleInputBlur);
    this.element.addEventListener('change', this.handleInputChange);
  }

  protected override renderState({ value }: IInputViewState): void {
    if (typeof value !== 'undefined') {
      this.element.value = value;
    }
  }

  @bind
  private handleInputFocus(): void {
    this.notifyObservers({ kind: 'input active change', data: true });
  }

  @bind
  private handleInputBlur(): void {
    this.notifyObservers({ kind: 'input active change', data: false });
  }

  @bind
  private handleInputChange(event: Event): void {
    const { value } = event.currentTarget as HTMLInputElement;
    this.notifyObservers({ kind: 'input value change', data: value });
  }
}

export type { IInputViewProps, IInputViewState, TInputViewEvent };
export default InputView;
