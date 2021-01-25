import Model from './Model/Model';
import View from './View/View';
import Presenter from './Presenter/Presenter';

function renderSliders() {
  const blocks = document.querySelectorAll('.js-example-slider');
  blocks.forEach((block) => {
    const model = new Model();
    const view = new View({
      parent: block as HTMLElement,
      cssClass: 'al-range-slider',
      orientation: 'horizontal',
    });
    const presenter = new Presenter(model, view);
  });
}

export default renderSliders();
