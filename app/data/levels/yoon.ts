import { SectionLevelDefinition } from '../../types/levels';
import {
  NORMAL_STAGES_PRESET,
  SHOTESTO_STAGES_PRESET,
  SHIKEN_STAGES_PRESET,
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
      tier: 'regular',
      groupId: 'k-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 2. S-Yōon (sha, shu, sho)
    {
      id: 's-yoon',
      tier: 'regular',
      groupId: 's-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 3. T-Yōon (cha, chu, cho)
    {
      id: 't-yoon',
      tier: 'regular',
      groupId: 't-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 4. Shōtesuto 1 (Review K, S, T)
    {
      id: 'shotesto-yoon-1',
      tier: 'shotesto',
      displayName: 'Shōtesuto 1',
      subtitleKanji: '小テスト 1',
      includeGroups: ['k-yoon', 's-yoon', 't-yoon'],
      gameModes: SHOTESTO_STAGES_PRESET,
    },

    // 5. N-Yōon (nya, nyu, nyo)
    {
      id: 'n-yoon',
      tier: 'regular',
      groupId: 'n-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 6. H-Yōon (hya, hyu, hyo)
    {
      id: 'h-yoon',
      tier: 'regular',
      groupId: 'h-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 7. M-Yōon (mya, myu, myo)
    {
      id: 'm-yoon',
      tier: 'regular',
      groupId: 'm-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 8. Shōtesuto 2 (Review N, H, M)
    {
      id: 'shotesto-yoon-2',
      tier: 'shotesto',
      displayName: 'Shōtesuto 2',
      subtitleKanji: '小テスト 2',
      includeGroups: ['n-yoon', 'h-yoon', 'm-yoon'],
      gameModes: SHOTESTO_STAGES_PRESET,
    },

    // 9. R-Yōon (rya, ryu, ryo)
    {
      id: 'r-yoon',
      tier: 'regular',
      groupId: 'r-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 10. G-Yōon (gya, gyu, gyo)
    {
      id: 'g-yoon',
      tier: 'regular',
      groupId: 'g-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 11. J-Yōon (ja, ju, jo)
    {
      id: 'j-yoon',
      tier: 'regular',
      groupId: 'j-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 12. Shōtesuto 3 (Review R, G, J)
    {
      id: 'shotesto-yoon-3',
      tier: 'shotesto',
      displayName: 'Shōtesuto 3',
      subtitleKanji: '小テスト 3',
      includeGroups: ['r-yoon', 'g-yoon', 'j-yoon'],
      gameModes: SHOTESTO_STAGES_PRESET,
    },

    // 13. B-Yōon (bya, byu, byo)
    {
      id: 'b-yoon',
      tier: 'regular',
      groupId: 'b-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 14. P-Yōon (pya, pyu, pyo)
    {
      id: 'p-yoon',
      tier: 'regular',
      groupId: 'p-yoon',
      gameModes: NORMAL_STAGES_PRESET,
    },

    // 15. Shiken Yōon (Cumulative: Gojuon + Dakuon + Yōon)
    {
      id: 'shiken-yoon',
      tier: 'shiken',
      displayName: 'Shiken',
      subtitleKanji: '試験',
      includeSections: ['gojuon', 'dakuon-handakuon', 'yoon'],
      gameModes: SHIKEN_STAGES_PRESET,
    },
  ],
};

export default YOON_LEVEL_DEFINITIONS;
