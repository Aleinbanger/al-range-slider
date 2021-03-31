import WrapperView, { IWrapperViewProps } from './WrapperView';

let wrapper: WrapperView;
let parent: HTMLElement;
const propsCases: [description: string, props: IWrapperViewProps][] = [
  [
    'initialized with orientation: "horizontal"',
    {
      cssClass: 'test-class',
      orientation: 'horizontal',
      theme: 'light',
    },
  ],
  [
    'initialized with orientation: "vertical"',
    {
      cssClass: 'test-class',
      orientation: 'vertical',
      theme: 'dark',
    },
  ],
];

describe.each(propsCases)('%s', (_description, props) => {
  const initializeWrapper = () => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
    wrapper = new WrapperView(parent, props);
  };

  describe('general methods', () => {
    beforeEach(() => {
      initializeWrapper();
    });
    afterEach(() => {
      wrapper.destroy();
      parent.remove();
    });

    describe('render markup', () => {
      test('should render markup in the constructor', () => {
        const element = parent.querySelector(`.${props.cssClass}`);
        expect(element).toBeTruthy();
      });

      test('should add "vertical" class modifier for vertical orientation', () => {
        const checkIfVertical = () => wrapper.element.classList.contains(`${props.cssClass}_vertical`);
        if (props.orientation === 'vertical') {
          expect(checkIfVertical()).toBe(true);
        } else {
          expect(checkIfVertical()).toBe(false);
        }
      });

      test('should add "dark" class modifier for dark theme', () => {
        const checkIfDark = () => wrapper.element.classList.contains(`${props.cssClass}_dark`);
        if (props.theme === 'dark') {
          expect(checkIfDark()).toBe(true);
        } else {
          expect(checkIfDark()).toBe(false);
        }
      });
    });
  });
});
