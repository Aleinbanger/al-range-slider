import InputView, { IInputViewProps, TInputViewEvent } from './InputView';

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
      input.destroy();
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
      input.destroy();
      parent.remove();
    });

    const mockObserver = jest.fn(({ kind, data }: TInputViewEvent) => [kind, data]);

    test('should notify observers about active status', () => {
      initializeInput(mockObserver);
      input.element.dispatchEvent(new FocusEvent('focus'));
      expect(mockObserver).nthReturnedWith(1, ['input active change', true]);
      input.element.dispatchEvent(new FocusEvent('blur'));
      expect(mockObserver).nthReturnedWith(2, ['input active change', false]);
    });

    test('should notify observers about value', () => {
      initializeInput(mockObserver);
      input.element.value = '100';
      input.element.dispatchEvent(new Event('change', { bubbles: true }));
      expect(mockObserver).lastReturnedWith(['input value change', '100']);
    });
  });
});
