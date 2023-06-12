import { FormattedMessage } from 'react-intl';
import { useMemo, useState } from 'react';
import { WeightsControls } from './controls-weights';
import styles from './controls.css';
import { useDrawState } from '../draw-state';
import { useConfigState } from '../config-state';
import { GameData } from '../models/SongData';
import { useIntl } from '../hooks/useIntl';
import {
  NumericInput,
  Checkbox,
  FormGroup,
  HTMLSelect,
  Drawer,
  Position,
  Button,
  ButtonGroup,
  Intent,
  Switch,
  NavbarDivider,
  DrawerSize,
  InputGroup,
} from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import { IconNames } from '@blueprintjs/icons';
import { useIsNarrow } from '../hooks/useMediaQuery';
import { EligibleChartsListFilter } from '../eligible-charts-list';
import shallow from 'zustand/shallow';
import { formatLevel } from '../game-data-utils';

function getAvailableDifficulties(gameData: GameData) {
  let s = new Set<string>();
  for (const f of gameData.songs) {
    for (const c of f.charts) {
      s.add(c.diffClass);
    }
  }
  return gameData.meta.difficulties.filter((d) => s.has(d.key));
}

function getAvailableCategories(gameData: GameData) {
  let s = new Set<string>();
  for (const f of gameData.songs) {
    s.add(f.category);
  }
  return gameData.meta.categories.filter((category) => s.has(category));
}

function getAvailableLevels(gameData: GameData) {
  let s = new Set<number>();
  for (const f of gameData.songs) {
    for (const c of f.charts) {
      s.add(c.lvl);
    }
  }
  return [...s].sort((a, b) => a - b);
}

function ShowChartsToggle({ inDrawer }: { inDrawer: boolean }) {
  const { t } = useIntl();
  const { showPool, update } = useConfigState(
    (state) => ({
      showPool: state.showPool,
      update: state.update,
    }),
    shallow
  );
  return (
    <Switch
      alignIndicator={inDrawer ? 'left' : 'right'}
      large
      className={styles.showAllToggle}
      label={t('showSongPool')}
      checked={showPool}
      onChange={(e) => {
        const showPool = !!e.currentTarget.checked;
        update({
          showPool,
        });
      }}
    />
  );
}

export function HeaderControls() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lastDrawFailed, setLastDrawFailed] = useState(false);
  const [drawSongs, hasGameData] = useDrawState((s) => [
    s.drawSongs,
    !!s.gameData,
  ]);
  const isNarrow = useIsNarrow();

  function handleDraw() {
    useConfigState.setState({ showPool: false });
    const couldDraw = drawSongs(useConfigState.getState());
    if (couldDraw !== !lastDrawFailed) {
      setLastDrawFailed(!couldDraw);
    }
  }

  function openSettings() {
    setSettingsOpen((open) => !open);
    setLastDrawFailed(false);
  }

  return (
    <>
      <Drawer
        isOpen={settingsOpen}
        position={Position.RIGHT}
        size={isNarrow ? DrawerSize.LARGE : '500px'}
        onClose={() => setSettingsOpen(false)}
        title={
          <FormattedMessage
            id="settings.title"
            defaultMessage="Card Draw Options"
          />
        }
      >
        <Controls />
      </Drawer>
      {!isNarrow && (
        <>
          <ShowChartsToggle inDrawer={false} />
          <NavbarDivider />
        </>
      )}
      <ButtonGroup>
        <Tooltip2 disabled={hasGameData} content="Loading game data">
          <Button
            onClick={handleDraw}
            icon={IconNames.NEW_LAYERS}
            intent={Intent.PRIMARY}
            disabled={!hasGameData}
          >
            <FormattedMessage id="draw" defaultMessage="Draw!" />
          </Button>
        </Tooltip2>
        <Tooltip2
          isOpen={lastDrawFailed}
          content={<FormattedMessage id="controls.invalid" />}
          intent={Intent.DANGER}
          usePortal={false}
          position={Position.BOTTOM_RIGHT}
        >
          <Button icon={IconNames.COG} onClick={openSettings} />
        </Tooltip2>
      </ButtonGroup>
    </>
  );
}

function Controls() {
  const { t } = useIntl();
  const [dataSetName, gameData] = useDrawState(
    (s) => [s.dataSetName, s.gameData],
    shallow
  );
  const configState = useConfigState();
  const {
    useLevelConstants,
    useWeights,
    constrainPocketPicks,
    orderByAction,
    lowerBound,
    upperBound,
    update: updateState,
    difficulties: selectedDifficulties,
    categories: selectedCategories,
    flags: selectedFlags,
    chartCount,
  } = configState;
  const [availableDifficulties, availableCategories] = useMemo(() => {
    if (!gameData) {
      return [[], []];
    }
    return [
      getAvailableDifficulties(gameData),
      getAvailableCategories(gameData),
    ];
  }, [gameData]);
  const isNarrow = useIsNarrow();

  if (!gameData) {
    return null;
  }
  const { flags, lvlMax } = gameData.meta;

  const handleLowerBoundChange = (newLow: number) => {
    if (newLow !== lowerBound && !isNaN(newLow)) {
      if (newLow > upperBound) {
        newLow = upperBound;
      }
      updateState({
        lowerBound: newLow,
      });
    }
  };
  const handleUpperBoundChange = (newHigh: number) => {
    if (newHigh !== upperBound && !isNaN(newHigh)) {
      updateState({
        upperBound: newHigh,
      });
    }
  };

  return (
    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
      {isNarrow && (
        <>
          <FormGroup>
            <ShowChartsToggle inDrawer />
          </FormGroup>
          {!!configState.flags.size && (
            <FormGroup label="Show only">
              <EligibleChartsListFilter />
            </FormGroup>
          )}
          <hr />
        </>
      )}
      <div className={isNarrow ? undefined : styles.inlineControls}>
        <FormGroup
          label={t('chartCount')}
          contentClassName={styles.narrowInput}
        >
          <NumericInput
            large
            fill
            value={chartCount}
            min={1}
            clampValueOnBlur
            onValueChange={(chartCount) => {
              if (!isNaN(chartCount)) {
                updateState((s) => {
                  return { ...s, chartCount };
                });
              }
            }}
          />
        </FormGroup>
        <div className={styles.inlineControls}>
          {!useLevelConstants ? (
            <>
              <FormGroup label="Lvl Min" contentClassName={styles.narrowInput}>
                <HTMLSelect
                  id="lvlMin"
                  large
                  fill
                  value={lowerBound}
                  onChange={(e) => {
                    handleLowerBoundChange(Number(e.target.value));
                  }}
                >
                  {getAvailableLevels(gameData).map((level) => (
                    <option key={level} value={level}>
                      {formatLevel(level)}
                    </option>
                  ))}
                </HTMLSelect>
              </FormGroup>
              <FormGroup label="Lvl Max" contentClassName={styles.narrowInput}>
                <HTMLSelect
                  id="lvlMax"
                  large
                  fill
                  value={upperBound}
                  onChange={(e) => {
                    handleUpperBoundChange(Number(e.target.value));
                  }}
                >
                  {getAvailableLevels(gameData).map((level) => (
                    <option key={level} value={level}>
                      {formatLevel(level)}
                    </option>
                  ))}
                </HTMLSelect>
              </FormGroup>
            </>
          ) : (
            <>
              <div className={styles.inlineControls}>
                <FormGroup
                  label="Lvl Constant Min"
                  contentClassName={styles.narrowInput}
                >
                  <NumericInput
                    id="levelConstantMin"
                    allowNumericCharactersOnly={false}
                    stepSize={0.1}
                    large
                    fill
                    value={lowerBound}
                    onValueChange={(e) => {
                      handleLowerBoundChange(e);
                    }}
                  />
                </FormGroup>
                <FormGroup
                  label="Lvl Constant Max"
                  contentClassName={styles.narrowInput}
                >
                  <NumericInput
                    id="levelConstantMax"
                    allowNumericCharactersOnly={false}
                    stepSize={0.1}
                    large
                    fill
                    value={upperBound}
                    onValueChange={(e) => {
                      handleUpperBoundChange(e);
                    }}
                  />
                </FormGroup>
              </div>
            </>
          )}
        </div>
      </div>

      <FormGroup label={t('difficulties')}>
        {availableDifficulties.map((dif) => (
          <Checkbox
            key={`${dif.key}`}
            name="difficulties"
            value={dif.key}
            checked={selectedDifficulties.has(dif.key)}
            onChange={(e) => {
              const { checked, value } = e.currentTarget;
              updateState((s) => {
                const difficulties = new Set(s.difficulties);
                if (checked) {
                  difficulties.add(value);
                } else {
                  difficulties.delete(value);
                }
                return { difficulties };
              });
            }}
            label={t('meta.' + dif.key)}
          />
        ))}
      </FormGroup>
      <FormGroup label={t('categories')}>
        {availableCategories.map((category) => (
          <Checkbox
            key={`${category}`}
            name="categories"
            value={category}
            checked={selectedCategories.has(category)}
            onChange={(e) => {
              const { checked, value } = e.currentTarget;
              updateState((s) => {
                const categories = new Set(s.categories);
                if (checked) {
                  categories.add(value);
                } else {
                  categories.delete(value);
                }
                return { categories };
              });
            }}
            label={t('meta.' + category)}
          />
        ))}
      </FormGroup>
      {!!flags.length && (
        <FormGroup label={t('include')}>
          {flags.map((key) => (
            <Checkbox
              key={`${dataSetName}:${key}`}
              label={t('meta.' + key)}
              value={key}
              checked={selectedFlags.has(key)}
              onChange={() =>
                updateState((s) => {
                  const newFlags = new Set(s.flags);
                  if (newFlags.has(key)) {
                    newFlags.delete(key);
                  } else {
                    newFlags.add(key);
                  }
                  return { flags: newFlags };
                })
              }
            />
          ))}
        </FormGroup>
      )}
      <FormGroup>
        <Checkbox
          id="orderByAction"
          checked={orderByAction}
          onChange={(e) => {
            const reorder = !!e.currentTarget.checked;
            updateState({ orderByAction: reorder });
          }}
          label={t('orderByAction')}
        />
        <Checkbox
          id="constrainPocketPicks"
          checked={constrainPocketPicks}
          onChange={(e) => {
            const constrainPocketPicks = !!e.currentTarget.checked;
            updateState({ constrainPocketPicks });
          }}
          label={t('constrainPocketPicks')}
        />
        <Checkbox
          id="weighted"
          checked={useWeights}
          onChange={(e) => {
            const useWeights = !!e.currentTarget.checked;
            updateState({ useWeights });
          }}
          label={t('useWeightedDistributions')}
        />
        {/*<Checkbox
          id="useLevelConstants"
          checked={useLevelConstants}
          onChange={(e) => {
            const useLevelConstants = !!e.currentTarget.checked;
            updateState({ useLevelConstants });
          }}
          label="Use Level Constants"
        />
        */}
        {useWeights && <WeightsControls high={upperBound} low={lowerBound} />}
      </FormGroup>
    </form>
  );
}
