import SubView from '../SubView';
import { TTheme, ISubViewProps } from '../ViewTypes';

interface IWrapperViewProps extends ISubViewProps {
  readonly theme: TTheme;
}

class WrapperView extends SubView<undefined, IWrapperViewProps> {
  protected renderMarkup(): HTMLElement {
    const { cssClass, orientation, theme } = this.props;
    const element = document.createElement('div');
    element.setAttribute('class', `${cssClass} js-${cssClass}`);

    if (orientation === 'vertical') {
      element.classList.add(`${cssClass}_vertical`);
    } else {
      element.classList.remove(`${cssClass}_vertical`);
    }
    if (theme === 'dark') {
      element.classList.add(`${cssClass}_dark`);
    } else {
      element.classList.remove(`${cssClass}_dark`);
    }

    return element;
  }

  // eslint-disable-next-line class-methods-use-this
  protected renderState(): void {}

  // eslint-disable-next-line class-methods-use-this
  protected bindEventListeners(): void {}
}

export default WrapperView;
