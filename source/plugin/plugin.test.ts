import 'plugin/plugin';

import Presenter from './Presenter/Presenter';

let parent: HTMLElement;
let plugin: JQuery;

beforeEach(() => {
  parent = document.createElement('div');
  document.body.appendChild(parent);
  plugin = $(parent).alRangeSlider();
});
afterEach(() => {
  plugin.alRangeSlider('destroy');
  parent.remove();
});

test('should create an instance of Presenter and assign it to "alRangeSlider" data attribute', () => {
  expect(plugin.data('alRangeSlider')).toBeInstanceOf(Presenter);
});

test.each([
  ['destroy'],
  ['disable'],
  ['restart'],
  ['update'],
])('should call Presenter\'s %s method', (method) => {
  const { methods } = plugin.alRangeSlider;
  expect(methods).toContain(method);
  const methodSpy = jest.spyOn(plugin.data('alRangeSlider'), method);
  plugin.alRangeSlider(method as typeof methods[number]);
  expect(methodSpy).toBeCalled();
});
