import {
  mockElementDimensions, mockPointerEvent,
} from 'shared/scripts/utils/jestUtils';

import GridView, { IGridViewProps, TGridViewEvent } from './GridView';

let grid: GridView;
let parent: HTMLElement;
const pointsMapMock: IGridViewProps['pointsMap'] = [...Array(11).keys()]
  .map((value) => [String(value / 10), value]);
const propsCases: [description: string, props: IGridViewProps][] = [
  [
    'initialized with orientation: "horizontal"',
    {
      cssClass: 'test-class',
      orientation: 'horizontal',
      pointsMap: pointsMapMock,
      minTicksStep: 1,
      marksStep: 1,
      prettify: (value) => `${value}k`,
    },
  ],
  [
    'initialized with orientation: "vertical"',
    {
      cssClass: 'test-class',
      orientation: 'vertical',
      pointsMap: pointsMapMock,
      minTicksStep: 1,
      marksStep: 1,
    },
  ],
];

describe.each(propsCases)('%s', (_description, props) => {
  const initializeGrid = (mockObserver?: jest.Mock) => {
    parent = document.createElement('div');
    mockElementDimensions(parent, { width: 1000, height: 1000 });
    document.body.appendChild(parent);
    grid = new GridView(parent, props);
    mockElementDimensions(grid.element, { width: 500, height: 500 });
    if (mockObserver) {
      grid.addObserver(mockObserver);
    }
  };

  describe('general methods', () => {
    beforeEach(() => {
      initializeGrid();
    });
    afterEach(() => {
      grid.destroy();
      parent.remove();
    });

    test('should render markup in the constructor', () => {
      const element = parent.querySelector(`.${props.cssClass}`);
      expect(element).toBeTruthy();
    });

    test('should remove the element and all window event listeners', () => {
      grid.destroy();
      const element = parent.querySelector(`.${props.cssClass}`);
      expect(element).toBeFalsy();
      const spyEventListener = jest.spyOn(grid, 'setState');
      window.dispatchEvent(new UIEvent('resize'));
      expect(spyEventListener).toBeCalledTimes(0);
    });

    describe('render state', () => {
      test.each([
        [1], [2], [5],
      ])('should set and render "ticksStep: %i" state', (ticksStep) => {
        const countTicks = () => grid.element.querySelectorAll(`.${props.cssClass}-tick`).length;
        const countMarks = () => grid.element.querySelectorAll(`.${props.cssClass}-mark`).length;
        grid.setState({ ticksStep });
        expect(countTicks()).toBe(Math.ceil(props.pointsMap.length / ticksStep));
        expect(countMarks()).toBe(Math.ceil(props.pointsMap.length / ticksStep / props.marksStep));
      });

      test('should correctly prettify marks', () => {
        grid.setState({ ticksStep: 1 });
        const marks = Array.from(grid.element.querySelectorAll(`.${props.cssClass}-mark`))
          .map((mark) => mark.textContent);
        const values = props.prettify
          ? props.pointsMap.map(([, value]) => props.prettify?.(String(value)))
          : props.pointsMap.map(([, value]) => String(value));
        expect(marks).toStrictEqual(values);
      });
    });
  });

  describe('event listeners', () => {
    afterEach(() => {
      grid.destroy();
      parent.remove();
    });

    test('should update state on resize event', () => {
      initializeGrid();
      const spyEventListener = jest.spyOn(grid, 'setState');
      window.dispatchEvent(new UIEvent('resize'));
      expect(spyEventListener).toBeCalledTimes(1);
    });

    test.each([
      [0], [0.1], [0.5], [1],
    ])('should notify observers about positionRatio of the clicked mark with data-position="%f"', (position) => {
      const mockObserver = jest.fn(({ kind, data }: TGridViewEvent) => [kind, data]);
      initializeGrid(mockObserver);
      const mark = grid.element.querySelector(`[data-position="${position}"]`)
        ?.firstChild as HTMLElement;
      expect(mark).toBeDefined();
      mockPointerEvent(mark, { eventType: 'pointerdown' });
      mockPointerEvent(mark, { eventType: 'pointerup' });
      expect(mockObserver).lastReturnedWith(['grid position change', position]);
    });
  });
});
