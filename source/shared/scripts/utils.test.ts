import {
  getKeyByValue,
  getClosestNumber,
  isNumeric,
  isNumberArray,
  isStringArray,
} from './utils';

test('should get the key by value from object', () => {
  const obj = { foo: 'bar' };
  expect(getKeyByValue(obj, 'bar')).toBe('foo');
  expect(getKeyByValue(obj, 'foo')).toBe(undefined);
  expect(getKeyByValue({}, 'foo')).toBe(undefined);
});

test('should get the closest number from array', () => {
  const array = [0, 1, 3, 6, 10, '11', '12'];
  expect(getClosestNumber(array, 1)).toBe(1);
  expect(getClosestNumber(array, 2)).toBe(1);
  expect(getClosestNumber(array, 7)).toBe(6);
  expect(getClosestNumber(array, 12)).toBe(10);
  expect(getClosestNumber(['0'], 0)).toBe(undefined);
  expect(getClosestNumber([], 0)).toBe(undefined);
});

test('should determine if a value is numeric', () => {
  expect(isNumeric(1)).toBe(true);
  expect(isNumeric('1')).toBe(true);
  expect(isNumeric('1a')).toBe(true);
  expect(isNumeric('a1')).toBe(false);
  expect(isNumeric({ a: 1 })).toBe(false);
});

test('should determine if a value is of type "number[]"', () => {
  expect(isNumberArray([1, 2, 3])).toBe(true);
  expect(isNumberArray([])).toBe(true);
  expect(isNumberArray([1, 2, '3'])).toBe(false);
  expect(isNumberArray(1)).toBe(false);
  expect(isNumberArray('1')).toBe(false);
});

test('should determine if a value is of type "string[]"', () => {
  expect(isStringArray(['a', 'b', 'c'])).toBe(true);
  expect(isStringArray([])).toBe(true);
  expect(isStringArray([1, 'b', 'c'])).toBe(false);
  expect(isStringArray(1)).toBe(false);
  expect(isStringArray('a')).toBe(false);
});
