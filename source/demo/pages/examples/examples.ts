import 'plugin/plugin';

import './examples.scss';

function renderSliders() {
  const slider = $('.js-example-slider').alRangeSlider({
    initialSelectedValues: {
      from: -50,
      to: -20,
      from1: 30,
      to1: 70,
    },
    // valuesArray: [
    //   0, 1, 13, 34, 55, 13, 53, 66, 87, 200, 100, 101, 102, 102.5, 103,
    //   5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 100.5, 101.5, 103.5,
    // ],
    // valuesArray: ['qwe', 'asd', 'zxc', 'qaz', 'wsx', 'edc'],
    // pointsMap: {
    //   0: 0,
    //   0.1: 1,
    //   0.3: 'asd',
    //   0.5: 50,
    //   1: 'aasdasd',
    // },
    grid: {
      minTicksStep: 1,
      marksStep: 5,
    },
    // orientation: 'vertical',
    onInit: (state) => console.log('init', state),
    onStart: (state) => console.log('start', state),
    onFinish: (state) => console.log('finish', state),
  });
  // slider.alRangeSlider('update', { positions: { from: 0 } });
  // slider.alRangeSlider('restart');
  // slider.alRangeSlider('destroy');
}

export default renderSliders();
