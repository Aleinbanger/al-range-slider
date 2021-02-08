import bind from 'bind-decorator';

import View from '../View/View';
import { IViewProps, IViewState } from '../View/ViewTypes';
import Model from '../Model/Model';
import { IModelProps, IModelData } from '../Model/ModelTypes';

type TConfig = Omit<IViewProps, 'cssClass'>
& Omit<IModelProps, 'pointsMapPrecision' | 'positionsArray'>;

class Presenter {
  private readonly view: View;

  private readonly model: Model;

  constructor(config: TConfig) {
    const {
      parent,
      orientation,
      grid,
      showInputs,
      showTooltips,
      collideTooltips,
      collideKnobs,
      allowSmoothTransition,
      initialSelectedValues,
      valuesPrecision,
      range,
      valuesArray,
      pointsMap,
    } = config;

    this.view = new View({
      cssClass: 'al-range-slider',
      parent,
      orientation,
      grid,
      showInputs,
      showTooltips,
      collideTooltips,
      allowSmoothTransition,
    });
    this.model = new Model({
      initialSelectedValues,
      valuesPrecision,
      collideKnobs,
      range,
      valuesArray,
      pointsMap,
    });
    this.initialize();
  }

  private initialize(): void {
    this.view.addObserver(this.handleCurrentActiveStatusChange);
    this.view.addObserver(this.handleCurrentPositionChange);
    this.view.addObserver(this.handleCurrentValueChange);
    this.view.addObserver(this.handleUnknownPositionChange);
    this.model.addObserver(this.handleCurrentPointLimitsChange);
    this.model.addObserver(this.handleCurrentPointChange);

    this.initializeGrid();
    this.initializeBars();
    this.initializePoints();
  }

  private initializeGrid(): void {
    const pointsMap = this.model.getPointsMap();
    this.view.initializeGrid(pointsMap);
  }

  private initializeBars(): void {
    const selectedPoints = this.model.getSelectedPoints();
    const selectedIds = selectedPoints.map(([id]) => id);
    this.view.initializeBars(selectedIds);
  }

  private initializePoints(): void {
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

export type { TConfig };
export default Presenter;
