import textbuilderDataRaw from '../../data/drills/textbuilderData.json';
import charsRaw from '../../data/chars.json';

export interface TextbuilderOption {
    id: string;
    kana: string;
    isCorrect: boolean;
}

export interface TextbuilderSentence {
    id: number;
    kana: string;
    romaji: string;
    meaning: string;
    options: TextbuilderOption[];
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

/**
 * Generates 3 unique distractor sentences by replacing 1 or 2 characters
 * with their confusable equivalents from chars.json.
 */
export function generateConfusableDistractors(sentence: string, count = 3): string[] {
    const distractors = new Set<string>();
    const validIndices: number[] = [];

    for (let i = 0; i < sentence.length; i++) {
        const ch = sentence[i];
        if (confusableMap.has(ch) && (confusableMap.get(ch)?.length ?? 0) > 0) {
            validIndices.push(i);
        }
    }

    if (validIndices.length === 0) {
        return [sentence + ' !', sentence + ' ?', sentence + ' .'];
    }

    let attempts = 0;
    while (distractors.size < count && attempts < 200) {
        attempts++;
        // Mutate 1 character (or 2 characters if struggling to find unique candidates)
        const numMutations = (attempts > 30 || Math.random() < 0.3) && validIndices.length > 1 ? 2 : 1;
        const chosenIndices = [...validIndices].sort(() => 0.5 - Math.random()).slice(0, numMutations);

        const charsArr = sentence.split('');
        for (const idx of chosenIndices) {
            const confList = confusableMap.get(charsArr[idx]);
            if (confList && confList.length > 0) {
                const rep = confList[Math.floor(Math.random() * confList.length)];
                charsArr[idx] = rep;
            }
        }

        const candidate = charsArr.join('');
        if (candidate !== sentence && !distractors.has(candidate)) {
            distractors.add(candidate);
        }
    }

    return Array.from(distractors);
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
        const targetKana = category === 'katakana' ? s.katakana : s.hiragana;
        const distractorKanas = generateConfusableDistractors(targetKana, 3);

        const correctOpt: TextbuilderOption = {
            id: `opt-${s.id}-correct`,
            kana: targetKana,
            isCorrect: true,
        };

        const distractorOpts: TextbuilderOption[] = distractorKanas.map((dKana, dIdx) => ({
            id: `opt-${s.id}-dist-${dIdx}`,
            kana: dKana,
            isCorrect: false,
        }));

        const options = shuffle([correctOpt, ...distractorOpts]);

        return {
            id: s.id || (idx + 1),
            kana: targetKana,
            romaji: s.romaji,
            meaning: s.meaning,
            options,
        };
    });

    return {
        id: selectedStory.id,
        title: selectedStory.title,
        fullMeaning: selectedStory.fullMeaning,
        sentences,
    };
}
