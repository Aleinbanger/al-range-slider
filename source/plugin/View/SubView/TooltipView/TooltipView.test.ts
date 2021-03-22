import { ISubViewProps } from '../SubView';
import TooltipView from './TooltipView';

let tooltip: TooltipView;
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
  const initializeTooltip = () => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
    tooltip = new TooltipView(parent, props);
  };

  describe('general methods', () => {
    beforeEach(() => {
      initializeTooltip();
    });
    afterEach(() => {
      parent.remove();
    });

    test('should render markup in the constructor', () => {
      const element = parent.querySelector(`.${props.cssClass}`);
      expect(element).toBeTruthy();
    });

    describe('render state', () => {
      test('should set and render "value" state', () => {
        tooltip.setState({ value: '10' });
        expect(tooltip.element.textContent).toBe('10');
        tooltip.setState({ value: 'asd' });
        expect(tooltip.element.textContent).toBe('asd');
      });

      test('should set and render "active" state', () => {
        const checkIfActive = () => tooltip.element.classList.contains(`${props.cssClass}_active`);
        tooltip.setState({ active: true });
        expect(checkIfActive()).toBe(true);
        tooltip.setState({ active: false });
        expect(checkIfActive()).toBe(false);
      });

      test('should set and render "hidden" state', () => {
        const checkIfHidden = () => tooltip.element.classList.contains(`${props.cssClass}_hidden`);
        tooltip.setState({ hidden: true });
        expect(checkIfHidden()).toBe(true);
        tooltip.setState({ hidden: false });
        expect(checkIfHidden()).toBe(false);
      });
    });
  });
});
