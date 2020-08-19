import bind from 'bind-decorator';

import Model from '../Model/Model';
import { IModelData } from '../Model/ModelTypes';
import View from '../View/View';
import { IViewState } from '../View/ViewTypes';

class Presenter {
  private readonly model: Model;

  private readonly view: View;

  constructor(model: Model, view: View) {
    this.model = model;
    this.view = view;
    this.initialize();
  }

  private initialize(): void {
    this.model.addObserver(this.handleSelectedPointChange);
    this.view.addObserver(this.handleSelectedPositionChange);
    this.view.addObserver(this.handleSelectedValueChange);

    const selectedPoints = this.model.getSelectedPoints();
    selectedPoints.forEach(([id, point]) => {
      this.view.initializePoint(id);
      this.model.selectPointByValue([id, point[1]]);
    });
  }

  @bind
  private handleSelectedPointChange({ selectedPoint }: IModelData): void {
    if (selectedPoint) {
      const [id, point] = selectedPoint;
      this.view.setState({
        selectedPosition: [id, point[0]],
        selectedValue: [id, String(point[1])],
      });
    }
  }

  @bind
  private handleSelectedPositionChange({ selectedPosition }: IViewState): void {
    if (selectedPosition) {
      this.model.selectPointByPosition(selectedPosition);
    }
  }

  @bind
  private handleSelectedValueChange({ selectedValue }: IViewState): void {
    if (selectedValue) {
      this.model.selectPointByValue(selectedValue);
    }
  }
}

export default Presenter;
