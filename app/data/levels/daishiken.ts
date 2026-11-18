import { SectionLevelDefinition } from '../../types/levels';
import { HONSHIKEN_STAGES_PRESET, MUGEN_STAGES_PRESET } from '../presets/stagePresets';

export const DAISHIKEN_SECTION_DEFINITION: SectionLevelDefinition = {
  id: 'daishiken',
  displayName: 'Daishiken',
  subtitleKanji: '大試験',
  groups: [
    {
      id: 'daishiken-honshiken',
      tier: 'daishiken',
      displayName: 'Honshiken',
      subtitleKanji: '本試験',
      requiredStars: 0,
      gameModes: HONSHIKEN_STAGES_PRESET,
    },
    {
      id: 'daishiken-mugen',
      tier: 'daishiken',
      displayName: 'Mugen',
      subtitleKanji: '無限',
      requiredStars: 0,
      gameModes: MUGEN_STAGES_PRESET,
    },
  ],
};

export default DAISHIKEN_SECTION_DEFINITION;
