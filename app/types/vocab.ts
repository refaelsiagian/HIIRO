export type VocabCategory =
    | 'verb'
    | 'adjective'
    | 'noun'
    | 'adverb'
    | 'conjunction'
    | 'greeting';

export interface HiraganaVocabItem {
    id: string;
    kanji: string[];      // e.g. ['美', '容', '院'], ['食', 'べる'], ['今日']
    hiragana: string[];   // e.g. ['び', 'よう', 'いん'], ['た', 'べる'], ['きょう']
    meaning: string;      // e.g. 'Makan', 'Hari ini'
    category: VocabCategory;
}

export interface KatakanaVocabItem {
    id: string;
    word: string;         // e.g. 'コーヒー', 'パン', 'パーティー'
    katakana: string[];   // e.g. ['コ', 'ー', 'ヒ', 'ー'], ['パ', 'ン'], ['パ', 'ー', 'ティ', 'ー']
    origin: string;       // e.g. 'Coffee', 'Bread (Pão)', 'Party'
    meaning: string;      // e.g. 'Kopi', 'Roti', 'Pesta'
    category: VocabCategory;
}

// Alias for default VocabItem
export type VocabItem = HiraganaVocabItem;
