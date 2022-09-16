/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/dot-notation */

import { ExtractMethodsKeys } from 'shared/scripts/utils/typeUtils';
import { mockElementDimensions } from 'shared/scripts/utils/jestUtils';

import View, { IViewProps, IViewState, ISubViews } from './View';
import SubView from './SubView/SubView';

let parent: HTMLElement;
let view: View;
let subViews: ISubViews;
const propsCases: [description: string, props: IViewProps][] = [
  [
    'initialized with orientation: "horizontal"',
    {
      cssClass: 'test-class',
      orientation: 'horizontal',
      theme: 'light',
      selectedIds: ['from', 'to'],
      grid: { pointsMap: [], minTicksStep: 1, marksStep: 1 },
      allowSmoothTransition: true,
      showInputs: true,
      showTooltips: true,
      collideTooltips: true,
      tooltipsSeparator: ' \u2192 ',
      prettify: (value) => `${value}k`,
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
      allowSmoothTransition: false,
      showInputs: false,
      showTooltips: true,
      collideTooltips: true,
      tooltipsSeparator: ' \u2192 ',
    },
  ],
];

describe.each(propsCases)('%s', (_description, props) => {
  const {
    cssClass, orientation, grid, allowSmoothTransition, showInputs,
    showTooltips, collideTooltips, tooltipsSeparator, prettify,
  } = props;
  const initializeView = (mockObserver?: jest.Mock) => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
    view = new View(parent, props);
    if (mockObserver) {
      view.addObserver(mockObserver);
    }
    subViews = view['__private_3_subViews' as keyof View] as unknown as ISubViews;
  };
  const spyOnAllSubViews = (
    method: ExtractMethodsKeys<SubView>, sViews = subViews,
  ) => {
    const spies: Array<jest.SpyInstance> = [];
    Object.values(sViews).forEach((subView) => {
      const isMethodValid = subView instanceof SubView && typeof subView[method] === 'function';
      if (isMethodValid) {
        spies.push(jest.spyOn(subView, method));
      } else if (typeof subView === 'object') {
        spies.push(...spyOnAllSubViews(method, subView as ISubViews));
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
      const wrapperElement = parent.querySelector(`.${cssClass}`);
      expect(wrapperElement).toBeTruthy();
      const trackElement = parent.querySelector(`.${cssClass}__track`);
      expect(trackElement).toBeTruthy();
      const knobElements = parent.querySelectorAll(`.${cssClass}__knob`);
      expect(knobElements.length).toBe(2);
      const barElements = parent.querySelectorAll(`.${cssClass}__bar`);
      expect(barElements.length).toBe(1);
      if (grid) {
        const gridElement = parent.querySelector(`.${cssClass}__grid`);
        expect(gridElement).toBeTruthy();
      }
      if (showInputs) {
        const inputElements = parent.querySelectorAll(`.${cssClass}__input`);
        expect(inputElements.length).toBe(2);
      }
      if (showTooltips) {
        const tooltipElements = parent.querySelectorAll(`.${cssClass}__tooltip`);
        expect(tooltipElements.length).toBe(2);
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
      const knob = subViews.knobs?.[id];
      expect(knob).toBeDefined();
      const knobSpy = jest.spyOn(knob!, 'setState');
      const bar = subViews.bars?.['from-to'];
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
      const knob = subViews.knobs?.[id];
      expect(knob).toBeDefined();
      const knobSpy = jest.spyOn(knob!, 'setState');
      view.setState({ currentPositionLimits: [id, positionRatioLimits] });
      expect(knobSpy).lastCalledWith({ positionRatioLimits });
    });

    test.each([
      ['from', false],
      ['to', true],
    ])('should set "currentActiveStatus" state on the corresponding SubViews with id "%s"', (id, active) => {
      const knob = subViews.knobs?.[id];
      expect(knob).toBeDefined();
      const knobSpy = jest.spyOn(knob!, 'setState');
      let inputSpy: jest.SpyInstance | undefined;
      let tooltipSpy: jest.SpyInstance | undefined;
      if (showInputs) {
        const input = subViews.inputs?.[id];
        expect(input).toBeDefined();
        inputSpy = jest.spyOn(input!, 'setState');
      }
      if (showTooltips) {
        const tooltip = subViews.tooltips?.[id];
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
      if (showInputs) {
        const input = subViews.inputs?.[id];
        expect(input).toBeDefined();
        inputSpy = jest.spyOn(input!, 'setState');
      }
      if (showTooltips) {
        const tooltip = subViews.tooltips?.[id];
        expect(tooltip).toBeDefined();
        tooltipSpy = jest.spyOn(tooltip!, 'setState');
      }
      view.setState({ currentValue: [id, value] });
      if (inputSpy) {
        expect(inputSpy).lastCalledWith({ value });
      }
      if (tooltipSpy) {
        const prettyValue = prettify?.(value) ?? value;
        expect(tooltipSpy).nthCalledWith(1, { value: prettyValue, lastValue: prettyValue });
      }
    });

    const isTooltipsCollisionDefined = showTooltips && collideTooltips;
    if (isTooltipsCollisionDefined) {
      describe('collide tooltips', () => {
        const getValue = (from: string, to: string) => (
          (prettify?.(from) ?? from) + tooltipsSeparator + (prettify?.(to) ?? to)
        );
        const trackSize = 100;
        const tooltipSize = 25;
        const initFromPoint: [positionRatio: number, value: string] = [0, '0'];
        const initToPoint: [positionRatio: number, value: string] = [1, '100'];

        beforeEach(() => {
          const { track } = subViews;
          const tooltipFrom = subViews.tooltips?.['from'];
          const tooltipTo = subViews.tooltips?.['to'];
          expect(track).toBeDefined();
          expect(tooltipFrom).toBeDefined();
          expect(tooltipTo).toBeDefined();
          if (orientation === 'vertical') {
            mockElementDimensions(track!.element, { width: 10, height: trackSize });
            mockElementDimensions(tooltipFrom!.element,
              { width: tooltipSize, height: tooltipSize, y: (1 - initFromPoint[0]) * trackSize });
            mockElementDimensions(tooltipTo!.element,
              { width: tooltipSize, height: tooltipSize, y: (1 - initToPoint[0]) * trackSize });
          } else {
            mockElementDimensions(track!.element, { width: trackSize, height: 10 });
            mockElementDimensions(tooltipFrom!.element,
              { width: tooltipSize, height: tooltipSize, x: initFromPoint[0] * trackSize });
            mockElementDimensions(tooltipTo!.element,
              { width: tooltipSize, height: tooltipSize, x: initToPoint[0] * trackSize });
          }
          view.setState({
            currentPosition: ['from', initFromPoint[0]],
            currentValue: ['from', initFromPoint[1]],
          });
          view.setState({
            currentPosition: ['to', initToPoint[0]],
            currentValue: ['to', initToPoint[1]],
          });
        });

        test.each([
          ['from', 90, 10, '90'],
          ['to', 10, 90, '10'],
        ])('should correctly collide tooltip "%s" with others', (activeId, x, y, value) => {
          const passiveId = ['from', 'to'].find((id) => id !== activeId) ?? '';
          const tooltipActive = subViews.tooltips?.[activeId];
          const tooltipPassive = subViews.tooltips?.[passiveId];
          expect(tooltipActive).toBeDefined();
          expect(tooltipPassive).toBeDefined();
          const tooltipActiveSpy = jest.spyOn(tooltipActive!, 'setState');
          const tooltipPassiveSpy = jest.spyOn(tooltipPassive!, 'setState');
          const expectedValue = activeId === 'from'
            ? getValue(value, initToPoint[1])
            : getValue(initFromPoint[1], value);
          const positionRatio = orientation === 'vertical'
            ? (1 - y / trackSize) : x / trackSize;
          if (orientation === 'vertical') {
            mockElementDimensions(tooltipActive!.element,
              { width: tooltipSize, height: tooltipSize, y });
          } else {
            mockElementDimensions(tooltipActive!.element,
              { width: tooltipSize, height: tooltipSize, x });
          }
          view.setState({
            currentPosition: [activeId, positionRatio],
            currentValue: [activeId, value],
          });
          expect(tooltipActiveSpy).nthCalledWith(2, { value: expectedValue });
          expect(tooltipPassiveSpy).nthCalledWith(1, { hidden: true });
        });
      });
    }
  });

  describe('observers', () => {
    afterEach(() => {
      view.destroy();
      parent.remove();
    });

    test('should notify observers about unknownPosition change by track and gird', () => {
      const mockObserver = jest.fn(({ unknownPosition }: IViewState) => unknownPosition);
      initializeView(mockObserver);
      subViews.track?.['notifyObservers']({ positionRatio: 0 });
      expect(mockObserver).nthReturnedWith(1, 0);
      if (grid) {
        subViews.grid?.['notifyObservers']({ positionRatio: 0.5 });
        expect(mockObserver).nthReturnedWith(2, 0.5);
      }
    });

    test.each([
      ['from', false],
      ['to', true],
    ])('should notify observers about currentActiveStatus change by knob and input with id "%s"', (id, active) => {
      const mockObserver = jest.fn(({ currentActiveStatus }: IViewState) => currentActiveStatus);
      initializeView(mockObserver);
      subViews.knobs?.[id]?.['notifyObservers']({ active });
      expect(mockObserver).nthReturnedWith(1, [id, active]);
      if (showInputs) {
        subViews.inputs?.[id]?.['notifyObservers']({ active });
        expect(mockObserver).nthReturnedWith(2, [id, active]);
      }
    });

    test.each([
      ['from', 0.1],
      ['to', 0.9],
    ])('should notify observers about currentPosition change by knob with id "%s"', (id, positionRatio) => {
      const mockObserver = jest.fn(({ currentPosition }: IViewState) => currentPosition);
      initializeView(mockObserver);
      const bar = subViews.bars?.['from-to'];
      expect(bar).toBeDefined();
      const barSpy = jest.spyOn(bar!, 'setState');
      subViews.knobs?.[id]?.['notifyObservers']({ positionRatio });
      expect(mockObserver).lastReturnedWith([id, positionRatio]);
      if (allowSmoothTransition) {
        expect(barSpy).lastCalledWith({ [id]: positionRatio });
      }
    });

    test.each([
      ['from', '10'],
      ['to', '100'],
    ])('should notify observers about currentValue change by input with id "%s"', (id, value) => {
      const mockObserver = jest.fn(({ currentValue }: IViewState) => currentValue);
      initializeView(mockObserver);
      if (showInputs) {
        subViews.inputs?.[id]?.['notifyObservers']({ value });
        expect(mockObserver).lastReturnedWith([id, value]);
      }
    });
  });
});
