import { SectionLevelDefinition } from '../../types/levels';
import {
  NORMAL_STAGES_PRESET,
  SHOTESTO_STAGES_PRESET,
  DAISHIKEN_STAGES_PRESET,
} from '../presets/stagePresets';

export const GOJUON_LEVEL_DEFINITIONS: SectionLevelDefinition = {
  id: 'gojuon',
  displayName: 'Gojūon',
  subtitleKanji: '五十音',
  groups: [
    // 1. A-Gyō
    {
      id: 'a-gyo',
      groupId: 'a-gyo',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 2. Ka-Gyō
    {
      id: 'k-gyo',
      groupId: 'k-gyo',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 3. Sa-Gyō
    {
      id: 's-gyo',
      groupId: 's-gyo',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 4. Shōtesuto 1 (Review A, Ka, Sa)
    {
      id: 'shotesto-1',
      displayName: 'Shōtesuto 1',
      subtitleKanji: '小テスト 1',
      includeGroups: ['a-gyo', 'k-gyo', 's-gyo'],
      gameModes: SHOTESTO_STAGES_PRESET,
    },

    // 5. Ta-Gyō
    {
      id: 't-gyo',
      groupId: 't-gyo',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 6. Na-Gyō
    {
      id: 'n-gyo',
      groupId: 'n-gyo',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 7. Ha-Gyō
    {
      id: 'h-gyo',
      groupId: 'h-gyo',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 8. Shōtesuto 2 (Review Ta, Na, Ha)
    {
      id: 'shotesto-2',
      displayName: 'Shōtesuto 2',
      subtitleKanji: '小テスト 2',
      includeGroups: ['t-gyo', 'n-gyo', 'h-gyo'],
      gameModes: SHOTESTO_STAGES_PRESET,
    },

    // 9. Ma-Gyō
    {
      id: 'm-gyo',
      groupId: 'm-gyo',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 10. Ya-Gyō
    {
      id: 'y-gyo',
      groupId: 'y-gyo',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 11. Ra-Gyō
    {
      id: 'r-gyo',
      groupId: 'r-gyo',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 12. Shōtesuto 3 (Review Ma, Ya, Ra)
    {
      id: 'shotesto-3',
      displayName: 'Shōtesuto 3',
      subtitleKanji: '小テスト 3',
      includeGroups: ['m-gyo', 'y-gyo', 'r-gyo'],
      gameModes: SHOTESTO_STAGES_PRESET,
    },

    // 13. Wa-Gyō
    {
      id: 'w-gyo',
      groupId: 'w-gyo',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 14. N Akhiran
    {
      id: 'n-final',
      groupId: 'n-final',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 15. Daishiken Gojūon (Comprehensive Final for Gojuon)
    {
      id: 'daishiken-gojuon',
      displayName: 'Daishiken',
      subtitleKanji: '大試験',
      includeSection: 'gojuon',
      gameModes: DAISHIKEN_STAGES_PRESET,
    },
  ],
};

export default GOJUON_LEVEL_DEFINITIONS;
