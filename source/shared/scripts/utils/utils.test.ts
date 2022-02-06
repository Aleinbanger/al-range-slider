import {
  cloneDeep,
  filterObject,
  getKeyByValue,
  getClosestNumber,
  isNumeric,
  isNumberArray,
  isStringArray,
} from './utils';

test('should return a deep clone', () => {
  const obj = {
    arr: [{ qwe: 'asd', subArr: [1, 2, '3'] }],
    subObj: {
      subArr: [1, 2, ['3']],
      date: new Date(),
      null: null,
    },
  };
  const objClone = cloneDeep(obj);
  expect(objClone.arr).toBeInstanceOf(Array);
  expect(objClone.arr).not.toBe(obj.arr);
  expect(objClone.arr[0]).not.toBe(obj.arr[0]);
  expect(objClone.arr[0].subArr).toBeInstanceOf(Array);
  expect(objClone.arr[0].subArr).not.toBe(obj.arr[0].subArr);
  expect(objClone.subObj.subArr).toBeInstanceOf(Array);
  expect(objClone.subObj.subArr).not.toBe(obj.subObj.subArr);
  expect(objClone.subObj.subArr[2]).not.toBe(obj.subObj.subArr[2]);
  expect(objClone.subObj.date).toBeInstanceOf(Date);
  expect(objClone.subObj.date).not.toBe(obj.subObj.date);
});

test('should correctly filter the provided object', () => {
  const obj = {
    foo: 1,
    bar: 2,
    qwe: 3,
    asd: 4,
    zxc: 5,
  };
  const filteredObj = filterObject(obj, ([key, value]) => key !== 'asd' && value > 2);
  expect(filteredObj).toStrictEqual({ qwe: 3, zxc: 5 });
  expect(filteredObj).not.toBe(obj);
});

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
  expect(getClosestNumber(array, NaN)).toBe(undefined);
  expect(getClosestNumber(['0'], 0)).toBe(undefined);
  expect(getClosestNumber([], 0)).toBe(undefined);
});

test('should determine if a value is numeric', () => {
  expect(isNumeric(1)).toBe(true);
  expect(isNumeric('1')).toBe(true);
  expect(isNumeric('1.23')).toBe(true);
  expect(isNumeric('1a')).toBe(false);
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
