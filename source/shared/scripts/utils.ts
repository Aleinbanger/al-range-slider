/* eslint-disable import/prefer-default-export */

function requireAll(context: __WebpackModuleApi.RequireContext): Record<string, string> {
  const srcMap: Record<string, string> = {};
  context.keys().forEach((key: string) => {
    const fileName = key.match(/^.*\/(.*)\..*$/)?.[1]; // w/o path and extension
    srcMap[fileName as string] = context(key).default;
  });
  return srcMap;
}

function getKeyByValue(object: Record<number | string, number | string>, value: number | string):
string | never {
  const keyByValue = Object.keys(object).find((key) => object[key] === value);
  if (typeof keyByValue !== 'undefined') {
    return keyByValue;
  }
  throw new Error('The object does not contain specified value');
}

function getClosestNumber(number: number, array: (number | string)[]): number | never {
  const numbers = array.filter((el) => typeof el === 'number') as number[];
  if (numbers.length > 0) {
    const closestNumber = numbers.reduce((prev, curr) => (
      Math.abs(curr - number) < Math.abs(prev - number) ? curr : prev
    ));
    return closestNumber;
  }
  throw new Error('The array does not contain any numbers');
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
  getKeyByValue,
  getClosestNumber,
  isNumberArray,
  isStringArray,
};
