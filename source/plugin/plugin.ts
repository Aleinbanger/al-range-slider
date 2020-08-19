import Model from './Model/Model';
import View from './View/View';
import Presenter from './Presenter/Presenter';

function renderSliders() {
  const blocks = document.querySelectorAll('.js-example-slider');
  blocks.forEach((block) => {
    const model = new Model();
    const view = new View(block as HTMLElement);
    const presenter = new Presenter(model, view);
  });
}

export default renderSliders();
