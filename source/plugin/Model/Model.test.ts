import Model, { IModelProps, TModelEvent } from './Model';

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
    const mockObserver = jest.fn(({ kind, data }: TModelEvent) => [kind, data]);

    describe('select point limits', () => {
      const model = new Model(props);
      model.addObserver(mockObserver);

      const idCasesMap: Record<PropsCasesDescription, [
        id: string,
        stateMin: number, observerMin: number,
        stateMax: number, observerMax: number,
      ][]> = {
        [PropsCasesDescription.Range]: [['from', 0, 0, 0.995, 1], ['to', 0.505, 0.5, 1, 1]],
        [PropsCasesDescription.NumberArray]: [['from', 0, 0, 0.01, 0.05], ['to', 0.01, 0, 1, 1]],
        [PropsCasesDescription.StringArray]: [['from', 0, 0, 0.2, 0.3], ['to', 0.3, 0.2, 1, 1]],
        [PropsCasesDescription.PointsMap]: [['from', 0, 0, 0.4, 0.5], ['to', 0.3, 0.1, 1, 1]],
      };

      test.each(idCasesMap[description])('should select the correct point limits for id "%s"', (
        id, stateMin, observerMin, stateMax, observerMax,
      ) => {
        model.selectPointLimits(id);
        const { selectedPointsLimits } = model.getState();
        expect(selectedPointsLimits[id]).toEqual({ min: stateMin, max: stateMax });
        expect(mockObserver).lastReturnedWith(
          ['position limits change', [id, { min: observerMin, max: observerMax }]],
        );
      });
    });

    describe('select point by current position', () => {
      const model = new Model(props);
      model.addObserver(mockObserver);

      const idCasesMap: Record<PropsCasesDescription, [
        id: string,
        inputPositionRatio: number, outputPositionRatio: number,
        value: number | string,
      ][]> = {
        [PropsCasesDescription.Range]: [['from', 0, 0, -50], ['to', 0.5, 0.5, 0], ['from', 1, 0, -50]],
        [PropsCasesDescription.NumberArray]: [['from', 0, 0, 0], ['to', 0.55, 0.55, 55], ['from', 1, 0, 0]],
        [PropsCasesDescription.StringArray]: [['from', 0, 0, 'qwe'], ['to', 0.5, 0.5, 'edc'], ['from', 1, 0, 'qwe']],
        [PropsCasesDescription.PointsMap]: [['from', 0, 0, 0], ['to', 0.3, 0.3, 'asd'], ['from', 1, 0, 0]],
      };

      test.each(idCasesMap[description])('should select the correct point by current position for id "%s"', (
        id, inputPositionRatio, outputPositionRatio, value,
      ) => {
        model.selectPointLimits(id);
        model.selectPointByPosition([id, inputPositionRatio]);
        const { selectedPoints } = model.getState();
        expect(selectedPoints[id]).toEqual([outputPositionRatio, value]);
        expect(mockObserver).lastReturnedWith(['point change', [id, selectedPoints[id]]]);
      });
    });

    describe('select point by unknown position', () => {
      const model = new Model(props);
      model.addObserver(mockObserver);

      const idCasesMap: Record<PropsCasesDescription, [
        id: string,
        inputPositionRatio: number, outputPositionRatio: number,
        value: number | string,
      ][]> = {
        [PropsCasesDescription.Range]: [['from', 0.2512, 0.25, -25], ['to', 0.7521, 0.75, 25]],
        [PropsCasesDescription.NumberArray]: [['from', 0.014, 0.01, 1], ['to', 0.5, 0.53, 53]],
        [PropsCasesDescription.StringArray]: [['from', 0.14, 0.1, 'asd'], ['to', 0.52, 0.5, 'edc']],
        [PropsCasesDescription.PointsMap]: [['from', 0.049, 0, 0], ['to', 0.9, 1, 'qwe']],
      };

      test.each(idCasesMap[description])('should select the correct point with id "%s" by unknown position', (
        id, inputPositionRatio, outputPositionRatio, value,
      ) => {
        model.selectPointByUnknownPosition(inputPositionRatio);
        const { selectedPoints } = model.getState();
        expect(selectedPoints[id]).toEqual([outputPositionRatio, value]);
        expect(mockObserver).lastReturnedWith(['point change', [id, selectedPoints[id]]]);
      });
    });

    describe('select point by current value', () => {
      const model = new Model(props);
      model.addObserver(mockObserver);

      const idCasesMap: Record<PropsCasesDescription, [
        id: string,
        positionRatio: number,
        inputValue: number | string, outputValue: number | string,
      ][]> = {
        [PropsCasesDescription.Range]: [['from', 0.255, -24.55, -24.5], ['to', 0.75, 24.9, 25], ['from', 0.745, 50, 24.5]],
        [PropsCasesDescription.NumberArray]: [['from', 0.01, 2, 1], ['to', 0.53, 50, 53], ['from', 0.34, 100, 34]],
        [PropsCasesDescription.StringArray]: [['from', 0.1, 'asd', 'asd'], ['to', 0.6, '1a', '1a'], ['from', 0.5, '2a', 'edc']],
        [PropsCasesDescription.PointsMap]: [['from', 0, 0, 0], ['to', 0.4, '1a', '1a'], ['from', 0.3, 'qwe', 'asd']],
      };

      test.each(idCasesMap[description])('should select the correct point by current value for id "%s"', (
        id, positionRatio, inputValue, outputValue,
      ) => {
        model.selectPointLimits(id);
        model.selectPointByValue([id, inputValue]);
        const { selectedPoints } = model.getState();
        expect(selectedPoints[id]).toEqual([positionRatio, outputValue]);
        expect(mockObserver).lastReturnedWith(['point change', [id, selectedPoints[id]]]);
      });
    });
  });
});
