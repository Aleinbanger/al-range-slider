import AlRangeSlider from './AlRangeSlider';

function renderBlocks() {
  const sliderInputs = document.querySelectorAll('.js-temp-input');
  sliderInputs.forEach((input) => new AlRangeSlider(input as HTMLElement));
}

export default renderBlocks();
