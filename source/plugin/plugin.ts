/* eslint-disable import/prefer-default-export */
/* eslint-disable no-param-reassign */

import { filterObject } from 'shared/scripts/utils/utils';
import { ExtractMethodArgs } from 'shared/scripts/utils/typeUtils';

import Presenter, { IProps, IState } from './Presenter/Presenter';

declare global {
  interface JQuery {
    alRangeSlider: {
      <T extends TMethod>(optionsOrMethod?: TOptions | T, methodArg?: TMethodArg<T>): JQuery;
      defaults: IProps;
      methods: typeof methods;
    }
  }
}

const pluginName = 'alRangeSlider';
const defaults: IProps = {
  initialSelectedValues: { to: 0 },
  valuesPrecision: 4,
  collideKnobs: true,
  range: { min: 0, max: 100, step: 1 },
  orientation: 'horizontal',
  theme: 'light',
  grid: { minTicksStep: 1, marksStep: 1 },
  allowSmoothTransition: true,
  showInputs: true,
  showTooltips: true,
  collideTooltips: true,
  tooltipsSeparator: ' \u2192 ',
};
const dataConfigSimpleTypes = {
  min: 'number',
  max: 'number',
  step: 'number',
  valuesPrecision: 'number',
  collideKnobs: 'boolean',
  orientation: 'string',
  theme: 'string',
  minTicksStep: 'number',
  marksStep: 'number',
  allowSmoothTransition: 'boolean',
  showTooltips: 'boolean',
  collideTooltips: 'boolean',
  tooltipsSeparator: 'string',
};
const methods = ['destroy', 'disable', 'restart', 'update'] as const;
type TOptions = Partial<IProps>;
type TMethod = typeof methods[number];
type TMethodArg<T extends TMethod> = ExtractMethodArgs<Presenter, T>;
type TMethodFunc<T extends TMethod> = (arg?: TMethodArg<T>) => void;

function validateProperty([property, value]: [string, unknown]): boolean {
  const isSimplePropertyValid = property in dataConfigSimpleTypes
    && typeof value === dataConfigSimpleTypes[property as keyof typeof dataConfigSimpleTypes];
  const isValuesArrayValid = property === 'valuesArray' && value instanceof Array;
  const isShowInputsValid = property === 'showInputs'
    && (typeof value === 'boolean' || value === 'hidden');
  const isValueIdValid = /^value([A-Z].+)$/.test(property)
    && (typeof value === 'number' || typeof value === 'string');
  if (isSimplePropertyValid) return true;
  if (isValuesArrayValid) return true;
  if (isShowInputsValid) return true;
  if (isValueIdValid) return true;
  return false;
}

function validateDataOptions(data: Record<string, unknown>): TOptions {
  const isDataObject = typeof data === 'object' && data !== null;
  if (isDataObject) {
    const validatedData = filterObject(data, validateProperty);

    const initialValuesEntries = Object.entries(validatedData)
      .map(([property, value]) => {
        const valueIdMatch = property.match(/^value([A-Z].+)$/);
        if (valueIdMatch) return [valueIdMatch[1], value];
        return undefined;
      })
      .filter((entry) => typeof entry !== 'undefined') as [string, string | number][];
    const initialSelectedValues = initialValuesEntries.length > 0
      ? Object.fromEntries(initialValuesEntries) : undefined;

    const {
      min, max, step, minTicksStep, marksStep,
    } = validatedData;
    const isRangeDefined = typeof min !== 'undefined' || typeof max !== 'undefined'
      || typeof step !== 'undefined';
    const isGridDefined = typeof minTicksStep !== 'undefined' || typeof marksStep !== 'undefined';
    const range = isRangeDefined
      ? $.extend({}, defaults.range, { min, max, step }) : undefined;
    const grid = isGridDefined
      ? $.extend({}, defaults.grid, { minTicksStep, marksStep }) : undefined;

    const tempData = {
      initialSelectedValues,
      range,
      grid,
    };
    const options: TOptions = $.extend({}, validatedData, tempData);
    return options;
  }
  return {};
}

function modifyConfig(element: HTMLElement, config: IProps): void {
  const updateDataValues = (state?: IState) => {
    if (state) {
      const { selectedValues } = state;
      Object.entries(selectedValues ?? {}).forEach(([id, value]) => {
        const capitalizedId = id.split('-')
          .map((tmpId) => tmpId.substring(0, 1).toUpperCase() + tmpId.substring(1))
          .join('');
        const dataAttr = `value${capitalizedId}`;
        element.dataset[dataAttr] = String(value);
      });
    }
  };
  const updateDataConfig = (state?: IState, props?: IProps) => {
    if (props) {
      const { range, valuesArray } = props;
      Object.entries(range ?? {}).forEach(([key, value]) => {
        if (element.dataset[key]) element.dataset[key] = String(value);
      });
      if (element.dataset.valuesArray) element.dataset.valuesArray = `${valuesArray}`;
    }
  };
  const { onChange, onInit } = config;
  type TOnChange = (state?: IState) => void;
  type TOnInit = (state?: IState, props?: IProps) => void;
  if (onChange) {
    const oldOnChange = onChange;
    (config.onChange as TOnChange) = (state?: IState) => {
      oldOnChange(state);
      updateDataValues(state);
    };
  } else {
    (config.onChange as TOnChange) = updateDataValues;
  }
  if (onInit) {
    const oldOnInit = onInit;
    (config.onInit as TOnInit) = (state?: IState, props?: IProps) => {
      oldOnInit(state, props);
      updateDataConfig(state, props);
    };
  } else {
    (config.onInit as TOnInit) = updateDataConfig;
  }
}

function plugin<T extends TMethod>(
  this: JQuery, optionsOrMethod?: TOptions | T, methodArg?: TMethodArg<T>,
): JQuery {
  const isInitMode = typeof optionsOrMethod === 'undefined'
    || typeof optionsOrMethod === 'object';
  if (isInitMode) {
    return this.each((_, element) => {
      const $element = $(element);
      if (!$element.data(pluginName)) {
        const $data = $element.data();
        const validatedDataOptions = validateDataOptions($data);
        const config = $.extend({}, defaults, { ...optionsOrMethod, ...validatedDataOptions });
        modifyConfig(element, config);
        $element.data(pluginName, new Presenter(element, config));
      }
    });
  }
  const isMethodMode = methods.includes(optionsOrMethod);
  if (isMethodMode) {
    return this.each((_, element) => {
      const instance = $(element).data(pluginName);
      const isMethodValid = instance instanceof Presenter
        && typeof instance[optionsOrMethod] === 'function';
      if (isMethodValid) {
        (instance[optionsOrMethod] as TMethodFunc<T>).call(instance, methodArg);
      }
    });
  }
  return this;
}

$.fn[pluginName] = Object.assign(
  plugin,
  {
    defaults,
    methods,
  },
);

export type { TOptions, TMethod, TMethodArg };
