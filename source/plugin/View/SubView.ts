import Observable from '../Observable/Observable';
import { ISubViewProps } from './ViewTypes';

abstract class SubView<
  TState = undefined,
  TProps extends ISubViewProps = ISubViewProps,
> extends Observable<TState> {
  public readonly element: HTMLElement;

  protected readonly props: TProps;

  protected state?: TState;

  constructor(props: TProps) {
    super();
    this.props = props;
    this.element = this.renderMarkup();
    this.props.parent.appendChild(this.element);
    this.bindEventListeners();
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

  public getState(): TState {
    return JSON.parse(JSON.stringify(this.state));
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

  protected abstract renderState(state?: TState): void;

  protected abstract bindEventListeners(): void;

  protected renderMarkup(): HTMLElement {
    const element = document.createElement('div');
    element.setAttribute('class', `${this.props.cssClass} js-${this.props.cssClass}`);
    return element;
  }

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

  protected getRelativeMousePositionRatio(event: MouseEvent): number | never {
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
    throw new Error('Reference frame is not initialized');
  }

  protected getRelativeTouchPositionRatio(event: TouchEvent): number | never {
    if (this.props.referenceFrame) {
      const {
        offsetX,
        offsetY,
        width,
        height,
      } = this.props.referenceFrame;
      const touch = event.touches[0];
      let ratio: number;

      if (this.props.orientation === 'vertical') {
        ratio = (touch.clientY - offsetY) / height;
      } else {
        ratio = (touch.clientX - offsetX) / width;
      }
      if (ratio < 0) {
        return 0;
      }
      if (ratio > 1) {
        return 1;
      }
      return ratio;
    }
    throw new Error('Reference frame is not initialized');
  }
}

export default SubView;
