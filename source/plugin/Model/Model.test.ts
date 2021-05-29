import Model, { IModelProps, IModelData } from './Model';

enum PropsCasesDescription {
  Range = 'initialized from range',
  NumberArray = 'initialized from number array',
  StringArray = 'initialized from string array',
  PointsMap = 'initialized from points map',
}

const propsCases: [description: PropsCasesDescription, props: IModelProps][] = [
  [
    PropsCasesDescription.Range,
    {
      valuesPrecision: 4,
      collideKnobs: true,
      range: { min: -50, max: 50, step: 0.5 },
      initialSelectedValues: { from: 0, to: 50 },
    },
  ],
  [
    PropsCasesDescription.NumberArray,
    {
      valuesPrecision: 4,
      collideKnobs: true,
      valuesArray: [0, 1, 5, 13, 34, 55, 53, 66, 87, 100],
      initialSelectedValues: { from: 0, to: 5 },
    },
  ],
  [
    PropsCasesDescription.StringArray,
    {
      valuesPrecision: 4,
      collideKnobs: true,
      valuesArray: [
        'qwe', 'asd', 'zxc', 'qaz', 'wsx', 'edc',
        '1a', '2a', '3a', '4a', '5a',
      ],
      initialSelectedValues: { from: 'zxc', to: 'qaz' },
    },
  ],
  [
    PropsCasesDescription.PointsMap,
    {
      valuesPrecision: 4,
      collideKnobs: true,
      pointsMap: {
        0: 0,
        0.1: 1,
        0.3: 'asd',
        0.4: '1a',
        0.5: 50,
        1: 'qwe',
      },
      initialSelectedValues: { from: 1, to: 50 },
    },
  ],
];

describe.each(propsCases)('%s', (description, props) => {
  describe('general methods', () => {
    const model = new Model(props);

    test('should correctly initialize all points', () => {
      const selectedPoints = model.getSelectedPoints();
      const selectedValues = selectedPoints.map(([id, point]) => [id, point[1]]);
      expect(Object.entries(props.initialSelectedValues)).toStrictEqual(selectedValues);
    });

    test('should get the state', () => {
      const state = model.getState();
      expect(state).toBeInstanceOf(Object);
      expect(state.selectedPoints).toBeInstanceOf(Object);
      expect(state.selectedPointsLimits).toBeInstanceOf(Object);
    });

    test('should get the selected points', () => {
      const selectedPoints = model.getSelectedPoints();
      expect(selectedPoints).toBeInstanceOf(Array);
      expect(selectedPoints.length)
        .toBe(Object.keys(props.initialSelectedValues).length);
    });

    test('should get the points map', () => {
      const pointsMap = model.getPointsMap();
      const positions = pointsMap.map(([position]) => Number(position));
      expect(pointsMap).toBeInstanceOf(Array);
      expect(Math.min(...positions)).toBe(0);
      expect(Math.max(...positions)).toBe(1);
    });
  });

  describe('notifying methods', () => {
    describe('select point limits', () => {
      const model = new Model(props);
      const mockObserver = jest.fn(({ currentPointLimits }: IModelData) => currentPointLimits);
      model.addObserver(mockObserver);

      let idCases: [
        id: string,
        stateMin: number, observerMin: number,
        stateMax: number, observerMax: number,
      ][] = [];
      switch (description) {
        case PropsCasesDescription.Range:
          idCases = [['from', 0, 0, 0.995, 1], ['to', 0.505, 0.5, 1, 1]];
          break;
        case PropsCasesDescription.NumberArray:
          idCases = [['from', 0, 0, 0.01, 0.05], ['to', 0.01, 0, 1, 1]];
          break;
        case PropsCasesDescription.StringArray:
          idCases = [['from', 0, 0, 0.2, 0.3], ['to', 0.3, 0.2, 1, 1]];
          break;
        case PropsCasesDescription.PointsMap:
          idCases = [['from', 0, 0, 0.4, 0.5], ['to', 0.3, 0.1, 1, 1]];
          break;
        default:
          break;
      }

      test.each(idCases)('should select the correct point limits for id "%s"', (
        id, stateMin, observerMin, stateMax, observerMax,
      ) => {
        model.selectPointLimits(id);
        const { selectedPointsLimits } = model.getState();
        const observerResult = mockObserver.mock.results[0].value as IModelData['currentPointLimits'];
        expect(selectedPointsLimits[id].min).toBe(stateMin);
        expect(selectedPointsLimits[id].max).toBe(stateMax);
        expect(observerResult?.[0]).toBe(id);
        expect(observerResult?.[1].min).toBe(observerMin);
        expect(observerResult?.[1].max).toBe(observerMax);
      });
    });

    describe('select point by current position', () => {
      const model = new Model(props);
      const mockObserver = jest.fn(({ currentPoint }: IModelData) => currentPoint);
      model.addObserver(mockObserver);

      let idCases: [
        id: string,
        inputPositionRatio: number, outputPositionRatio: number,
        value: number | string,
      ][] = [];
      switch (description) {
        case PropsCasesDescription.Range:
          idCases = [['from', 0, 0, -50], ['to', 0.5, 0.5, 0], ['from', 1, 0, -50]];
          break;
        case PropsCasesDescription.NumberArray:
          idCases = [['from', 0, 0, 0], ['to', 0.55, 0.55, 55], ['from', 1, 0, 0]];
          break;
        case PropsCasesDescription.StringArray:
          idCases = [['from', 0, 0, 'qwe'], ['to', 0.5, 0.5, 'edc'], ['from', 1, 0, 'qwe']];
          break;
        case PropsCasesDescription.PointsMap:
          idCases = [['from', 0, 0, 0], ['to', 0.3, 0.3, 'asd'], ['from', 1, 0, 0]];
          break;
        default:
          break;
      }

      test.each(idCases)('should select the correct point by current position for id "%s"', (
        id, inputPositionRatio, outputPositionRatio, value,
      ) => {
        model.selectPointLimits(id);
        model.selectPointByPosition([id, inputPositionRatio]);
        const { selectedPoints } = model.getState();
        const observerResult = mockObserver.mock.results[1].value as IModelData['currentPoint'];
        expect(selectedPoints[id][0]).toBe(outputPositionRatio);
        expect(selectedPoints[id][1]).toBe(value);
        expect(observerResult?.[0]).toBe(id);
        expect(observerResult?.[1][0]).toBe(selectedPoints[id][0]);
        expect(observerResult?.[1][1]).toBe(selectedPoints[id][1]);
      });
    });

    describe('select point by unknown position', () => {
      const model = new Model(props);
      const mockObserver = jest.fn(({ currentPoint }: IModelData) => currentPoint);
      model.addObserver(mockObserver);

      let idCases: [
        id: string,
        inputPositionRatio: number, outputPositionRatio: number,
        value: number | string,
      ][] = [];
      switch (description) {
        case PropsCasesDescription.Range:
          idCases = [['from', 0.2512, 0.25, -25], ['to', 0.7521, 0.75, 25]];
          break;
        case PropsCasesDescription.NumberArray:
          idCases = [['from', 0.014, 0.01, 1], ['to', 0.5, 0.53, 53]];
          break;
        case PropsCasesDescription.StringArray:
          idCases = [['from', 0.14, 0.1, 'asd'], ['to', 0.52, 0.5, 'edc']];
          break;
        case PropsCasesDescription.PointsMap:
          idCases = [['from', 0.049, 0, 0], ['to', 0.9, 1, 'qwe']];
          break;
        default:
          break;
      }

      test.each(idCases)('should select the correct point with id "%s" by unknown position', (
        id, inputPositionRatio, outputPositionRatio, value,
      ) => {
        model.selectPointByUnknownPosition(inputPositionRatio);
        const { selectedPoints } = model.getState();
        const observerResult = mockObserver.mock.results[1].value as IModelData['currentPoint'];
        expect(selectedPoints[id][0]).toBe(outputPositionRatio);
        expect(selectedPoints[id][1]).toBe(value);
        expect(observerResult?.[0]).toBe(id);
        expect(observerResult?.[1][0]).toBe(selectedPoints[id][0]);
        expect(observerResult?.[1][1]).toBe(selectedPoints[id][1]);
      });
    });

    describe('select point by current value', () => {
      const model = new Model(props);
      const mockObserver = jest.fn(({ currentPoint }: IModelData) => currentPoint);
      model.addObserver(mockObserver);

      let idCases: [
        id: string,
        positionRatio: number,
        inputValue: number | string, outputValue: number | string,
      ][] = [];
      switch (description) {
        case PropsCasesDescription.Range:
          idCases = [['from', 0.255, -24.55, -24.5], ['to', 0.75, 24.9, 25], ['from', 0.745, 50, 24.5]];
          break;
        case PropsCasesDescription.NumberArray:
          idCases = [['from', 0.01, 2, 1], ['to', 0.53, 50, 53], ['from', 0.34, 100, 34]];
          break;
        case PropsCasesDescription.StringArray:
          idCases = [['from', 0.1, 'asd', 'asd'], ['to', 0.6, '1a', '1a'], ['from', 0.5, '2a', 'edc']];
          break;
        case PropsCasesDescription.PointsMap:
          idCases = [['from', 0, 0, 0], ['to', 0.4, '1a', '1a'], ['from', 0.3, 'qwe', 'asd']];
          break;
        default:
          break;
      }

      test.each(idCases)('should select the correct point by current value for id "%s"', (
        id, positionRatio, inputValue, outputValue,
      ) => {
        model.selectPointLimits(id);
        model.selectPointByValue([id, inputValue]);
        const { selectedPoints } = model.getState();
        const observerResult = mockObserver.mock.results[1].value as IModelData['currentPoint'];
        expect(selectedPoints[id][0]).toBe(positionRatio);
        expect(selectedPoints[id][1]).toBe(outputValue);
        expect(observerResult?.[0]).toBe(id);
        expect(observerResult?.[1][0]).toBe(selectedPoints[id][0]);
        expect(observerResult?.[1][1]).toBe(selectedPoints[id][1]);
      });
    });
  });
});
