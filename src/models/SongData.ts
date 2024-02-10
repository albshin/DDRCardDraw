/**
 * This file was automatically generated by json-schema-to-typescript. DO NOT MODIFY IT BY HAND.
 * Instead, modify `songs.schema.json` and run `yarn validate` to regenerate the SongData types
 * here as well as checking that the data files match.
 */

/**
 * List of all play styles available
 */
export type UniqueStringArr = string[];
/**
 * List of all special flags one might filter songs by
 */
export type UniqueStringArr1 = string[];
/**
 * An array of strings without any duplicate values
 */
export type UniqueStringArr2 = string[];

/**
 * Describes the shape of data that any individual json file under `src/songs` will conform to
 */
export interface GameData {
  $schema?: string;
  /**
   * Describes unique configuration options for this game
   */
  meta: {
    /**
     * If supplied, the parent folder name in the game select menu
     */
    menuParent?: string;
    /**
     * Unix timestamp of last update to this data file
     */
    lastUpdated: number;
    styles: UniqueStringArr;
    /**
     * List of all difficulty classes available
     */
    difficulties: {
      /**
       * A unique string key to identify this difficulty class
       */
      key: string;
      /**
       * A css color to use to visually define this difficulty class
       */
      color: string;
    }[];
    flags: UniqueStringArr1;
    usesDrawGroups?: boolean;
  };
  /**
   * Defines the default configuration for this game
   */
  defaults: {
    style: string;
    difficulties: UniqueStringArr2;
    flags: UniqueStringArr2;
    lowerLvlBound: number;
    upperLvlBound: number;
  };
  /**
   * Set of localized values for display of any styles, difficulties, or flags
   */
  i18n: {
    [k: string]: I18NDict;
  };
  songs: Song[];
}
/**
 * Dictionary of localized strings
 */
export interface I18NDict {
  [k: string]: string | I18NDictBranch;
}
export interface I18NDictBranch {
  [k: string]: string | I18NDictBranch;
}
export interface Song {
  flags?: UniqueStringArr2;
  name: string;
  artist: string;
  genre?: string;
  artist_translation?: string;
  bpm: string;
  name_translation?: string;
  search_hint?: string;
  date_added?: string;
  charts: Chart[];
  jacket: string;
  folder?: string;
  saHash?: string;
  saIndex?: string;
  remyLink?: string;
}
export interface Chart {
  flags?: UniqueStringArr2;
  /**
   * e.g. single/double
   */
  style: string;
  /**
   * e.g. expert/challenge
   */
  diffClass: string;
  /**
   * in-game numeric rating
   */
  lvl: number;
  /**
   * tournament-specific grouping of charts (e.g. tier)
   */
  drawGroup?: number;
  step?: number;
  shock?: number;
  freeze?: number;
  jacket?: string;
  author?: string;
  /**
   * per-chart BPM range, if one applies
   */
  bpm?: string;
}
