import { ISubViewProps } from '../SubView';
import BarView from './BarView';

let bar: BarView;
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
  const initializeBar = () => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
    bar = new BarView(parent, props);
    bar.setState({ from: 0, to: 1 });
  };

  describe('general methods', () => {
    beforeEach(() => {
      initializeBar();
    });
    afterEach(() => {
      parent.remove();
    });

    test('should render markup in the constructor', () => {
      const element = parent.querySelector(`.${props.cssClass}`);
      expect(element).toBeTruthy();
    });

    describe('render state', () => {
      const checkStyle = () => {
        if (props.orientation === 'vertical') {
          return [bar.element.style.top, bar.element.style.height];
        }
        return [bar.element.style.left, bar.element.style.width];
      };

      test('should set and render "from" state', () => {
        bar.setState({ from: -0.1 });
        expect(checkStyle()).toStrictEqual(['0%', '100%']);
        bar.setState({ from: 1.1 });
        expect(checkStyle()).toStrictEqual(['100%', '0%']);
        bar.setState({ from: 0.5 });
        expect(checkStyle()).toStrictEqual(['50%', '50%']);
      });

      test('should set and render "to" state', () => {
        bar.setState({ to: -0.1 });
        expect(checkStyle()).toStrictEqual(['0%', '0%']);
        bar.setState({ to: 1.1 });
        expect(checkStyle()).toStrictEqual(['0%', '100%']);
        bar.setState({ to: 0.5 });
        expect(checkStyle()).toStrictEqual(['0%', '50%']);
      });

      test('should not show bar if "from" > "to"', () => {
        bar.setState({ to: 0.4 });
        bar.setState({ from: 0.6 });
        expect(checkStyle()).toStrictEqual(['60%', '0%']);
      });
    });
  });
});
