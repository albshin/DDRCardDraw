import createStore, { SetState } from 'zustand';

export interface ConfigState {
  chartCount: number;
  upperBound: number;
  lowerBound: number;
  useLevelConstants: boolean;
  useWeights: boolean;
  orderByAction: boolean;
  weights: Record<number, number>;
  forceDistribution: boolean;
  constrainPocketPicks: boolean;
  difficulties: ReadonlySet<string>;
  categories: ReadonlySet<string>;
  flags: ReadonlySet<string>;
  showPool: boolean;
  update: SetState<ConfigState>;
}

export const useConfigState = createStore<ConfigState>((set, get) => ({
  chartCount: 4,
  upperBound: 0,
  lowerBound: 0,
  useLevelConstants: false,
  useWeights: false,
  orderByAction: true,
  weights: {},
  forceDistribution: true,
  constrainPocketPicks: true,
  difficulties: new Set(),
  categories: new Set(),
  flags: new Set(),
  showPool: false,
  update: set,
}));
