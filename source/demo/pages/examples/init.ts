import Examples from './Examples';

function renderBlock(): void {
  const parents = document.querySelectorAll<HTMLElement>('.js-examples');
  parents.forEach((parent) => new Examples(parent));
}

export default renderBlock();
