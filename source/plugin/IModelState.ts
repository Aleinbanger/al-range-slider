interface IModelState {
  value: {
    min: number;
    max: number;
    step: number;
  };
  currentPoint: {
    from: number | string;
    to?: number | string;
  }
  pointsMap: Record<number, number | string>; // also can be defined from config
  pointsArray?: number[] | string[];
  type: 'single' | 'double';
  orientation: 'horizontal' | 'vertical';
  showInput: boolean;
  showScale: boolean;
  showTooltips: boolean;
}

export default IModelState;
