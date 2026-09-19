export interface CharItem {
  k: string; // kana
  r: string; // romaji
}

export interface GroupData {
  id: string;
  title: string; // For backward compatibility in drills
  display_name: string;
  subtitle_kanji: string;
  chars: CharItem[];
}

export interface TypeData {
  id: string;
  display_name: string;
  subtitle_hiragana: string;
  subtitle_katakana: string;
  subtitle_kanji: string;
  groups: GroupData[];
}

export interface KanaMetadata {
  [category: string]: TypeData[];
}

// Raw JSON Types
export interface RawChar {
  char: string;
  category: string;
  romaji: string;
  consonant: string;
  vowel: string;
  confusable_with: string[];
  group: string;
}

export interface RawGroup {
  id: string;
  category: string;
  display_name: string;
  subtitle_kanji: string;
  char_member: string[];
  type: string;
}

export interface RawType {
  id: string;
  category: string;
  display_name: string;
  subtitle_hiragana: string;
  subtitle_katakana: string;
  subtitle_kanji: string;
  group_member: string[];
}