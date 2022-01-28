import bind from 'bind-decorator';

import Component from 'shared/scripts/Component/Component';
import { isNumeric } from 'shared/scripts/utils/utils';

import './KeyValueList.scss';

interface ITextInputProps {
  type: 'text';
  placeholder?: string;
}

interface INumberInputProps {
  type: 'number';
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

interface IKeyValueListProps {
  keyInput?: ITextInputProps | INumberInputProps;
  valueInput?: ITextInputProps | INumberInputProps;
}

interface IKeyValueListState {
  items?: Record<string | number, string | number>;
  tmpKey?: string | number;
}

class KeyValueList extends Component<IKeyValueListState, IKeyValueListProps> {
  declare protected state: IKeyValueListState;

  declare protected children: {
    addButton: HTMLElement | null;
    items: HTMLElement[];
  };

  constructor(parent: HTMLElement | null, props?: IKeyValueListProps) {
    super(parent, 'key-value-list', props);
  }

  protected override initialize(): void {
    this.state = {
      items: {},
      tmpKey: '',
    };
    this.children = {
      addButton: this.element.querySelector(`.js-${this.cssClass}__button_add`),
      items: [],
    };
  }

  protected override addEventListeners(): void {
    this.children.addButton?.addEventListener('click', this.handleAddButtonClick);
  }

  protected override renderState({ items }: IKeyValueListState): void {
    if (typeof items !== 'undefined') {
      Object.entries(items).forEach(([key, value]) => {
        this.#createItem(key, value);
      });
    }
  }

  #createItem(key?: string | number, value?: string | number):
  [keyInput: HTMLInputElement, valueInput: HTMLInputElement] {
    const item = document.createElement('span');
    item.setAttribute('class', `${this.cssClass}__item js-${this.cssClass}__item`);
    this.element.insertBefore(item, this.children.addButton);
    this.children.items.push(item);

    const keyInput = document.createElement('input');
    keyInput.setAttribute('class', `${this.cssClass}__input js-${this.cssClass}__input_key`);
    keyInput.type = 'text';
    keyInput.value = String(key ?? '');
    keyInput.pattern = '^\\S.*';
    keyInput.required = true;
    keyInput.disabled = true;
    if (this.props?.keyInput) {
      const { type, placeholder } = this.props.keyInput;
      keyInput.type = type;
      keyInput.placeholder = placeholder ?? '';
      if ('min' in this.props.keyInput) {
        keyInput.min = String(this.props.keyInput.min ?? '');
      }
      if ('max' in this.props.keyInput) {
        keyInput.max = String(this.props.keyInput.max ?? '');
      }
      if ('step' in this.props.keyInput) {
        keyInput.step = String(this.props.keyInput.step ?? '');
      }
    }
    item.appendChild(keyInput);

    const valueInput = document.createElement('input');
    valueInput.setAttribute('class', `${this.cssClass}__input js-${this.cssClass}__input_value`);
    valueInput.type = 'text';
    valueInput.value = String(value ?? '');
    valueInput.pattern = '^\\S.*';
    valueInput.required = true;
    valueInput.disabled = true;
    if (this.props?.valueInput) {
      const { type, placeholder } = this.props.valueInput;
      valueInput.type = type;
      valueInput.placeholder = placeholder ?? '';
      if ('min' in this.props.valueInput) {
        keyInput.min = String(this.props.valueInput.min ?? '');
      }
      if ('max' in this.props.valueInput) {
        keyInput.max = String(this.props.valueInput.max ?? '');
      }
      if ('step' in this.props.valueInput) {
        keyInput.step = String(this.props.valueInput.step ?? '');
      }
    }
    item.appendChild(valueInput);

    const closeButton = document.createElement('button');
    closeButton.setAttribute('class',
      `${this.cssClass}__button ${this.cssClass}__button_close js-${this.cssClass}__button_close`);
    closeButton.type = 'button';
    closeButton.textContent = '\u274C';
    closeButton.dataset.key = String(key ?? '');
    item.appendChild(closeButton);
    closeButton.addEventListener('click', this.handleCloseButtonClick);

    return [keyInput, valueInput];
  }

  @bind
  private handleAddButtonClick(): void {
    const [keyInput, valueInput] = this.#createItem();
    keyInput.disabled = false;

    keyInput.addEventListener('change', this.handleKeyInputChange);
    valueInput.addEventListener('change', this.handleValueInputChange);

    keyInput.focus();
  }

  @bind
  private handleCloseButtonClick(event: MouseEvent): void {
    const closeButton = event.currentTarget as HTMLElement;
    const { key } = closeButton.dataset;
    closeButton.parentElement?.remove();
    if (key) {
      delete this.state.items?.[key];
      this.notifyObservers(this.state);
    }
  }

  @bind
  private handleKeyInputChange(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    const isKeyDuplicated = this.state.items && Object.keys(this.state.items).includes(input.value);
    if (isKeyDuplicated) {
      input.setCustomValidity('Key cannot be duplicated.');
    } else {
      input.setCustomValidity('');
    }
    const isValid = input.reportValidity();
    if (isKeyDuplicated || !isValid) {
      input.focus();
    } else {
      input.disabled = true;
      const { value } = input;
      this.state.tmpKey = isNumeric(value) ? Number(value) : value;
      const nextInput = input.nextElementSibling as HTMLInputElement | null;
      if (nextInput) {
        nextInput.disabled = false;
        nextInput.focus();
      }
      const closeButton = nextInput?.nextElementSibling as HTMLInputElement | null;
      if (closeButton) {
        closeButton.dataset.key = input.value;
      }

      input.removeEventListener('change', this.handleKeyInputChange);
    }
  }

  @bind
  private handleValueInputChange(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    if (!input.reportValidity()) {
      input.focus();
    } else {
      input.disabled = true;
      if (this.state.items && this.state.tmpKey) {
        const { value } = input;
        this.state.items[this.state.tmpKey] = isNumeric(value) ? Number(value) : value;
      }
      this.notifyObservers(this.state);

      input.removeEventListener('change', this.handleValueInputChange);
    }
  }
}

export type { IKeyValueListState };
export default KeyValueList;
