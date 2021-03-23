import {
  mockElementDimensions, mockPointerEvent,
} from 'shared/scripts/jestUtils';

import { ISubViewProps } from '../SubView';
import TrackView, { ITrackViewState } from './TrackView';

let track: TrackView;
let parent: HTMLElement;
const propsCases: [description: string, props: ISubViewProps][] = [
  [
    'initialized with orientation: "horizontal"',
    {
      cssClass: 'test-class',
      orientation: 'horizontal',
    },
  ],
  [
    'initialized with orientation: "vertical"',
    {
      cssClass: 'test-class',
      orientation: 'vertical',
    },
  ],
];

describe.each(propsCases)('%s', (_description, props) => {
  const initializeTrack = (mockObserver?: jest.Mock) => {
    parent = document.createElement('div');
    mockElementDimensions(parent, { width: 1000, height: 1000 });
    document.body.appendChild(parent);
    track = new TrackView(parent, props);
    mockElementDimensions(track.element, { width: 500, height: 500 });
    if (mockObserver) {
      track.addObserver(mockObserver);
    }
  };

  describe('general methods', () => {
    beforeEach(() => {
      initializeTrack();
    });
    afterEach(() => {
      parent.remove();
    });

    test('should render markup in the constructor', () => {
      const element = parent.querySelector(`.${props.cssClass}`);
      expect(element).toBeTruthy();
    });
  });

  describe('event listeners', () => {
    afterEach(() => {
      parent.remove();
    });

    test('should notify observers about pointer positionRatio', () => {
      const mockObserver = jest.fn(({ positionRatio }: ITrackViewState) => positionRatio);
      initializeTrack(mockObserver);
      mockPointerEvent(track.element, { eventType: 'pointerdown' });
      if (props.orientation === 'vertical') {
        mockPointerEvent(track.element, { eventType: 'pointerup', clientY: 100 });
        expect(mockObserver.mock.results[0].value).toBe(0.2);
      } else {
        mockPointerEvent(track.element, { eventType: 'pointerup', clientX: 500 });
        expect(mockObserver.mock.results[0].value).toBe(1);
      }
    });
  });
});
