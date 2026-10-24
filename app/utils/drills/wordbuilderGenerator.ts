import charsDataRaw from '../../data/chars.json';
import hiraganaVocabRaw from '../../data/vocab/hiragana.json';
import katakanaVocabRaw from '../../data/vocab/katakana.json';
import { RawChar } from '../../types/kana';
import { HiraganaVocabItem, KatakanaVocabItem } from '../../types/vocab';

export interface SlotInfo {
    char: string;       // Expected kana character, e.g. "た", "きょ", "ー"
    romaji: string;     // Romaji hint displayed above the slot, e.g. "ta", "kyo", "-"
}

export interface TargetWord {
    id: string;
    word: string;          // Full word string e.g. "食べる", "今日", "コーヒー"
    kanjiDisplay?: string; // Kanji representation if available
    meaning: string;       // Indonesian meaning e.g. "Makan", "Hari ini", "Kopi"
    origin?: string;       // Loanword origin e.g. "Coffee" (for Katakana)
    category: string;      // "verb", "noun", "adjective", etc.
    slots: SlotInfo[];     // Array of kana slots and their romaji hints
}

export interface GridTile {
    id: number;            // Unique tile index 0..35
    char: string;          // The kana character displayed on the tile
    isUsed: boolean;       // True when clicked & matched, disappears from grid
    row: number;           // 0..3 (for 4 rows)
    col: number;           // 0..8 (for 9 columns)
}

export interface WordbuilderGameState {
    words: TargetWord[];
    initialTiles: GridTile[];
    reserveQueue: string[]; // Letters remaining to refill into cleared spots (e.g. 64 letters)
    totalLetters: number;   // 100
}

// 1. Build Romaji Lookup Map from chars.json
const charsData: RawChar[] = charsDataRaw as RawChar[];
const romajiMap = new Map<string, string>();
charsData.forEach(c => {
    romajiMap.set(c.char, c.romaji);
});

// Special symbol mappings
romajiMap.set('っ', '·');
romajiMap.set('ッ', '·');
romajiMap.set('ー', '-');

/**
 * Tokenize Hiragana string chunks into kana units matching chars.json (e.g. Yoon combined).
 */
function tokenizeHiragana(chunks: string[]): SlotInfo[] {
    const full = chunks.join('');
    const slots: SlotInfo[] = [];
    let i = 0;
    while (i < full.length) {
        // Check 2-character Yoon first (e.g. きょ, しゃ, ちょ)
        if (i + 1 < full.length) {
            const two = full.substring(i, i + 2);
            if (romajiMap.has(two)) {
                slots.push({ char: two, romaji: romajiMap.get(two)! });
                i += 2;
                continue;
            }
        }
        const one = full[i];
        slots.push({ char: one, romaji: romajiMap.get(one) || '?' });
        i++;
    }
    return slots;
}

/**
 * Fisher-Yates array shuffle.
 */
function shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

/**
 * Generate a full Wordbuilder game state for 4x9 grid:
 * - Selects words whose total kana letters sum to EXACTLY targetTotalLetters (e.g. scoreGoal = 50 or 100).
 * - Seeds the 4x9 grid (up to 36 tiles) from the initial words.
 * - Keeps the remaining letters in reserveQueue for refill.
 */
export function generateWordbuilderGame(
    category: 'hiragana' | 'katakana' = 'hiragana',
    targetTotalLetters: number = 100
): WordbuilderGameState {
    const isKatakana = category === 'katakana';
    const vocabList: (HiraganaVocabItem | KatakanaVocabItem)[] = isKatakana
        ? (katakanaVocabRaw as KatakanaVocabItem[])
        : (hiraganaVocabRaw as HiraganaVocabItem[]);

    // Pre-process and validate vocab items
    const processedWords: (TargetWord & { length: number })[] = [];

    vocabList.forEach(item => {
        let slots: SlotInfo[] = [];
        let wordStr = '';
        let kanjiDisplay = '';
        let origin: string | undefined = undefined;

        if (isKatakana) {
            const kItem = item as KatakanaVocabItem;
            wordStr = kItem.word;
            origin = kItem.origin;
            slots = kItem.katakana.map(k => ({
                char: k,
                romaji: romajiMap.get(k) || '?'
            }));
        } else {
            const hItem = item as HiraganaVocabItem;
            wordStr = hItem.kanji.join('');
            kanjiDisplay = hItem.kanji.join('');
            slots = tokenizeHiragana(hItem.hiragana);
        }

        // Avoid words with unmapped chars or extremes (< 2 or > 6 letters)
        if (slots.length >= 2 && slots.length <= 6 && !slots.some(s => s.romaji === '?')) {
            processedWords.push({
                id: item.id,
                word: wordStr,
                kanjiDisplay: kanjiDisplay || undefined,
                meaning: item.meaning,
                origin,
                category: item.category,
                slots,
                length: slots.length
            });
        }
    });

    // Exact subset sum to targetTotalLetters
    let selectedWords: TargetWord[] = [];
    const maxAttempts = 150;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const shuffled = shuffle(processedWords);
        let sum = 0;
        const candidateWords: TargetWord[] = [];

        for (const w of shuffled) {
            if (sum + w.length <= targetTotalLetters) {
                candidateWords.push(w);
                sum += w.length;
                if (sum === targetTotalLetters) {
                    selectedWords = candidateWords;
                    break;
                }
            }
        }

        if (selectedWords.length > 0) break;
    }

    // Safety fallback
    if (selectedWords.length === 0) {
        let sum = 0;
        for (const w of processedWords) {
            if (sum + w.length <= targetTotalLetters) {
                selectedWords.push(w);
                sum += w.length;
            }
        }
    }

    // Collect all letters (total = targetTotalLetters) in word order
    const allLetters: string[] = [];
    selectedWords.forEach(w => {
        w.slots.forEach(s => allLetters.push(s.char));
    });

    // Initial tiles on board (up to 36 tiles across 4x9, shuffled)
    const initialCount = Math.min(36, allLetters.length);
    const initialTilesList = shuffle(allLetters.slice(0, initialCount));
    const reserveQueue = allLetters.slice(initialCount);

    const initialTiles: GridTile[] = initialTilesList.map((char, index) => ({
        id: index,
        char,
        isUsed: false,
        row: Math.floor(index / 9), // 0 to 3
        col: index % 9              // 0 to 8
    }));

    return {
        words: selectedWords,
        initialTiles,
        reserveQueue,
        totalLetters: allLetters.length
    };
}

/**
 * Get the next letter to refill an empty slot on the board.
 * Prioritizes any letter needed for the current target word that is currently missing from the board.
 */
export function getNextRefillLetter(
    currentWord: TargetWord,
    activeBoardChars: string[],
    reserveQueue: string[]
): { letter: string; updatedReserve: string[] } | null {
    if (reserveQueue.length === 0) return null;

    // 1. Anti-deadlock: prioritize letters needed for the current word that aren't on the board
    for (const slot of currentWord.slots) {
        if (!activeBoardChars.includes(slot.char)) {
            const idx = reserveQueue.indexOf(slot.char);
            if (idx !== -1) {
                const updatedReserve = [...reserveQueue];
                const [letter] = updatedReserve.splice(idx, 1);
                return { letter, updatedReserve };
            }
        }
    }

    // 2. Otherwise take front of the reserve queue
    const updatedReserve = [...reserveQueue];
    const letter = updatedReserve.shift()!;
    return { letter, updatedReserve };
}
