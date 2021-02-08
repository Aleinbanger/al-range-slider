import Presenter, { TConfig } from './Presenter/Presenter';

function renderSliders() {
  const blocks = document.querySelectorAll('.js-example-slider');
  blocks.forEach((block) => {
    const config: TConfig = {
      parent: block as HTMLElement,
      orientation: 'vertical',
      grid: {
        minTicksGap: 50,
        marksStep: 1,
      },
      showInputs: true,
      showTooltips: true,
      collideTooltips: true,
      collideKnobs: true,
      allowSmoothTransition: true,
      initialSelectedValues: {
        from: -50,
        to: -20,
        from1: 0,
        to2: -70,
      },
      valuesPrecision: 6,
      range: {
        min: -100,
        max: 101,
        step: 2.17,
      },
      // valuesArray: [0, 1, 13, 34, 55, 13, 53, 66, 87, 200, 100, 101],
      // valuesArray: ['qwe', 'asd', 'zxc', 'qaz', 'wsx', 'edc'],
      // pointsMap: {
      //   0: 0,
      //   0.1: 1,
      //   0.3: 'asd',
      //   0.5: 50,
      //   1: 'aasdasd',
      // },
    };

    const presenter = new Presenter(config);
  });
}

export default renderSliders();
