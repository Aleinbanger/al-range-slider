import { Entry } from './typeUtils';

function requireAll(context: __WebpackModuleApi.RequireContext): Record<string, string> {
  const srcMap: Record<string, string> = {};
  context.keys().forEach((key: string) => {
    const fileName = key.match(/^.*\/(.*)\..*$/)?.[1]; // w/o path and extension
    srcMap[fileName as string] = context(key).default;
  });
  return srcMap;
}

function cloneDeep<T>(target: T): T {
  if (target === null) {
    return target;
  }
  if (target instanceof Date) {
    return new Date(target.getTime()) as unknown as T;
  }
  if (target instanceof Array) {
    const clone = [...target];
    return clone.map((value) => cloneDeep(value)) as unknown as T;
  }
  if (typeof target === 'object' && target !== {}) {
    const clone = { ...target } as Record<string | number | symbol, unknown>;
    Object.keys(clone).forEach((key) => {
      clone[key] = cloneDeep(clone[key]);
    });
    return clone as T;
  }
  return target;
}

// eslint-disable-next-line @typescript-eslint/ban-types
function filterObject<T extends object>(
  object: T,
  predicate: (entry: Entry<T>, index: number, array: Entry<T>[]) => boolean,
): { [k: string]: T[keyof T] } {
  const filteredObject = Object.fromEntries(
    (Object.entries(object) as Entry<T>[]).filter(predicate),
  );
  return filteredObject;
}

function getKeyByValue<T>(object: Record<number | string, T>, value: T): string | undefined {
  const keyByValue = Object.keys(object).find((key) => object[key] === value);
  return keyByValue;
}

function getClosestNumber(array: (number | string)[], number: number): number | undefined {
  const numbers = array.filter((el) => typeof el === 'number') as number[];
  if (numbers.length > 0 && !Number.isNaN(number)) {
    const closestNumber = numbers.reduce((prev, curr) => (
      Math.abs(curr - number) < Math.abs(prev - number) ? curr : prev
    ));
    return closestNumber;
  }
  return undefined;
}

function isNumeric(value: unknown): boolean {
  if (typeof value === 'number') {
    return true;
  }
  if (typeof value === 'string') {
    return !Number.isNaN(Number.parseFloat(value)) && !/\D+$/.test(value);
  }
  return false;
}

function isNumberArray(value: unknown): value is number[] {
  if (value instanceof Array) {
    return value.every((el) => typeof el === 'number');
  }
  return false;
}

function isStringArray(value: unknown): value is string[] {
  if (value instanceof Array) {
    return value.every((el) => typeof el === 'string');
  }
  return false;
}

export {
  requireAll,
  cloneDeep,
  filterObject,
  getKeyByValue,
  getClosestNumber,
  isNumeric,
  isNumberArray,
  isStringArray,
};
