import { SectionLevelDefinition } from '../../types/levels';
import {
  NORMAL_STAGES_PRESET,
  SHOTESTO_STAGES_PRESET,
  DAISHIKEN_STAGES_PRESET,
} from '../presets/stagePresets';

export const TOKUSHUON_LEVEL_DEFINITIONS: SectionLevelDefinition = {
  id: 'tokushuon',
  displayName: 'Tokushuon',
  subtitleKanji: '特殊音',
  groups: [
    // 1. V-Series (va, vi, vu, ve, vo)
    {
      id: 'v-special',
      groupId: 'v-special',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 2. F-Series (fa, fi, fe, fo)
    {
      id: 'f-special',
      groupId: 'f-special',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 3. Di/Ti (ti, di)
    {
      id: 't-special',
      groupId: 't-special',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 4. Shōtesuto 1 (Review V, F, Di/Ti)
    {
      id: 'shotesto-tokushuon-1',
      displayName: 'Shōtesuto 1',
      subtitleKanji: '小テスト 1',
      includeGroups: ['v-special', 'f-special', 't-special'],
      gameModes: SHOTESTO_STAGES_PRESET,
    },

    // 5. Wi/We/Wo (wi, we, wo)
    {
      id: 'w-special',
      groupId: 'w-special',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 6. Daishiken Tokushuon (Comprehensive Final for Tokushuon)
    {
      id: 'daishiken-tokushuon',
      displayName: 'Daishiken',
      subtitleKanji: '大試験',
      includeSection: 'tokushuon',
      gameModes: DAISHIKEN_STAGES_PRESET,
    },
  ],
};

export default TOKUSHUON_LEVEL_DEFINITIONS;
