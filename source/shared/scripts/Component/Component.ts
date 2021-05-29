/* eslint-disable class-methods-use-this */

import Observable from '../Observable/Observable';
import { cloneDeep } from '../utils/utils';

abstract class Component<
  TState = undefined,
  TProps = undefined,
  TElement extends HTMLElement = HTMLElement,
> extends Observable<TState> {
  public readonly element: TElement;

  protected readonly cssClass: string;

  protected readonly props?: TProps;

  protected state?: TState;

  protected children?: Record<string, unknown>;

  constructor(parent: HTMLElement | null, cssClass: string, props?: TProps) {
    super();
    this.cssClass = cssClass;
    this.props = cloneDeep(props);
    this.element = this.#attachMarkup(parent);
    this.initialize();
    this.addEventListeners();
  }

  public destroy(): void {
    this.element.remove();
  }

  public getState(): TState | undefined {
    return cloneDeep(this.state);
  }

  public setState(state: TState): void {
    Object.entries(state).forEach(([key, value]) => {
      if (this.state) {
        const isValidState = key in this.state && typeof value !== 'undefined';
        if (isValidState) {
          this.state[key as keyof TState] = value as TState[keyof TState];
        }
      }
    });
    this.renderState(state);
  }

  protected initialize(): void {}

  protected addEventListeners(): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected renderState(_state?: TState): void {}

  #attachMarkup(parent: HTMLElement | null): TElement | never {
    if (parent) {
      let element: TElement;
      if (parent.classList.contains(`js-${this.cssClass}`)) {
        element = parent as TElement;
      } else {
        element = parent.querySelector(`.js-${this.cssClass}`) as TElement;
      }
      if (element) {
        return element;
      }
      throw new Error(`Could not attach markup to the Component,
        HTMLElement is missing Component's cssClass: "js-${this.cssClass}"`);
    }
    throw new Error('Could not attach markup to the Component, parent is null');
  }
}

export default Component;
