/* eslint-disable import/prefer-default-export */

import { ExtractFunctionArgs } from 'shared/scripts/utils/typeUtils';

import Presenter, { IProps } from './Presenter/Presenter';

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
  range: { min: 0, max: 100, step: 1 },
  orientation: 'horizontal',
  theme: 'light',
  grid: { minTicksStep: 1, marksStep: 1 },
  showInputs: true,
  showTooltips: true,
  collideTooltips: true,
  collideKnobs: true,
  allowSmoothTransition: true,
};
const methods = ['destroy', 'disable', 'restart', 'update'] as const;
type TOptions = Partial<IProps>;
type TMethod = typeof methods[number];
type TMethodArg<T extends TMethod> = ExtractFunctionArgs<Presenter, T>;
type TMethodFunc<T extends TMethod> = (arg: TMethodArg<T>) => void;

function plugin<T extends TMethod>(
  this: JQuery, optionsOrMethod?: TOptions | T, methodArg?: TMethodArg<T>,
): JQuery {
  if (typeof optionsOrMethod === 'undefined' || typeof optionsOrMethod === 'object') {
    const config = $.extend({}, $.fn[pluginName].defaults, optionsOrMethod);
    return this.each((_, element) => {
      if (!$.data(element, pluginName)) {
        $.data(element, pluginName, new Presenter(element, config));
      }
    });
  }
  if (methods.includes(optionsOrMethod)) {
    return this.each((_, element) => {
      const instance = $.data(element, pluginName);
      if (instance instanceof Presenter && typeof instance[optionsOrMethod] === 'function') {
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

export type { TOptions };
