export type DrillType =
  | 'true-false'
  | 'true-false-multi'
  | 'sequence'
  | 'sequence-2'
  | 'find-fill'
  | 'check-truth'
  | 'fill-trace'
  | 'flip-it'
  | 'quick-glance';

export interface StageConfig {
  id: string;
  displayName: string;
  subtitle?: string;
  instruction: string;
  timer: number;       // in seconds
  scoreGoal: number;
  filepath: string;
  drillType: DrillType;
  options?: Record<string, any>;
}

export interface GroupLevelDefinition {
  id: string;
  groupId?: string;             // References a single group id from groups.json (e.g. 'a-gyo')
  includeGroups?: string[];     // References multiple group ids (for review / Shotesto)
  includeSection?: string;      // References a whole section id from types.json (for Daishiken)
  displayName?: string;         // Optional override; defaults to groups.json display_name
  subtitleKanji?: string;       // Optional override; defaults to groups.json subtitle_kanji
  gameModes: StageConfig[];
}

export interface SectionLevelDefinition {
  id: string;
  displayName: string;
  subtitleKanji: string;
  groups: GroupLevelDefinition[];
}

export interface ResolvedChar {
  k: string;                    // Kana character (e.g. 'あ' or 'ア')
  r: string;                    // Romaji (e.g. 'a')
  category: 'hiragana' | 'katakana';
  consonant: string;
  vowel: string;
  confusableWith: string[];     // Confusable characters (for smart distractors)
  groupId: string;
}

export interface ResolvedGroupLevel {
  id: string;
  displayName: string;
  subtitleKanji: string;
  chars: ResolvedChar[];        // Full character objects with metadata
  letters: string[];            // Convenient romaji array (e.g. ['a', 'i', 'u', 'e', 'o'])
  gameModes: StageConfig[];
}

export interface ResolvedSectionLevel {
  id: string;
  displayName: string;
  subtitleKanji: string;
  groups: ResolvedGroupLevel[];
}
