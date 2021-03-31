import {
  mockElementDimensions, mockPointerEvent,
} from 'shared/scripts/jestUtils';

import KnobView, { IKnobViewProps, IKnobViewState } from './KnobView';

let knob: KnobView;
let parent: HTMLElement;
const propsCases: [description: string, props: IKnobViewProps][] = [
  [
    'initialized with orientation: "horizontal"',
    {
      cssClass: 'test-class',
      orientation: 'horizontal',
      allowSmoothTransition: true,
    },
  ],
  [
    'initialized with orientation: "vertical"',
    {
      cssClass: 'test-class',
      orientation: 'vertical',
      allowSmoothTransition: true,
    },
  ],
];

describe.each(propsCases)('%s', (_description, props) => {
  const initializeKnob = (mockObserver?: jest.Mock) => {
    parent = document.createElement('div');
    mockElementDimensions(parent, { width: 500, height: 500 });
    document.body.appendChild(parent);
    knob = new KnobView(parent, props);
    if (mockObserver) {
      knob.addObserver(mockObserver);
    }
  };

  describe('general methods', () => {
    beforeEach(() => {
      initializeKnob();
    });
    afterEach(() => {
      knob.destroy();
      parent.remove();
    });

    test('should render markup in the constructor', () => {
      const element = parent.querySelector(`.${props.cssClass}`);
      expect(element).toBeTruthy();
    });

    describe('render state', () => {
      test('should set and render "positionRatio" state', () => {
        const checkStyle = () => {
          if (props.orientation === 'vertical') {
            return knob.element.style.top;
          }
          return knob.element.style.left;
        };
        knob.setState({ positionRatio: -0.1 });
        expect(checkStyle()).toBe('0%');
        knob.setState({ positionRatio: 1.1 });
        expect(checkStyle()).toBe('100%');
        knob.setState({ positionRatio: 0.5 });
        expect(checkStyle()).toBe('50%');
      });

      test('should set and render "active" state', () => {
        const checkIfActive = () => knob.element.classList.contains(`${props.cssClass}_active`);
        knob.setState({ active: true });
        expect(checkIfActive()).toBe(true);
        knob.setState({ active: false });
        expect(checkIfActive()).toBe(false);
      });

      test('should set and render "zIndex" state', () => {
        knob.setState({ zIndex: 0.75 });
        expect(knob.element.style.zIndex).toBe('2');
        knob.setState({ zIndex: 4 });
        expect(knob.element.style.zIndex).toBe('4');
      });
    });
  });

  describe('event listeners', () => {
    afterEach(() => {
      knob.destroy();
      parent.remove();
    });

    test('should notify observers about pointer positionRatio', () => {
      const mockObserver = jest.fn(({ positionRatio }: IKnobViewState) => positionRatio);
      initializeKnob(mockObserver);
      mockPointerEvent(knob.element, { eventType: 'pointerdown' });
      expect(mockObserver).nthReturnedWith(1, undefined);
      if (props.orientation === 'vertical') {
        mockPointerEvent(knob.element, { eventType: 'pointermove', clientY: 100 });
        expect(mockObserver).nthReturnedWith(2, 0.2);
      } else {
        mockPointerEvent(knob.element, { eventType: 'pointermove', clientX: 250 });
        expect(mockObserver).nthReturnedWith(2, 0.5);
      }
      mockPointerEvent(knob.element, { eventType: 'pointerup' });
      expect(mockObserver).nthReturnedWith(3, expect.any(Number));
    });

    test('should notify observers about active status', () => {
      const mockObserver = jest.fn(({ active }: IKnobViewState) => active);
      initializeKnob(mockObserver);
      mockPointerEvent(knob.element, { eventType: 'pointerdown' });
      expect(mockObserver).nthReturnedWith(1, true);
      mockPointerEvent(knob.element, { eventType: 'pointermove' });
      expect(mockObserver).nthReturnedWith(2, undefined);
      mockPointerEvent(knob.element, { eventType: 'pointerup' });
      expect(mockObserver).nthReturnedWith(3, false);
    });
  });
});
