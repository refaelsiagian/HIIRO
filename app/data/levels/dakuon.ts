import { SectionLevelDefinition } from '../../types/levels';
import {
  NORMAL_STAGES_PRESET,
  SHOTESTO_STAGES_PRESET,
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
      groupId: 'g-gyo',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 2. Za-Gyō
    {
      id: 'z-gyo',
      groupId: 'z-gyo',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 3. Da-Gyō
    {
      id: 'd-gyo',
      groupId: 'd-gyo',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 4. Shōtesuto 1 (Review Ga, Za, Da)
    {
      id: 'shotesto-dakuon-1',
      displayName: 'Shōtesuto 1',
      subtitleKanji: '小テスト 1',
      includeGroups: ['g-gyo', 'z-gyo', 'd-gyo'],
      gameModes: SHOTESTO_STAGES_PRESET,
    },

    // 5. Ba-Gyō
    {
      id: 'b-gyo',
      groupId: 'b-gyo',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 6. Pa-Gyō
    {
      id: 'p-gyo',
      groupId: 'p-gyo',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 7. Daishiken Dakuon & Handakuon (Comprehensive Final)
    {
      id: 'daishiken-dakuon-handakuon',
      displayName: 'Daishiken',
      subtitleKanji: '大試験',
      includeSection: 'dakuon-handakuon',
      gameModes: DAISHIKEN_STAGES_PRESET,
    },
  ],
};

export default DAKUON_LEVEL_DEFINITIONS;
