import { HTMLSelect, Spinner, SpinnerSize } from '@blueprintjs/core';
import { ReactNode, useEffect, useState } from 'react';
import { useDrawState } from './draw-state';
import { useDataSets } from './hooks/useDataSets';
import styles from './app.css';

export function VersionSelect() {
  const { current, available, loadData } = useDataSets();
  return (
    <HTMLSelect
      className={styles.versionSelect}
      value={current.name}
      onChange={(e) => loadData(e.currentTarget.value)}
    >
      {available.map((d) => (
        <option value={d.name} key={d.name}>
          {d.display}
        </option>
      ))}
    </HTMLSelect>
  );
}

export function DataLoadingSpinner() {
  const dataIsLoading = useDrawState((s) => !s.gameData);
  if (!dataIsLoading) {
    return null;
  }
  return (
    <DelayRender>
      <Spinner size={SpinnerSize.SMALL} /> Loading game...
    </DelayRender>
  );
}

interface DelayProps {
  children: ReactNode;
}

function DelayRender(props: DelayProps) {
  const [display, setDisplay] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setDisplay(true);
    }, 200);
  }, []);
  if (display) {
    return <>{props.children}</>;
  }
  return null;
}
