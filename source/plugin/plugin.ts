import Model from './Model/Model';
import View from './View/View';
import Presenter from './Presenter/Presenter';

function renderSliders() {
  const sliderInputs = document.querySelectorAll('.js-temp-input');
  sliderInputs.forEach((input) => {
    const model = new Model();
    const view = new View(input as HTMLElement);
    const presenter = new Presenter(model, view);
  });
}

export default renderSliders();
