import bind from 'bind-decorator';

import Model from '../Model/Model';
import { IModelState } from '../Model/ModelTypes';
import View from '../View/View';
import { IViewState } from '../View/ViewTypes';

class Presenter {
  private model: Model;

  private view: View;

  private modelState!: IModelState;

  private viewState!: IViewState;

  constructor(model: Model, view: View) {
    this.model = model;
    this.view = view;
    this.initialize();
  }

  private initialize(): void {
    this.model.addObserver(this.updateView);
    this.view.addObserver(this.updateModel);

    this.modelState = this.model.getState();
    this.viewState = this.view.getState();

    this.model.setCurrentPositionFromPoint(this.modelState.currentPoint.from);
  }

  @bind
  private updateView(modelState: IModelState): void {
    // temp, change to separate values
    this.modelState = modelState;
    this.view.setCurrentPositionRatio(this.modelState.currentPositionRatio);
    this.view.renderPosition(this.modelState.currentPositionRatio.from);
    this.view.setInputValue(this.modelState.currentPoint.from);
    // not supposed to know inner state structure, get from and to values using public methods
  }

  @bind
  private updateModel(positionRatio: number): void {
    // temp, change to separate values
    this.model.setCurrentPointFromPosition(positionRatio);
  }
}

export default Presenter;
