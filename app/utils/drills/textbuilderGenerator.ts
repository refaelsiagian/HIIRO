import textbuilderDataRaw from '../../data/drills/textbuilderData.json';
import charsRaw from '../../data/chars.json';

export interface TextbuilderWordPill {
    id: string;
    text: string;
    isTargetToken: boolean;
}

export interface TextbuilderSentence {
    id: number;
    kana: string;
    romaji: string;
    meaning: string;
    tokens: string[];
}

export interface TextbuilderStory {
    id: string;
    title: string;
    fullMeaning: string;
    sentences: TextbuilderSentence[];
}

interface RawSentence {
    id: number;
    hiragana: string;
    katakana: string;
    romaji: string;
    meaning: string;
}

interface RawStory {
    id: string;
    title: string;
    fullMeaning: string;
    sentences: RawSentence[];
}

interface CharEntry {
    char: string;
    category: string;
    confusable_with?: string[];
}

// Build quick lookup map: char -> confusable_with[]
const confusableMap = new Map<string, string[]>();
(charsRaw as CharEntry[]).forEach(c => {
    if (c.char && c.confusable_with && c.confusable_with.length > 0) {
        confusableMap.set(c.char, c.confusable_with);
    }
});

function shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export function mutateWordWithConfusable(word: string): string | null {
    const chars = word.split('');
    const validIndices: number[] = [];
    chars.forEach((ch, idx) => {
        if (confusableMap.has(ch) && (confusableMap.get(ch)?.length ?? 0) > 0) {
            validIndices.push(idx);
        }
    });

    if (validIndices.length === 0) return null;

    const chosenIdx = validIndices[Math.floor(Math.random() * validIndices.length)];
    const confList = confusableMap.get(chars[chosenIdx]);
    if (!confList || confList.length === 0) return null;

    const rep = confList[Math.floor(Math.random() * confList.length)];
    chars[chosenIdx] = rep;
    const result = chars.join('');
    return result !== word ? result : null;
}

/**
 * Generates an 8-sentence Textbuilder story session.
 */
export function generateTextbuilderStory(
    category: 'hiragana' | 'katakana' = 'hiragana',
    storyIndex?: number
): TextbuilderStory {
    const stories = (textbuilderDataRaw as { stories: RawStory[] }).stories;
    const selectedStory = (typeof storyIndex === 'number' && stories[storyIndex])
        ? stories[storyIndex]
        : stories[Math.floor(Math.random() * stories.length)];

    const sentences: TextbuilderSentence[] = selectedStory.sentences.map((s, idx) => {
        const rawKana = category === 'katakana' ? s.katakana : s.hiragana;
        // Strip trailing '。' for the token pills
        const tokens = rawKana.replace(/。$/, '').split(' ').filter(Boolean);

        return {
            id: s.id || (idx + 1),
            kana: rawKana,
            romaji: s.romaji,
            meaning: s.meaning,
            tokens,
        };
    });

    return {
        id: selectedStory.id,
        title: selectedStory.title,
        fullMeaning: selectedStory.fullMeaning,
        sentences,
    };
}

/**
 * Generates the word pills for a target sentence:
 * 1. Correct tokens of the target sentence
 * 2. Confusable character distractors from the target tokens
 * 3. Additional tokens borrowed from other sentences in the story
 * Returns shuffled pills with unique IDs.
 */
export function generateRoundPills(
    targetSentence: TextbuilderSentence,
    allSentences: TextbuilderSentence[]
): TextbuilderWordPill[] {
    const pills: TextbuilderWordPill[] = [];
    const usedTexts = new Set<string>();

    // 1. Correct tokens
    targetSentence.tokens.forEach((token, idx) => {
        pills.push({
            id: `target_${targetSentence.id}_${idx}_${token}`,
            text: token,
            isTargetToken: true,
        });
        usedTexts.add(token);
    });

    // 2. Confusable distractors from target tokens
    const confusableCandidates: string[] = [];
    targetSentence.tokens.forEach((token) => {
        const mutated = mutateWordWithConfusable(token);
        if (mutated && !usedTexts.has(mutated)) {
            confusableCandidates.push(mutated);
            usedTexts.add(mutated);
        }
    });

    // Take up to 2 confusable distractors
    shuffle(confusableCandidates).slice(0, 2).forEach((confWord, idx) => {
        pills.push({
            id: `conf_${targetSentence.id}_${idx}_${confWord}`,
            text: confWord,
            isTargetToken: false,
        });
    });

    // 3. Other words from the story
    const otherTokens = allSentences
        .filter(s => s.id !== targetSentence.id)
        .flatMap(s => s.tokens)
        .filter(t => !usedTexts.has(t));

    const shuffledOthers = shuffle(Array.from(new Set(otherTokens)));
    // Take 2 or 3 other tokens so total pills is 7 to 8
    const neededOthers = Math.max(2, 7 - pills.length);
    shuffledOthers.slice(0, neededOthers).forEach((otherWord, idx) => {
        pills.push({
            id: `other_${targetSentence.id}_${idx}_${otherWord}`,
            text: otherWord,
            isTargetToken: false,
        });
        usedTexts.add(otherWord);
    });

    return shuffle(pills);
}
