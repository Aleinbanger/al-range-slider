import {
  mockElementDimensions, mockPointerEvent,
} from 'shared/scripts/jestUtils';

import GridView, { IGridViewProps, IGridViewState } from './GridView';

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
    });
  });

  describe('event listeners', () => {
    afterEach(() => {
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
      const mockObserver = jest.fn(({ positionRatio }: IGridViewState) => positionRatio);
      initializeGrid(mockObserver);
      const mark = grid.element.querySelector(`[data-position="${position}"]`)
        ?.firstChild as HTMLElement;
      expect(mark).toBeDefined();
      mockPointerEvent(mark, { eventType: 'pointerdown' });
      mockPointerEvent(mark, { eventType: 'pointerup' });
      expect(mockObserver.mock.results[0].value).toBe(position);
    });
  });
});
