import { SectionLevelDefinition } from '../../types/levels';
import {
  NORMAL_STAGES_PRESET,
  SHOTESTO_STAGES_PRESET,
  SHIKEN_STAGES_PRESET,
} from '../presets/stagePresets';

export const GAIRAION_LEVEL_DEFINITIONS: SectionLevelDefinition = {
  id: 'gairaion',
  displayName: 'Gairaion',
  subtitleKanji: '外来音',
  groups: [
    // 1. V-Series (va, vi, vu, ve, vo)
    {
      id: 'v-special',
      tier: 'regular',
      groupId: 'v-special',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 2. F-Series (fa, fi, fe, fo)
    {
      id: 'f-special',
      tier: 'regular',
      groupId: 'f-special',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 3. T & W-Series (ti, di, wi, we, wo)
    {
      id: 'tw-special',
      tier: 'regular',
      groupId: 'tw-special',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 4. Shōtesuto 1 (Review V, F, T & W)
    {
      id: 'shotesto-gairaion-1',
      tier: 'shotesto',
      displayName: 'Shōtesuto 1',
      subtitleKanji: '小テスト 1',
      includeGroups: ['v-special', 'f-special', 'tw-special'],
      gameModes: SHOTESTO_STAGES_PRESET,
    },

    // 5. Shiken Gairaion (Cumulative: All Katakana through Gairaion)
    {
      id: 'shiken-gairaion',
      tier: 'shiken',
      displayName: 'Shiken',
      subtitleKanji: '試験',
      includeSections: ['gojuon', 'dakuon-handakuon', 'yoon', 'gairaion'],
      gameModes: SHIKEN_STAGES_PRESET,
    },
  ],
};

export default GAIRAION_LEVEL_DEFINITIONS;

