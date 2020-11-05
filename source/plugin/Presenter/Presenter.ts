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
    this.view.addObserver(this.handleCurrentActiveStatusChange);
    this.view.addObserver(this.handleCurrentPositionChange);
    this.view.addObserver(this.handleCurrentValueChange);
    this.view.addObserver(this.handleUnknownPositionChange);
    this.model.addObserver(this.handleCurrentPointLimitsChange);
    this.model.addObserver(this.handleCurrentPointChange);

    const pointsMap = this.model.getPointsMap();
    this.view.initializeGrid({ pointsMap, minTicksGap: 20, marksStep: 5 });

    let selectedPoints = this.model.getSelectedPoints();
    selectedPoints.forEach(([id, point]) => {
      this.view.initializePoint(id);
      this.model.selectPointByValue([id, point[1]]);
    });
    selectedPoints = this.model.getSelectedPoints();
    selectedPoints.forEach(([id, point]) => {
      this.model.selectPointLimits(id);
      this.model.selectPointByValue([id, point[1]]);
    });
  }

  @bind
  private handleCurrentActiveStatusChange({ currentActiveStatus }: IViewState): void {
    if (currentActiveStatus) {
      this.view.setState({ currentActiveStatus });
      const [id, active] = currentActiveStatus;
      if (active) {
        this.model.selectPointLimits(id);
      }
    }
  }

  @bind
  private handleCurrentPositionChange({ currentPosition }: IViewState): void {
    if (currentPosition) {
      this.model.selectPointByPosition(currentPosition);
    }
  }

  @bind
  private handleCurrentValueChange({ currentValue }: IViewState): void {
    if (currentValue) {
      this.model.selectPointByValue(currentValue);
    }
  }

  @bind
  private handleUnknownPositionChange({ unknownPosition }: IViewState): void {
    if (typeof unknownPosition !== 'undefined') {
      this.model.selectPointByUnknownPosition(unknownPosition);
    }
  }

  @bind
  private handleCurrentPointLimitsChange({ currentPointLimits }: IModelData): void {
    if (currentPointLimits) {
      this.view.setState({ currentPositionLimits: currentPointLimits });
    }
  }

  @bind
  private handleCurrentPointChange({ currentPoint }: IModelData): void {
    if (currentPoint) {
      const [id, point] = currentPoint;
      this.view.setState({
        currentPosition: [id, point[0]],
        currentValue: [id, String(point[1])],
      });
    }
  }
}

export default Presenter;
