/* eslint-disable @typescript-eslint/dot-notation */

import Observable from './Observable';

interface ITestData {
  data: number;
}

class TestObservable extends Observable<ITestData> {}

let testObservable: TestObservable;
const mockObserver = jest.fn(({ data }: ITestData) => data);

beforeEach(() => {
  testObservable = new TestObservable();
  testObservable.addObserver(mockObserver);
});

test('should add observer if it does not already exist', () => {
  testObservable.addObserver(mockObserver);
  expect(testObservable['observers'].length).toBe(1);
});

test('should remove observer if it exists', () => {
  testObservable.removeObserver(mockObserver);
  expect(testObservable['observers'].length).toBe(0);
});

test('should notify observers', () => {
  testObservable['notifyObservers']({ data: 100 });
  expect(mockObserver).lastReturnedWith(100);
});
