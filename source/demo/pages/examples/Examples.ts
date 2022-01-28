import bind from 'bind-decorator';

import Component from 'shared/scripts/Component/Component';
import InputToggle, { IInputToggleState } from 'demo/blocks/InputToggle/InputToggle';
import ConfigPanel from 'demo/blocks/ConfigPanel/ConfigPanel';
import type { TOptions } from 'plugin/plugin';

import './examples.scss';

interface IExamplesState {
  theme?: 'light' | 'dark';
}

class Examples extends Component<IExamplesState> {
  declare protected state: IExamplesState;

  declare protected children: {
    root: HTMLElement;
    themeToggle: InputToggle;
    configPanels: ConfigPanel[];
  };

  constructor(parent: HTMLElement) {
    super(parent, 'examples');
  }

  protected override initialize(): void {
    const sliderOptionsArray: TOptions[] = [
      {},
      {
        range: { min: -100, max: 100, step: 1 },
        initialSelectedValues: {
          from: -50,
          to: 50,
        },
        grid: { minTicksStep: 1, marksStep: 5 },
      },
      {
        range: { min: -10000, max: 10000, step: 5 },
        initialSelectedValues: {
          'to-2': -8000,
          from: -4000,
          to: -2000,
          'no-bar': 0,
          'from-1': 2000,
          'to-1': 4000,
          'from-3': 8000,
        },
        grid: { minTicksStep: 1, marksStep: 5 },
        orientation: 'vertical',
        prettify: (value) => Number(value).toLocaleString(
          undefined, { style: 'currency', currency: 'USD' },
        ),
      },
      {
        range: {
          min: new Date().getTime(),
          max: new Date(2050, 0, 1).getTime(),
          step: 8640000,
        },
        initialSelectedValues: {
          'to-ms': new Date().getTime(),
        },
        grid: { minTicksStep: 1, marksStep: 5 },
        prettify: (value) => {
          const date = new Date();
          date.setTime(Number(value));
          return date.toLocaleDateString();
        },
      },
      {
        valuesArray: [
          0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233,
          377, 610, 987, 1597, 2584, 4181, 6765, 10946, 17711,
        ],
        initialSelectedValues: {
          from: 6765,
          to: 10946,
        },
        valuesPrecision: 6,
        grid: { minTicksStep: 1, marksStep: 2 },
        prettify: (value) => Number(value).toLocaleString(),
      },
      {
        valuesArray: [
          '1a', '2b', '3c', '4d', '5e', '6f', '7g', '8h', '9i', '10j',
        ],
        initialSelectedValues: {
          from: '4d',
          to: '7g',
        },
        orientation: 'vertical',
      },
      {
        pointsMap: {
          0: 0,
          0.1: 'qwe',
          0.2: 'asd',
          0.3: 'zxc',
          0.5: 1,
          0.7: 'edc',
          0.8: 'wsx',
          0.9: 'qaz',
          1: 0,
        },
        initialSelectedValues: {
          'from-1': 'qaz',
          'to-2': 'qwe',
        },
      },
    ];

    this.state = {
      theme: 'dark',
    };
    this.children = {
      root: document.documentElement,
      themeToggle: new InputToggle(
        this.element.querySelector(`.js-${this.cssClass}__theme-toggle`),
      ),
      configPanels: Array.from(this.element.querySelectorAll(`.js-${this.cssClass}__panel`))
        .map((parent, index) => new ConfigPanel(parent as HTMLElement, {
          sliderOptions: sliderOptionsArray[index] ?? {},
        })),
    };

    let theme: IExamplesState['theme'];
    try {
      theme = window.localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      theme = 'dark';
    }
    this.setState({ theme });
    this.children.configPanels.forEach((panel) => panel.setState({ theme }));
    this.children.themeToggle.setState({ checked: theme === 'dark' });
  }

  protected override addEventListeners(): void {
    this.children.themeToggle.addObserver(this.handleThemeToggleChange);
  }

  protected override renderState({ theme }: IExamplesState): void {
    if (typeof theme !== 'undefined') {
      if (theme === 'dark') {
        this.children.root.classList.add('dark');
      } else {
        this.children.root.classList.remove('dark');
      }
    }
  }

  @bind
  private handleThemeToggleChange({ checked }: IInputToggleState): void {
    if (typeof checked !== 'undefined') {
      const theme = checked ? 'dark' : 'light';
      this.setState({ theme });
      this.children.configPanels.forEach((panel) => panel.setState({ theme }));
      try {
        window.localStorage.setItem('theme', theme);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }
  }
}

export type { IExamplesState };
export default Examples;
