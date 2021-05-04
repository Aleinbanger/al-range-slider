import bind from 'bind-decorator';

import { isNumeric } from 'shared/scripts/utils/utils';
import { DeepWriteable } from 'shared/scripts/utils/typeUtils';
import Component from 'shared/scripts/Component/Component';
import 'plugin/plugin';
import type { TOptions } from 'plugin/plugin';

import InputField, { IInputFieldState } from '../InputField/InputField';
import InputToggle, { IInputToggleState } from '../InputToggle/InputToggle';
import KeyValueList, { IKeyValueListState } from '../KeyValueList/KeyValueList';
import './ConfigPanel.scss';

interface IConfigPanelProps {
  sliderOptions: DeepWriteable<TOptions>;
}

interface IConfigPanelState {
  theme?: 'light' | 'dark';
  orientation?: 'horizontal' | 'vertical';
  sliderSelectedValues?: Record<string, string | number>;
}

class ConfigPanel extends Component<IConfigPanelState, IConfigPanelProps> {
  declare protected readonly props: IConfigPanelProps;

  declare protected state: IConfigPanelState;

  declare protected children: {
    rangeSlider: JQuery;
    knobsList: KeyValueList;
    gridInputs: {
      ticks: InputField;
      marks: InputField;
    };
    orientationToggle: InputToggle;
    showTooltipsToggle: InputToggle;
    collideTooltipsToggle: InputToggle;
    collideKnobsToggle: InputToggle;
    smoothTransitionToggle: InputToggle;
    rangeInputs?: {
      min: InputField;
      max: InputField;
      step: InputField;
    };
    arrayInput?: InputField;
    pointsList?: KeyValueList;
  };

  constructor(parent: HTMLElement | null, props: IConfigPanelProps) {
    super(parent, 'config-panel', props);
  }

  protected initialize(): void {
    this.state = {
      theme: 'dark',
    };
    this.children = {
      rangeSlider: $(this.element).find(`.js-${this.cssClass}__range-slider`)
        .alRangeSlider({
          ...(this.props.sliderOptions as TOptions),
          onChange: (state) => {
            this.state.sliderSelectedValues = state?.selectedValues;
          },
        }),
      knobsList: new KeyValueList(
        this.element.querySelector(`.js-${this.cssClass}__knobs-list`),
        {
          keyInput: { type: 'text', placeholder: 'ID' },
          valueInput: { type: 'text', placeholder: 'Value' },
        },
      ),
      gridInputs: {
        ticks: new InputField(
          this.element.querySelector(`[data-name="ticks"].js-${this.cssClass}__grid-input`),
        ),
        marks: new InputField(
          this.element.querySelector(`[data-name="marks"].js-${this.cssClass}__grid-input`),
        ),
      },
      orientationToggle: new InputToggle(this.element.querySelector(`.js-${this.cssClass}__orientation`)),
      showTooltipsToggle: new InputToggle(this.element.querySelector(`.js-${this.cssClass}__show-tooltips`)),
      collideTooltipsToggle: new InputToggle(this.element.querySelector(`.js-${this.cssClass}__collide-tooltips`)),
      collideKnobsToggle: new InputToggle(this.element.querySelector(`.js-${this.cssClass}__collide-knobs`)),
      smoothTransitionToggle: new InputToggle(this.element.querySelector(`.js-${this.cssClass}__smooth-transition`)),
    };
    this.children.knobsList.setState({ items: this.state.sliderSelectedValues });

    const { defaults } = this.children.rangeSlider.alRangeSlider;
    const { sliderOptions } = this.props;
    const {
      grid, orientation, showTooltips, collideTooltips, collideKnobs, allowSmoothTransition,
      range, valuesArray, pointsMap,
    } = { ...defaults, ...sliderOptions };
    this.props.sliderOptions.grid = grid;
    this.children.gridInputs.ticks.setState({ value: String(grid.minTicksStep) });
    this.children.gridInputs.marks.setState({ value: String(grid.marksStep) });
    this.setState({ orientation });
    this.children.orientationToggle.setState({ checked: orientation === 'vertical' });
    this.children.showTooltipsToggle.setState({ checked: showTooltips });
    this.children.collideTooltipsToggle.setState({ checked: collideTooltips });
    this.children.collideKnobsToggle.setState({ checked: collideKnobs });
    this.children.smoothTransitionToggle.setState({ checked: allowSmoothTransition });

    const rangeContainer = this.element.querySelector<HTMLElement>(`.js-${this.cssClass}__range`);
    const arrayContainer = this.element.querySelector<HTMLElement>(`.js-${this.cssClass}__array`);
    const mapContainer = this.element.querySelector<HTMLElement>(`.js-${this.cssClass}__map`);
    if (pointsMap && mapContainer) {
      this.children.pointsList = new KeyValueList(
        mapContainer,
        {
          keyInput: {
            type: 'number', min: 0, max: 1, step: 0.0001, placeholder: 'Position',
          },
          valueInput: {
            type: 'text', placeholder: 'Value',
          },
        },
      );
      this.children.pointsList.setState({ items: pointsMap });
      rangeContainer?.remove();
      arrayContainer?.remove();
    } else if (valuesArray && arrayContainer) {
      this.children.arrayInput = new InputField(arrayContainer);
      this.children.arrayInput.setState({ value: valuesArray?.join(', ') });
      rangeContainer?.remove();
      mapContainer?.remove();
    } else if (range && rangeContainer) {
      this.props.sliderOptions.range = range;
      this.children.rangeInputs = {
        min: new InputField(rangeContainer
          .querySelector(`[data-name="min"].js-${this.cssClass}__range-input`)),
        max: new InputField(rangeContainer
          .querySelector(`[data-name="max"].js-${this.cssClass}__range-input`)),
        step: new InputField(rangeContainer
          .querySelector(`[data-name="step"].js-${this.cssClass}__range-input`)),
      };
      Object.entries(this.children.rangeInputs).forEach(([name, input]) => {
        input.setState({ value: String(range[name as keyof typeof range]) });
      });
      arrayContainer?.remove();
      mapContainer?.remove();
    }
  }

  protected addEventListeners(): void {
    this.children.knobsList.addObserver(this.handleKnobsListChange);
    this.children.gridInputs.ticks.addObserver(this.handleGridInputChange.bind(this, 'minTicksStep'));
    this.children.gridInputs.marks.addObserver(this.handleGridInputChange.bind(this, 'marksStep'));
    this.children.orientationToggle.addObserver(this.handleOrientationToggleChange);
    this.children.showTooltipsToggle.addObserver(this.handleShowTooltipsToggleChange);
    this.children.collideTooltipsToggle.addObserver(this.handleCollideTooltipsToggleChange);
    this.children.collideKnobsToggle.addObserver(this.handleCollideKnobsToggleChange);
    this.children.smoothTransitionToggle.addObserver(this.handleSmoothTransitionToggleChange);

    this.children.pointsList?.addObserver(this.handlePointsListChange);
    this.children.arrayInput?.addObserver(this.handleArrayInputChange);
    this.children.rangeInputs?.min.addObserver(this.handleRangeInputChange.bind(this, 'min'));
    this.children.rangeInputs?.max.addObserver(this.handleRangeInputChange.bind(this, 'max'));
    this.children.rangeInputs?.step.addObserver(this.handleRangeInputChange.bind(this, 'step'));
  }

  protected renderState({ theme, orientation }: IConfigPanelState): void {
    if (typeof theme !== 'undefined') {
      this.children.rangeSlider.alRangeSlider('restart', {
        initialSelectedValues: this.state.sliderSelectedValues,
        theme,
      });
    }
    if (typeof orientation !== 'undefined') {
      if (orientation === 'vertical') {
        this.element.classList.add(`${this.cssClass}_vertical`);
      } else {
        this.element.classList.remove(`${this.cssClass}_vertical`);
      }
    }
  }

  @bind
  private handleKnobsListChange({ items }: IKeyValueListState): void {
    if (typeof items !== 'undefined') {
      this.children.rangeSlider.alRangeSlider('restart', {
        initialSelectedValues: items,
      });
    }
  }

  private handleGridInputChange(
    name: 'minTicksStep' | 'marksStep', { value }: IInputFieldState,
  ): void {
    if (typeof value !== 'undefined' && this.props.sliderOptions.grid) {
      this.props.sliderOptions.grid[name] = Number(value);
      const { grid } = this.props.sliderOptions;
      this.children.rangeSlider.alRangeSlider('restart', {
        initialSelectedValues: this.state.sliderSelectedValues,
        grid,
      });
    }
  }

  @bind
  private handleOrientationToggleChange({ checked }: IInputToggleState): void {
    if (typeof checked !== 'undefined') {
      const orientation = checked ? 'vertical' : 'horizontal';
      this.setState({ orientation });
      this.children.rangeSlider.alRangeSlider('restart', {
        initialSelectedValues: this.state.sliderSelectedValues,
        orientation,
      });
    }
  }

  @bind
  private handleShowTooltipsToggleChange({ checked }: IInputToggleState): void {
    if (typeof checked !== 'undefined') {
      this.children.rangeSlider.alRangeSlider('restart', {
        initialSelectedValues: this.state.sliderSelectedValues,
        showTooltips: checked,
      });
    }
  }

  @bind
  private handleCollideTooltipsToggleChange({ checked }: IInputToggleState): void {
    if (typeof checked !== 'undefined') {
      this.children.rangeSlider.alRangeSlider('restart', {
        initialSelectedValues: this.state.sliderSelectedValues,
        collideTooltips: checked,
      });
    }
  }

  @bind
  private handleCollideKnobsToggleChange({ checked }: IInputToggleState): void {
    if (typeof checked !== 'undefined') {
      this.children.rangeSlider.alRangeSlider('restart', {
        initialSelectedValues: this.state.sliderSelectedValues,
        collideKnobs: checked,
      });
    }
  }

  @bind
  private handleSmoothTransitionToggleChange({ checked }: IInputToggleState): void {
    if (typeof checked !== 'undefined') {
      this.children.rangeSlider.alRangeSlider('restart', {
        initialSelectedValues: this.state.sliderSelectedValues,
        allowSmoothTransition: checked,
      });
    }
  }

  @bind
  private handlePointsListChange({ items }: IKeyValueListState): void {
    if (typeof items !== 'undefined') {
      this.children.rangeSlider.alRangeSlider('restart', {
        initialSelectedValues: this.state.sliderSelectedValues,
        pointsMap: items,
      });
    }
  }

  @bind
  private handleArrayInputChange({ value }: IInputFieldState): void {
    if (typeof value !== 'undefined') {
      let valuesArray: string[] | number[] = value.split(',');
      const isNumericArray = valuesArray.every((val) => isNumeric(val));
      if (isNumericArray) {
        valuesArray = valuesArray.map((val) => Number(val));
      }
      this.children.rangeSlider.alRangeSlider('restart', {
        initialSelectedValues: this.state.sliderSelectedValues,
        valuesArray,
      });
    }
  }

  private handleRangeInputChange(
    name: 'min' | 'max' | 'step', { value }: IInputFieldState,
  ): void {
    if (typeof value !== 'undefined' && this.props.sliderOptions.range) {
      this.props.sliderOptions.range[name] = Number(value);
      const { range } = this.props.sliderOptions;
      this.children.rangeSlider.alRangeSlider('restart', {
        initialSelectedValues: this.state.sliderSelectedValues,
        range,
      });
    }
  }
}

export type { IConfigPanelState };
export default ConfigPanel;
