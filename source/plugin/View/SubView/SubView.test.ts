/* eslint-disable class-methods-use-this */

import SubView, { ISubViewProps } from './SubView';

interface ITestViewState {
  test?: string;
}

const initializeMock = jest.fn();
const addEventListenersMock = jest.fn();
const renderStateMock = jest.fn((state: ITestViewState) => state);

class TestView extends SubView<never, ITestViewState> {
  protected renderMarkup(): HTMLElement {
    const element = document.createElement('div');
    element.setAttribute('class', `${this.props.cssClass} js-${this.props.cssClass}`);
    return element;
  }

  protected override initialize(): void {
    this.state = {
      test: '1',
    };
    initializeMock();
  }

  protected override addEventListeners(): void {
    addEventListenersMock();
  }

  protected override renderState(state: ITestViewState): void {
    renderStateMock(state);
  }
}

let testView: TestView;
let parent: HTMLElement;
const props: ISubViewProps = {
  cssClass: 'test-class',
  orientation: 'horizontal',
};

describe('general methods', () => {
  beforeEach(() => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
    testView = new TestView(parent, props);
  });
  afterEach(() => {
    testView.destroy();
    parent.remove();
  });

  test('should render markup in the constructor', () => {
    const element = parent.querySelector(`.${props.cssClass}`);
    expect(element).toBeTruthy();
  });

  test('should call "initialize" and "addEventListeners" in the constructor', () => {
    expect(initializeMock).toBeCalledTimes(1);
    expect(addEventListenersMock).toBeCalledTimes(1);
  });

  test('should get the state', () => {
    const state = testView.getState();
    expect(state?.test).toBe('1');
  });

  test('should set and get the correct state', () => {
    testView.setState({ test: 'one' });
    expect(renderStateMock).toBeCalledTimes(1);
    expect(renderStateMock).lastReturnedWith({ test: 'one' });
    const state = testView.getState();
    expect(state?.test).toBe('one');
  });

  test('should add and remove "disabled" class modifier', () => {
    const checkIfDisabled = () => testView.element.classList.contains(`${props.cssClass}_disabled`);
    testView.disable();
    expect(checkIfDisabled()).toBe(true);
    testView.disable(false);
    expect(checkIfDisabled()).toBe(false);
  });

  test('should remove the element', () => {
    testView.destroy();
    const element = parent.querySelector(`.${props.cssClass}`);
    expect(element).toBeFalsy();
  });
});
