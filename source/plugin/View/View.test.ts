/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { ExtractFunctionKeys } from 'shared/scripts/typeUtils';

import { IViewProps, IViewState } from './ViewTypes';
import View from './View';
import SubView from './SubView/SubView';

let view: View;
let parent: HTMLElement;
const propsCases: [description: string, props: IViewProps][] = [
  [
    'initialized with orientation: "horizontal"',
    {
      cssClass: 'test-class',
      orientation: 'horizontal',
      theme: 'light',
      selectedIds: ['from', 'to'],
      grid: { pointsMap: [], minTicksStep: 1, marksStep: 1 },
      showInputs: true,
      showTooltips: true,
      collideTooltips: true,
      allowSmoothTransition: true,
    },
  ],
  [
    'initialized with orientation: "vertical"',
    {
      cssClass: 'test-class',
      orientation: 'vertical',
      theme: 'dark',
      selectedIds: ['from', 'to'],
      grid: undefined,
      showInputs: false,
      showTooltips: false,
      collideTooltips: false,
      allowSmoothTransition: false,
    },
  ],
];

describe.each(propsCases)('%s', (_description, props) => {
  const initializeView = (mockObserver?: jest.Mock) => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
    view = new View(parent, props);
    if (mockObserver) {
      view.addObserver(mockObserver);
    }
  };
  const spyOnAllSubViews = (
    method: ExtractFunctionKeys<SubView>, subViews = view['subViews'],
  ) => {
    const spies: Array<jest.SpyInstance> = [];
    Object.values(subViews).forEach((subView) => {
      if (subView instanceof SubView && typeof subView[method] === 'function') {
        spies.push(jest.spyOn(subView, method));
      } else if (typeof subView === 'object') {
        spies.push(...spyOnAllSubViews(method, subView as unknown as View['subViews']));
      }
    });
    return spies;
  };

  describe('general methods', () => {
    beforeEach(() => {
      initializeView();
    });
    afterEach(() => {
      view.destroy();
      parent.remove();
    });

    test('should initialize necessary SubViews in the constructor', () => {
      const wrapper = parent.querySelector(`.${props.cssClass}`);
      expect(wrapper).toBeTruthy();
      const track = parent.querySelector(`.${props.cssClass}__track`);
      expect(track).toBeTruthy();
      const knobs = parent.querySelectorAll(`.${props.cssClass}__knob`);
      expect(knobs.length).toBe(2);
      const bars = parent.querySelectorAll(`.${props.cssClass}__bar`);
      expect(bars.length).toBe(1);
      if (props.grid) {
        const grid = parent.querySelector(`.${props.cssClass}__grid`);
        expect(grid).toBeTruthy();
      }
      if (props.showInputs) {
        const inputs = parent.querySelectorAll(`.${props.cssClass}__input`);
        expect(inputs.length).toBe(2);
      }
      if (props.showTooltips) {
        const tooltips = parent.querySelectorAll(`.${props.cssClass}__tooltip`);
        expect(tooltips.length).toBe(2);
      }
    });

    test('should call "destroy" on all SubViews and remove all elements', () => {
      const spies = spyOnAllSubViews('destroy');
      view.destroy();
      expect(spies.every((spy) => spy.mock.calls.length === 1)).toBe(true);
      const elements = parent.querySelectorAll('*');
      expect(elements.length).toBe(0);
    });

    test('should call "disable" on all SubViews', () => {
      const spies = spyOnAllSubViews('disable');
      view.disable();
      expect(spies.every((spy) => spy.mock.calls.length === 1)).toBe(true);
      view.disable(false);
      expect(spies.every((spy) => spy.mock.calls.length === 2)).toBe(true);
    });

    test('should get the state', () => {
      const state = view.getState();
      expect(state).toBeInstanceOf(Object);
    });

    test.each([
      ['from', 0.1],
      ['to', 0.9],
    ])('should set "currentPosition" state on the corresponding SubViews with id "%s"', (id, positionRatio) => {
      const knob = view['subViews'].knobs?.[id];
      expect(knob).toBeDefined();
      const knobSpy = jest.spyOn(knob!, 'setState');
      const bar = view['subViews'].bars?.fromto;
      expect(bar).toBeDefined();
      const barSpy = jest.spyOn(bar!, 'setState');
      view.setState({ currentPosition: [id, positionRatio] });
      expect(knobSpy).lastCalledWith({ positionRatio });
      expect(barSpy).lastCalledWith({ [id]: positionRatio });
    });

    test.each([
      ['from', { min: 0, max: 0.5 }],
      ['to', { min: 0.6, max: 1 }],
    ])('should set "currentPositionLimits" state on the corresponding SubViews with id "%s"', (id, positionRatioLimits) => {
      const knob = view['subViews'].knobs?.[id];
      expect(knob).toBeDefined();
      const knobSpy = jest.spyOn(knob!, 'setState');
      view.setState({ currentPositionLimits: [id, positionRatioLimits] });
      expect(knobSpy).lastCalledWith({ positionRatioLimits });
    });

    test.each([
      ['from', false],
      ['to', true],
    ])('should set "currentActiveStatus" state on the corresponding SubViews with id "%s"', (id, active) => {
      const knob = view['subViews'].knobs?.[id];
      expect(knob).toBeDefined();
      const knobSpy = jest.spyOn(knob!, 'setState');
      let inputSpy: jest.SpyInstance | undefined;
      let tooltipSpy: jest.SpyInstance | undefined;
      if (props.showInputs) {
        const input = view['subViews'].inputs?.[id];
        expect(input).toBeDefined();
        inputSpy = jest.spyOn(input!, 'setState');
      }
      if (props.showTooltips) {
        const tooltip = view['subViews'].tooltips?.[id];
        expect(tooltip).toBeDefined();
        tooltipSpy = jest.spyOn(tooltip!, 'setState');
      }
      view.setState({ currentActiveStatus: [id, active] });
      expect(knobSpy).nthCalledWith(1, { active });
      if (active) {
        expect(knobSpy).nthCalledWith(3, { zIndex: 4 });
      }
      if (inputSpy) {
        expect(inputSpy).lastCalledWith({ active });
      }
      if (tooltipSpy) {
        expect(tooltipSpy).lastCalledWith({ active });
      }
    });

    test.each([
      ['from', '10'],
      ['to', '100'],
    ])('should set "currentValue" state on the corresponding SubViews with id "%s"', (id, value) => {
      let inputSpy: jest.SpyInstance | undefined;
      let tooltipSpy: jest.SpyInstance | undefined;
      if (props.showInputs) {
        const input = view['subViews'].inputs?.[id];
        expect(input).toBeDefined();
        inputSpy = jest.spyOn(input!, 'setState');
      }
      if (props.showTooltips) {
        const tooltip = view['subViews'].tooltips?.[id];
        expect(tooltip).toBeDefined();
        tooltipSpy = jest.spyOn(tooltip!, 'setState');
      }
      view.setState({ currentValue: [id, value] });
      if (inputSpy) {
        expect(inputSpy).lastCalledWith({ value });
      }
      if (tooltipSpy) {
        expect(tooltipSpy).nthCalledWith(1, { value, lastValue: value });
        if (props.collideTooltips) {
          expect(tooltipSpy).nthCalledWith(2, { value, hidden: false });
        }
      }
    });
  });

  describe('observers', () => {
    afterEach(() => {
      view.destroy();
      parent.remove();
    });

    test('should notify observers about unknownPosition change by track and gird', () => {
      const mockObserver = jest.fn(({ unknownPosition }: IViewState) => unknownPosition);
      initializeView(mockObserver);
      view['subViews'].track?.['notifyObservers']({ positionRatio: 0 });
      expect(mockObserver).nthReturnedWith(1, 0);
      if (props.grid) {
        view['subViews'].grid?.['notifyObservers']({ positionRatio: 0.5 });
        expect(mockObserver).nthReturnedWith(2, 0.5);
      }
    });

    test.each([
      ['from', false],
      ['to', true],
    ])('should notify observers about currentActiveStatus change by knob and input with id "%s"', (id, active) => {
      const mockObserver = jest.fn(({ currentActiveStatus }: IViewState) => currentActiveStatus);
      initializeView(mockObserver);
      view['subViews'].knobs?.[id]?.['notifyObservers']({ active });
      expect(mockObserver).nthReturnedWith(1, [id, active]);
      if (props.showInputs) {
        view['subViews'].inputs?.[id]?.['notifyObservers']({ active });
        expect(mockObserver).nthReturnedWith(2, [id, active]);
      }
    });

    test.each([
      ['from', 0.1],
      ['to', 0.9],
    ])('should notify observers about currentPosition change by knob with id "%s"', (id, positionRatio) => {
      const mockObserver = jest.fn(({ currentPosition }: IViewState) => currentPosition);
      initializeView(mockObserver);
      const bar = view['subViews'].bars?.fromto;
      expect(bar).toBeDefined();
      const barSpy = jest.spyOn(bar!, 'setState');
      view['subViews'].knobs?.[id]?.['notifyObservers']({ positionRatio });
      expect(mockObserver).lastReturnedWith([id, positionRatio]);
      if (props.allowSmoothTransition) {
        expect(barSpy).lastCalledWith({ [id]: positionRatio });
      }
    });

    test.each([
      ['from', '10'],
      ['to', '100'],
    ])('should notify observers about currentValue change by input with id "%s"', (id, value) => {
      const mockObserver = jest.fn(({ currentValue }: IViewState) => currentValue);
      initializeView(mockObserver);
      if (props.showInputs) {
        view['subViews'].inputs?.[id]?.['notifyObservers']({ value });
        expect(mockObserver).lastReturnedWith([id, value]);
      }
    });
  });
});
