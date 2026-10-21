import { SectionLevelDefinition } from '../../types/levels';
import {
  NORMAL_STAGES_PRESET,
  SHOTESTO_STAGES_PRESET,
  SHIKEN_STAGES_PRESET,
  DAISHIKEN_STAGES_PRESET,
} from '../presets/stagePresets';

export const DAKUON_LEVEL_DEFINITIONS: SectionLevelDefinition = {
  id: 'dakuon-handakuon',
  displayName: 'Dakuon & Handakuon',
  subtitleKanji: '濁音・半濁音',
  groups: [
    // 1. Ga-Gyō
    {
      id: 'g-gyo',
      tier: 'regular',
      groupId: 'g-gyo',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 2. Za-Gyō
    {
      id: 'z-gyo',
      tier: 'regular',
      groupId: 'z-gyo',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 3. Da-Gyō
    {
      id: 'd-gyo',
      tier: 'regular',
      groupId: 'd-gyo',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 4. Shōtesuto 1 (Review Ga, Za, Da)
    {
      id: 'shotesto-dakuon-1',
      tier: 'shotesto',
      displayName: 'Shōtesuto 1',
      subtitleKanji: '小テスト 1',
      includeGroups: ['g-gyo', 'z-gyo', 'd-gyo'],
      gameModes: SHOTESTO_STAGES_PRESET,
    },

    // 5. Ba-Gyō
    {
      id: 'b-gyo',
      tier: 'regular',
      groupId: 'b-gyo',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 6. Pa-Gyō
    {
      id: 'p-gyo',
      tier: 'regular',
      groupId: 'p-gyo',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 7. Shiken Dakuon & Handakuon (Cumulative: Gojuon + Dakuon)
    {
      id: 'shiken-dakuon-handakuon',
      tier: 'shiken',
      displayName: 'Shiken',
      subtitleKanji: '試験',
      includeSections: ['gojuon', 'dakuon-handakuon'],
      gameModes: SHIKEN_STAGES_PRESET,
    },
  ],
};

export default DAKUON_LEVEL_DEFINITIONS;
