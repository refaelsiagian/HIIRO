import { SectionLevelDefinition } from '../../types/levels';
import { GOJUON_LEVEL_DEFINITIONS } from './gojuon';
import { DAKUON_LEVEL_DEFINITIONS } from './dakuon';
import { YOON_LEVEL_DEFINITIONS } from './yoon';
import { TOKUSHUON_LEVEL_DEFINITIONS } from './tokushuon';

export {
  GOJUON_LEVEL_DEFINITIONS,
  DAKUON_LEVEL_DEFINITIONS,
  YOON_LEVEL_DEFINITIONS,
  TOKUSHUON_LEVEL_DEFINITIONS,
};

/**
 * Registry mapping section IDs to their level progression definitions.
 */
export const SECTIONS_CONFIG: Record<string, SectionLevelDefinition> = {
  gojuon: GOJUON_LEVEL_DEFINITIONS,
  'dakuon-handakuon': DAKUON_LEVEL_DEFINITIONS,
  yoon: YOON_LEVEL_DEFINITIONS,
  tokushuon: TOKUSHUON_LEVEL_DEFINITIONS,
};

export default SECTIONS_CONFIG;
