import bind from 'bind-decorator';

import Model from '../Model/Model';
import { IModelState } from '../Model/ModelTypes';
import View from '../View/View';
import { IViewState } from '../View/ViewTypes';

class Presenter {
  private model: Model;

  private view: View;

  constructor(model: Model, view: View) {
    this.model = model;
    this.view = view;
    this.initialize();
  }

  private initialize(): void {
    this.model.addObserver(this.updateView);
    this.view.addObserver(this.updateModel);

    const pointValue = this.model.getStatePointValue();
    this.model.setCurrentPositionFromPoint(pointValue);
  }

  @bind
  private updateView({ pointValue, positionRatio }: IModelState): void {
    this.view.setCurrentPositionRatio(positionRatio);
    this.view.renderPosition(positionRatio);
    this.view.setInputValue(pointValue);
  }

  @bind
  private updateModel({ positionRatio }: IViewState): void {
    this.model.setCurrentPointFromPosition(positionRatio);
  }
}

export default Presenter;
