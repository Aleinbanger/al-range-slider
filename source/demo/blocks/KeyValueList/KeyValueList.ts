import bind from 'bind-decorator';

import Component from 'shared/scripts/Component/Component';

import './KeyValueList.scss';

interface IKeyValueListProps {
  placeholders: [key: string, value: string];
}

interface IKeyValueListState {
  items?: Record<string, string | number>;
  tmpKey?: string;
}

class KeyValueList extends Component<IKeyValueListState, IKeyValueListProps> {
  declare protected readonly props: IKeyValueListProps;

  declare protected state: IKeyValueListState;

  declare protected children: {
    addButton: HTMLElement | null;
    items: HTMLElement[];
  };

  constructor(parent: HTMLElement | null, props: IKeyValueListProps = { placeholders: ['', ''] }) {
    super(parent, 'key-value-list', props);
  }

  protected initialize(): void {
    this.state = {
      items: {},
      tmpKey: '',
    };
    this.children = {
      addButton: this.element.querySelector(`.js-${this.cssClass}__button_add`),
      items: [],
    };
  }

  protected addEventListeners(): void {
    this.children.addButton?.addEventListener('mousedown', this.handleButtonMouseDown);
    this.children.addButton?.addEventListener('click', this.handleAddButtonClick);
  }

  protected renderState({ items }: IKeyValueListState): void {
    if (typeof items !== 'undefined') {
      Object.entries(items).forEach(([key, value]) => {
        this.createItem(key, value);
      });
    }
  }

  private createItem(key?: string, value?: string | number):
  [keyInput: HTMLInputElement, valueInput: HTMLInputElement] {
    const item = document.createElement('span');
    item.setAttribute('class', `${this.cssClass}__item js-${this.cssClass}__item`);
    this.element.insertBefore(item, this.children.addButton);
    this.children.items.push(item);

    const keyInput = document.createElement('input');
    keyInput.setAttribute('class', `${this.cssClass}__input js-${this.cssClass}__input_key`);
    keyInput.type = 'text';
    keyInput.value = key ?? '';
    keyInput.disabled = true;
    item.appendChild(keyInput);
    const valueInput = document.createElement('input');
    valueInput.setAttribute('class', `${this.cssClass}__input js-${this.cssClass}__input_value`);
    valueInput.type = 'text';
    valueInput.value = value ? String(value) : '';
    valueInput.disabled = true;
    item.appendChild(valueInput);
    [keyInput.placeholder, valueInput.placeholder] = this.props.placeholders;

    const closeButton = document.createElement('button');
    closeButton.setAttribute('class',
      `${this.cssClass}__button ${this.cssClass}__button_close js-${this.cssClass}__button_close`);
    closeButton.type = 'button';
    closeButton.textContent = '\u274C';
    closeButton.dataset.key = key ?? '';
    item.appendChild(closeButton);
    closeButton.addEventListener('mousedown', this.handleButtonMouseDown);
    closeButton.addEventListener('click', this.handleCloseButtonClick);

    return [keyInput, valueInput];
  }

  @bind
  // eslint-disable-next-line class-methods-use-this
  private handleButtonMouseDown(event: MouseEvent): void {
    event.preventDefault();
  }

  @bind
  private handleAddButtonClick(): void {
    const [keyInput, valueInput] = this.createItem();
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
      input.focus();
    } else {
      input.disabled = true;
      this.state.tmpKey = input.value;
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
    input.disabled = true;
    if (this.state.items && this.state.tmpKey) {
      this.state.items[this.state.tmpKey] = input.value;
    }
    this.notifyObservers(this.state);

    input.removeEventListener('change', this.handleValueInputChange);
  }
}

export type { IKeyValueListState };
export default KeyValueList;
