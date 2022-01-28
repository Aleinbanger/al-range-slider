/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/dot-notation */

import Model from '../Model/Model';
import View from '../View/View';
import Presenter, { IProps } from './Presenter';

let parent: HTMLElement;
let presenter: Presenter;
let model: Model | undefined;
let view: View | undefined;
const props: IProps = {
  initialSelectedValues: { to: 0 },
  valuesPrecision: 4,
  collideKnobs: true,
  range: { min: -100, max: 100, step: 1 },
  orientation: 'horizontal',
  theme: 'light',
  grid: { minTicksStep: 1, marksStep: 1 },
  allowSmoothTransition: true,
  showInputs: true,
  showTooltips: true,
  collideTooltips: true,
  tooltipsSeparator: ' \u2192 ',
  onInit: jest.fn((state) => state),
  onStart: jest.fn((state) => state),
  onFinish: jest.fn((state) => state),
  onChange: jest.fn((state) => state),
  onUpdate: jest.fn((state) => state),
};

const getModelAndView = () => {
  model = presenter['__private_3_model' as keyof Presenter] as unknown as Model;
  view = presenter['__private_4_view' as keyof Presenter] as unknown as View;
};
const initializePresenter = () => {
  parent = document.createElement('div');
  document.body.appendChild(parent);
  presenter = new Presenter(parent, props);
  getModelAndView();
};
const testIfObserversExist = (doExist: boolean) => {
  if (doExist) {
    expect(model?.getObserverNames().length).toBe(2);
    expect(view?.getObserverNames().length).toBe(4);
  } else {
    expect(model?.getObserverNames().length).toBe(0);
    expect(view?.getObserverNames().length).toBe(0);
  }
};

beforeEach(() => {
  initializePresenter();
});
afterEach(() => {
  presenter.destroy();
  parent.remove();
});

describe('general methods', () => {
  test('should initialize model and view in the constructor and add observers', () => {
    expect(model).toBeInstanceOf(Model);
    expect(view).toBeInstanceOf(View);
    testIfObserversExist(true);
    const state = presenter.getState();
    expect(state?.selectedPoints?.to).toStrictEqual([0.5, 0]);
    if (props.onInit) {
      expect(props.onInit).lastReturnedWith(state);
    }
  });

  test('should destroy view and model', () => {
    const viewSpy = jest.spyOn(view!, 'destroy');
    presenter.destroy();
    expect(viewSpy).toBeCalled();
    getModelAndView();
    expect(model).toBeUndefined();
    expect(view).toBeUndefined();
  });

  test('should disable view and remove observers, then enable view and add observers', () => {
    const viewSpy = jest.spyOn(view!, 'disable');
    presenter.disable();
    expect(viewSpy).lastCalledWith(true);
    testIfObserversExist(false);
    presenter.disable(false);
    expect(viewSpy).lastCalledWith(false);
    testIfObserversExist(true);
  });

  test('should destroy and re-initialize model and view', () => {
    const destroySpy = jest.spyOn(presenter, 'destroy');
    presenter.restart();
    expect(destroySpy).toBeCalled();
    expect(model).toBeInstanceOf(Model);
    expect(view).toBeInstanceOf(View);
    presenter.restart({ initialSelectedValues: { to: 10 } });
    const state = presenter.getState();
    expect(state?.selectedPoints?.to[1]).toBe(10);
  });

  test('should update selected points by values', () => {
    presenter.update({ values: { to: 50 } });
    const state = presenter.getState();
    expect(state?.selectedPoints?.to[1]).toBe(50);
    if (props.onUpdate) {
      expect(props.onUpdate).lastReturnedWith(state);
    }
  });

  test('should update selected points by positions', () => {
    presenter.update({ positions: { to: 0 } });
    const state = presenter.getState();
    expect(state?.selectedPoints?.to[0]).toBe(0);
    if (props.onUpdate) {
      expect(props.onUpdate).lastReturnedWith(state);
    }
  });

  test('should get the state', () => {
    const state = presenter.getState();
    expect(state).toBeInstanceOf(Object);
  });
});

describe('model observers', () => {
  test('should handle currentPointLimits change', () => {
    const [id, limits] = ['to', { min: 0.1, max: 0.9 }];
    const viewSpy = jest.spyOn(view!, 'setState');
    model?.['notifyObservers']({ currentPointLimits: [id, limits] });
    expect(viewSpy).lastCalledWith({ currentPositionLimits: [id, limits] });
  });

  test('should handle currentPoint change', () => {
    const [id, point]: [string, [number, number]] = ['to', [0, -100]];
    const viewSpy = jest.spyOn(view!, 'setState');
    model?.['notifyObservers']({ currentPoint: [id, point] });
    expect(viewSpy).lastCalledWith({
      currentPosition: [id, point[0]],
      currentValue: [id, point[1]],
    });
    if (props.onChange) {
      const state = presenter.getState();
      expect(props.onChange).lastReturnedWith(state);
    }
  });
});

describe('view observers', () => {
  test.each([
    ['to', true],
    ['to', false],
  ])('should handle currentActiveStatus change', (id, active) => {
    const viewSpy = jest.spyOn(view!, 'setState');
    const modelSpy = jest.spyOn(model!, 'selectPointLimits');
    view?.['notifyObservers']({ currentActiveStatus: [id, active] });
    expect(viewSpy).nthCalledWith(1, { currentActiveStatus: [id, active] });
    const state = presenter.getState();
    if (active) {
      expect(modelSpy).lastCalledWith(id);
      if (props.onStart) {
        expect(props.onStart).lastReturnedWith(state);
      }
    } else if (props.onFinish) {
      expect(props.onFinish).lastReturnedWith(state);
    }
  });

  test('should handle currentPosition change', () => {
    const [id, position] = ['to', 1];
    const modelSpy = jest.spyOn(model!, 'selectPointByPosition');
    view?.['notifyObservers']({ currentPosition: [id, position] });
    expect(modelSpy).lastCalledWith([id, position]);
  });

  test('should handle currentValue change', () => {
    const [id, value] = ['to', '100'];
    const modelSpy = jest.spyOn(model!, 'selectPointByValue');
    view?.['notifyObservers']({ currentValue: [id, value] });
    expect(modelSpy).lastCalledWith([id, value]);
  });

  test('should handle unknownPosition change', () => {
    const unknownPosition = 1;
    const modelSpy = jest.spyOn(model!, 'selectPointByUnknownPosition');
    view?.['notifyObservers']({ unknownPosition });
    expect(modelSpy).lastCalledWith(unknownPosition);
  });
});
