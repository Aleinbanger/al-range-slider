/* eslint-disable class-methods-use-this */

import Component from './Component';

interface ITestComponentProps {
  testProp: number;
}

interface ITestComponentState {
  testState?: string;
}

const initializeMock = jest.fn();
const addEventListenersMock = jest.fn();
const renderStateMock = jest.fn((state: ITestComponentState) => state);
const cssClass = 'test-component';

class TestComponent extends Component<ITestComponentState, ITestComponentProps> {
  constructor(parent: HTMLElement | null, props: ITestComponentProps) {
    super(parent, cssClass, props);
  }

  protected override initialize(): void {
    this.state = {
      testState: '1',
    };
    initializeMock();
  }

  protected override addEventListeners(): void {
    addEventListenersMock();
  }

  protected override renderState(state: ITestComponentState): void {
    renderStateMock(state);
  }
}

let testComponent: TestComponent;
let parent: HTMLElement;
const props: ITestComponentProps = {
  testProp: 1,
};

describe('general methods', () => {
  beforeEach(() => {
    parent = document.createElement('div');
    parent.setAttribute('class', `${cssClass} js-${cssClass}`);
    document.body.appendChild(parent);
    testComponent = new TestComponent(parent, props);
  });
  afterEach(() => {
    testComponent.destroy();
    parent.remove();
  });

  test('should attach markup in the constructor', () => {
    expect(testComponent.element).toBe(parent);
  });

  test('should call "initialize" and "addEventListeners" in the constructor', () => {
    expect(initializeMock).toBeCalledTimes(1);
    expect(addEventListenersMock).toBeCalledTimes(1);
  });

  test('should get the state', () => {
    const state = testComponent.getState();
    expect(state?.testState).toBe('1');
  });

  test('should set and get the correct state', () => {
    testComponent.setState({ testState: 'one' });
    expect(renderStateMock).toBeCalledTimes(1);
    expect(renderStateMock).lastReturnedWith({ testState: 'one' });
    const state = testComponent.getState();
    expect(state?.testState).toBe('one');
  });

  test('should remove the element', () => {
    testComponent.destroy();
    const element = parent.querySelector(`.${cssClass}`);
    expect(element).toBeFalsy();
  });
});
