import { cloneDeep } from 'shared/scripts/utils';

import Observable from '../../Observable/Observable';
import { ICommonViewProps, TReferenceFrame } from '../ViewTypes';

interface ISubViewProps extends ICommonViewProps {
  referenceFrame?: TReferenceFrame;
}

abstract class SubView<
  TState = undefined,
  TProps extends ISubViewProps = ISubViewProps,
  TElement extends HTMLElement = HTMLElement,
> extends Observable<TState> {
  public readonly element: TElement;

  protected readonly parent: HTMLElement;

  protected readonly props: TProps;

  protected state?: TState;

  constructor(parent: HTMLElement, props: TProps) {
    super();
    this.parent = parent;
    this.props = cloneDeep(props);
    this.element = this.renderMarkup();
    this.parent.appendChild(this.element);
    this.initialize();
    this.addEventListeners();
  }

  public destroy(): void {
    this.element.remove();
  }

  public disable(disabled = true): void {
    if (disabled) {
      this.element.classList.add(`${this.props.cssClass}_disabled`);
    } else {
      this.element.classList.remove(`${this.props.cssClass}_disabled`);
    }
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

  protected abstract renderMarkup(): TElement;

  // eslint-disable-next-line class-methods-use-this
  protected initialize(): void {}

  // eslint-disable-next-line class-methods-use-this
  protected addEventListeners(): void {}

  // eslint-disable-next-line class-methods-use-this
  protected renderState(_state?: TState): void {}

  protected setReferenceFrame(reference: HTMLElement): void | never {
    const rect = reference.getBoundingClientRect();
    const offsetX = rect.x;
    const offsetY = rect.y;
    const width = reference.clientWidth;
    const height = reference.clientHeight;
    this.props.referenceFrame = {
      offsetX,
      offsetY,
      width,
      height,
    };
  }

  protected getRelativePointerPositionRatio(event: PointerEvent): number | never {
    if (this.props.referenceFrame) {
      const {
        offsetX,
        offsetY,
        width,
        height,
      } = this.props.referenceFrame;
      let ratio: number;

      if (this.props.orientation === 'vertical') {
        ratio = (event.clientY - offsetY) / height;
      } else {
        ratio = (event.clientX - offsetX) / width;
      }
      if (ratio < 0) {
        return 0;
      }
      if (ratio > 1) {
        return 1;
      }
      return ratio;
    }
    throw new Error('Reference frame has not been set');
  }
}

export type { ISubViewProps };
export default SubView;
