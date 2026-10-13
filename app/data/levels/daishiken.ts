import { SectionLevelDefinition } from '../../types/levels';
import { DAISHIKEN_STAGES_PRESET } from '../presets/stagePresets';

export const DAISHIKEN_SECTION_DEFINITION: SectionLevelDefinition = {
  id: 'daishiken',
  displayName: 'Daishiken',
  subtitleKanji: '大試験',
  groups: [
    {
      id: 'daishiken-final',
      displayName: 'Daishiken',
      subtitleKanji: '大試験',
      gameModes: DAISHIKEN_STAGES_PRESET,
    },
  ],
};

export default DAISHIKEN_SECTION_DEFINITION;
