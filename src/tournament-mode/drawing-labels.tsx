import { useCallback } from "react";
import { useDrawState } from "../draw-state";
import { useDrawing } from "../drawing-context";
import styles from "./drawing-labels.css";

import { RoundSelect, AutoCompleteSelect } from "./round-select";
import { useConfigState } from "../config-state";

export function SetLabels() {
  const tournamentMode = useDrawState((s) => s.tournamentMode);
  if (!tournamentMode) {
    return null;
  }

  return (
    <div className={styles.headers}>
      <div className={styles.title}>
        <RoundSelect />
      </div>
      <div className={styles.versus}>vs</div>
      <div className={styles.players}>
        <PlayerLabel placeholder="Player 1" field="player1" />
        <PlayerLabel placeholder="Player 2" field="player2" />
      </div>
    </div>
  );
}

function PlayerLabel({
  field,
  placeholder,
}: {
  field: "title" | "player1" | "player2";
  placeholder: string;
}) {
  const updateDrawing = useDrawing((s) => s.updateDrawing);
  const value = useDrawing((s) => s[field] || null);
  const playerNames = useConfigState((s) => s.playerNames);
  const updateConfig = useConfigState((s) => s.update);
  const handleChange = useCallback(
    (value: string) => {
      updateDrawing({ [field]: value });
      if (!playerNames.includes(value)) {
        updateConfig((prev) => {
          const nextNames = prev.playerNames.slice();
          nextNames.push(value);
          return { playerNames: nextNames };
        });
      }
    },
    [updateDrawing, field, playerNames, updateConfig]
  );
  return (
    <AutoCompleteSelect
      value={value}
      itemList={playerNames}
      placeholder={placeholder}
      onSelect={handleChange}
      size="large"
    />
  );
}
