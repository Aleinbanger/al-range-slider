import SubView, { ISubViewProps } from './SubView';

interface ITestViewState {
  test?: string;
}

const initializeMock = jest.fn();
const addEventListenersMock = jest.fn();
const renderStateMock = jest.fn((state: ITestViewState) => state);

class TestView extends SubView<ITestViewState> {
  protected state: ITestViewState = {
    test: '1',
  };

  // eslint-disable-next-line class-methods-use-this
  protected initialize(): void {
    initializeMock();
  }

  // eslint-disable-next-line class-methods-use-this
  protected addEventListeners(): void {
    addEventListenersMock();
  }

  // eslint-disable-next-line class-methods-use-this
  protected renderState(state: ITestViewState): void {
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
    expect(renderStateMock.mock.results[0].value).toStrictEqual({ test: 'one' });
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
