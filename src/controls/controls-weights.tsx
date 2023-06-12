import shallow from 'zustand/shallow';
import styles from './controls-weights.css';
import { useMemo } from 'react';
import { useConfigState } from '../config-state';
import { useIntl } from '../hooks/useIntl';
import { NumericInput, Checkbox } from '@blueprintjs/core';
import { formatLevel, getAvailableLevels } from '../game-data-utils';
import { useDrawState } from '../draw-state';

interface Props {
  high: number;
  low: number;
}

export function WeightsControls({ high, low }: Props) {
  const { t } = useIntl();
  const gameData = useDrawState((s) => s.gameData);
  const { weights, forceDistribution, updateConfig } = useConfigState(
    (cfg) => ({
      weights: cfg.weights,
      forceDistribution: cfg.forceDistribution,
      updateConfig: cfg.update,
    }),
    shallow
  );
  const levels = useMemo(
    () =>
      getAvailableLevels(gameData).filter((lvl) => lvl >= low && lvl <= high),
    [high, low]
  );

  function toggleForceDistribution() {
    updateConfig((state) => ({
      forceDistribution: !state.forceDistribution,
    }));
  }

  function setWeight(level: number, value: number) {
    updateConfig((state) => {
      const newWeights = { ...state.weights };
      if (Number.isInteger(value)) {
        newWeights[level] = value;
      } else {
        delete newWeights[level];
      }
      return { weights: newWeights };
    });
  }

  const totalWeight = levels.reduce(
    (total, level) => total + (weights[level] || 0),
    0
  );
  const percentages = levels.map((level) => {
    const value = weights[level] || 0;
    return value ? ((100 * value) / totalWeight).toFixed(0) : 0;
  });

  return (
    <section className={styles.weights}>
      <p>{t('weights.explanation')}</p>
      {levels.map((level, i) => (
        <div className={styles.level} key={level}>
          <NumericInput
            width={2}
            name={`weight-${level}`}
            value={weights[level] || ''}
            min={0}
            onValueChange={(v) => setWeight(level, v)}
            placeholder="0"
            fill
          />
          {formatLevel(level)} <sub>{percentages[i]}%</sub>
        </div>
      ))}
      <Checkbox
        label={t('weights.check.label')}
        title={t('weights.check.title')}
        name="limitOutliers"
        checked={forceDistribution}
        onChange={toggleForceDistribution}
      />
    </section>
  );
}
