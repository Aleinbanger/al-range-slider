/* eslint-disable import/prefer-default-export */

function requireAll(context: __WebpackModuleApi.RequireContext): Record<string, string> {
  const obj: Record<string, string> = {};

  context.keys().forEach((key: string) => {
    const name = key.match(/^.*\/(.*)\..*$/)?.[1];
    obj[name as string] = context(key).default;
  });

  return obj;
}

function getKeyByValue(object: Record<number | string, number | string>, value: number | string):
string | undefined {
  const keyByValue = Object.keys(object).find((key) => object[key] === value);
  return keyByValue;
}

function getClosestNumber(number: number, array: number[]): number {
  const closestNumber = array.reduce((prev, curr) => (
    Math.abs(curr - number) < Math.abs(prev - number) ? curr : prev
  ));
  return closestNumber;
}

export {
  requireAll,
  getKeyByValue,
  getClosestNumber,
};
