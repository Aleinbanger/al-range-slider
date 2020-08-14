import bind from 'bind-decorator';

import Model from '../Model/Model';
import { TSelectedPoint } from '../Model/ModelTypes';
import View from '../View/View';
import { TSelectedPosition } from '../View/ViewTypes';

class Presenter {
  private readonly model: Model;

  private readonly view: View;

  constructor(model: Model, view: View) {
    this.model = model;
    this.view = view;
    this.initialize();
  }

  private initialize(): void {
    this.model.addObserver('selectedPointChange', this.handleSelectedPointChange);
    this.view.addObserver('selectedPositionChange', this.handleSelectedPositionChange);

    const selectedPoints = this.model.getSelectedPoints();
    selectedPoints.forEach(([id, point]) => {
      this.view.initializePoint(id);
      this.model.selectPointByValue(id, point[1]);
    });
  }

  @bind
  private handleSelectedPointChange([id, point]: TSelectedPoint): void {
    this.view.setSelectedPosition(id, point[0]);
    this.view.setInputValue(id, String(point[1]));
  }

  @bind
  private handleSelectedPositionChange([id, positionRatio]: TSelectedPosition): void {
    this.model.selectPointByPosition(id, positionRatio);
  }
}

export default Presenter;
