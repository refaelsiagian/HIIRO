import { SectionLevelDefinition } from '../../types/levels';
import {
  NORMAL_STAGES_PRESET,
  SHOTESTO_STAGES_PRESET,
  DAISHIKEN_STAGES_PRESET,
} from '../presets/stagePresets';

export const YOON_LEVEL_DEFINITIONS: SectionLevelDefinition = {
  id: 'yoon',
  displayName: 'Yōon',
  subtitleKanji: '拗音',
  groups: [
    // 1. K-Yōon (kya, kyu, kyo)
    {
      id: 'k-yoon',
      groupId: 'k-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 2. S-Yōon (sha, shu, sho)
    {
      id: 's-yoon',
      groupId: 's-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 3. T-Yōon (cha, chu, cho)
    {
      id: 't-yoon',
      groupId: 't-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 4. Shōtesuto 1 (Review K, S, T)
    {
      id: 'shotesto-yoon-1',
      displayName: 'Shōtesuto 1',
      subtitleKanji: '小テスト 1',
      includeGroups: ['k-yoon', 's-yoon', 't-yoon'],
      gameModes: SHOTESTO_STAGES_PRESET,
    },

    // 5. N-Yōon (nya, nyu, nyo)
    {
      id: 'n-yoon',
      groupId: 'n-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 6. H-Yōon (hya, hyu, hyo)
    {
      id: 'h-yoon',
      groupId: 'h-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 7. M-Yōon (mya, myu, myo)
    {
      id: 'm-yoon',
      groupId: 'm-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 8. Shōtesuto 2 (Review N, H, M)
    {
      id: 'shotesto-yoon-2',
      displayName: 'Shōtesuto 2',
      subtitleKanji: '小テスト 2',
      includeGroups: ['n-yoon', 'h-yoon', 'm-yoon'],
      gameModes: SHOTESTO_STAGES_PRESET,
    },

    // 9. R-Yōon (rya, ryu, ryo)
    {
      id: 'r-yoon',
      groupId: 'r-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 10. G-Yōon (gya, gyu, gyo)
    {
      id: 'g-yoon',
      groupId: 'g-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 11. J-Yōon (ja, ju, jo)
    {
      id: 'j-yoon',
      groupId: 'j-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 12. Shōtesuto 3 (Review R, G, J)
    {
      id: 'shotesto-yoon-3',
      displayName: 'Shōtesuto 3',
      subtitleKanji: '小テスト 3',
      includeGroups: ['r-yoon', 'g-yoon', 'j-yoon'],
      gameModes: SHOTESTO_STAGES_PRESET,
    },

    // 13. B-Yōon (bya, byu, byo)
    {
      id: 'b-yoon',
      groupId: 'b-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 14. P-Yōon (pya, pyu, pyo)
    {
      id: 'p-yoon',
      groupId: 'p-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 15. Daishiken Yōon (Comprehensive Final for Yōon)
    {
      id: 'daishiken-yoon',
      displayName: 'Daishiken',
      subtitleKanji: '大試験',
      includeSection: 'yoon',
      gameModes: DAISHIKEN_STAGES_PRESET,
    },
  ],
};

export default YOON_LEVEL_DEFINITIONS;
