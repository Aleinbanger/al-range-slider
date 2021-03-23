import InputView, { IInputViewProps, IInputViewState } from './InputView';

let input: InputView;
let parent: HTMLElement;
const propsCases: [description: string, props: IInputViewProps][] = [
  [
    'initialized with orientation: "horizontal"',
    {
      cssClass: 'test-class',
      orientation: 'horizontal',
      name: 'from',
      hidden: false,
    },
  ],
  [
    'initialized with orientation: "vertical"',
    {
      cssClass: 'test-class',
      orientation: 'vertical',
      name: 'from',
      hidden: true,
    },
  ],
];

describe.each(propsCases)('%s', (_description, props) => {
  const initializeInput = (mockObserver?: jest.Mock) => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
    input = new InputView(parent, props);
    if (mockObserver) {
      input.addObserver(mockObserver);
    }
  };

  describe('general methods', () => {
    beforeEach(() => {
      initializeInput();
    });
    afterEach(() => {
      parent.remove();
    });

    test('should render markup in the constructor', () => {
      const element = parent.querySelector(`.${props.cssClass}`);
      expect(element).toBeTruthy();
      const checkIfHidden = () => input.element.classList.contains(`${props.cssClass}_hidden`);
      if (props.hidden) {
        expect(checkIfHidden()).toBe(true);
      } else {
        expect(checkIfHidden()).toBe(false);
      }
    });

    test('should disable and enable input', () => {
      const checkIfDisabled = () => input.element.disabled;
      input.disable();
      expect(checkIfDisabled()).toBe(true);
      input.disable(false);
      expect(checkIfDisabled()).toBe(false);
    });

    describe('render state', () => {
      test('should set and render "value" state', () => {
        input.setState({ value: '10' });
        expect(input.element.value).toBe('10');
        input.setState({ value: 'asd' });
        expect(input.element.value).toBe('asd');
      });
    });
  });

  describe('event listeners', () => {
    afterEach(() => {
      parent.remove();
    });

    test('should notify observers about active status', () => {
      const mockObserver = jest.fn(({ active }: IInputViewState) => active);
      initializeInput(mockObserver);
      input.element.dispatchEvent(new FocusEvent('focus'));
      expect(mockObserver.mock.results[0].value).toBe(true);
      input.element.dispatchEvent(new FocusEvent('blur'));
      expect(mockObserver.mock.results[1].value).toBe(false);
    });

    test('should notify observers about value', () => {
      const mockObserver = jest.fn(({ value }: IInputViewState) => value);
      initializeInput(mockObserver);
      input.element.value = '100';
      input.element.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockObserver.mock.results[0].value).toBe('100');
    });
  });
});
