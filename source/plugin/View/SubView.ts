import Observable from '../Observable/Observable';
import { TOrientation, ISubViewProps } from './ViewTypes';

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
    this.setOrientation('horizontal');
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

  public setOrientation(orientation: TOrientation): void {
    this.props.orientation = orientation;
  }

  protected abstract renderMarkup(): HTMLElement;

  protected abstract renderState(state?: TState): void;

  protected abstract bindEventListeners(): void;

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

      let ratio;
      switch (this.props.orientation) {
        case 'horizontal':
          ratio = (event.clientX - offsetX) / width;
          break;
        case 'vertical':
          ratio = (event.clientY - offsetY) / height;
          break;
        default:
          throw new Error('Invalid "orientation" value');
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
