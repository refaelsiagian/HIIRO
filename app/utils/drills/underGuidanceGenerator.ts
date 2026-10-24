import guidanceDataRaw from '../../data/drills/guidanceData.json';

export interface GuidanceSentence {
    kana: string;
    meaning: string;
}

export interface GuidanceOption {
    id: string;
    kana: string;
    isCorrect: boolean;
}

export interface UnderGuidanceQuestion {
    templateId: string;
    references: GuidanceSentence[];
    questionMeaning: string;
    options: GuidanceOption[];
}

interface WordEntry {
    kana: string;
    katakana: string;
    kanji: string;
    meaning: string;
}

interface TemplateEntry {
    id: string;
    v1Pool: string;
    v2Pool: string;
    v3Pool: string;
    kanaParticle1: string;
    kanaParticle2: string;
    kanaParticle3: string;
    meaningTemplate: string;
}

interface GuidanceData {
    pools: Record<string, WordEntry[]>;
    templates: TemplateEntry[];
}

const guidanceData = guidanceDataRaw as GuidanceData;

function shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate a complete Under Guidance question:
 * 1. Picks a structure template randomly.
 * 2. Picks 2 words per variable: A1, A2 for V1; B1, B2 for V2; C1, C2 for V3.
 * 3. Builds 4 reference sentences isolating each variable difference.
 * 4. Builds question (meaning only) using the novel combination (A2, B2, C2).
 * 5. Generates 4 options in Kana (1 correct + 3 single-variable distractors).
 */
export function generateUnderGuidanceQuestion(category: 'hiragana' | 'katakana' = 'hiragana'): UnderGuidanceQuestion {
    const isKatakana = category === 'katakana';
    const templates = guidanceData.templates;
    const template = templates[Math.floor(Math.random() * templates.length)];

    const pool1 = guidanceData.pools[template.v1Pool] || [];
    const pool2 = guidanceData.pools[template.v2Pool] || [];
    const pool3 = guidanceData.pools[template.v3Pool] || [];

    let a1: WordEntry, a2: WordEntry;
    let b1: WordEntry, b2: WordEntry;

    if (template.v1Pool === template.v2Pool) {
        // Pick 4 distinct items so V1 and V2 don't overlap
        const shuffled = shuffle(pool1);
        a1 = shuffled[0];
        a2 = shuffled[1];
        b1 = shuffled[2];
        b2 = shuffled[3];
    } else {
        const shuf1 = shuffle(pool1);
        const shuf2 = shuffle(pool2);
        a1 = shuf1[0];
        a2 = shuf1[1];
        b1 = shuf2[0];
        b2 = shuf2[1];
    }

    const shuf3 = shuffle(pool3);
    const c1 = shuf3[0];
    const c2 = shuf3[1];

    // Helper to build a sentence given word choices for (v1, v2, v3)
    const buildSentence = (w1: WordEntry, w2: WordEntry, w3: WordEntry): GuidanceSentence => {
        const word1Text = isKatakana ? w1.katakana : w1.kana;
        const word2Text = isKatakana ? w2.katakana : w2.kana;
        const word3Text = isKatakana ? w3.katakana : w3.kana;

        const kanaParts = [
            word1Text,
            template.kanaParticle1,
            word2Text,
            template.kanaParticle2,
            word3Text,
            template.kanaParticle3
        ].filter(Boolean);

        const kana = kanaParts.join(' ');
        const meaningRaw = template.meaningTemplate
            .replace('{v1}', w1.meaning)
            .replace('{v2}', w2.meaning)
            .replace('{v3}', w3.meaning);

        return {
            kana,
            meaning: capitalize(meaningRaw)
        };
    };

    // 4 Reference Sentences (each isolating 1 difference)
    const ref1 = buildSentence(a1, b1, c1);
    const ref2 = buildSentence(a1, b1, c2); // Isolates C1 vs C2
    const ref3 = buildSentence(a1, b2, c1); // Isolates B1 vs B2
    const ref4 = buildSentence(a2, b1, c1); // Isolates A1 vs A2

    // Shuffle the 4 references so Ref 1 isn't always in position 1
    const references = shuffle([ref1, ref2, ref3, ref4]);

    // Question: (A2, B2, C2) - Displays meaning only!
    const questionSentence = buildSentence(a2, b2, c2);

    // 4 Options (1 correct + 3 minimal distractors)
    const correctOption: GuidanceOption = {
        id: 'opt-correct',
        kana: questionSentence.kana,
        isCorrect: true
    };

    // Distractor 1: flips A (uses A1 instead of A2)
    const distractorA: GuidanceOption = {
        id: 'opt-distractor-a',
        kana: buildSentence(a1, b2, c2).kana,
        isCorrect: false
    };

    // Distractor 2: flips B (uses B1 instead of B2)
    const distractorB: GuidanceOption = {
        id: 'opt-distractor-b',
        kana: buildSentence(a2, b1, c2).kana,
        isCorrect: false
    };

    // Distractor 3: flips C (uses C1 instead of C2)
    const distractorC: GuidanceOption = {
        id: 'opt-distractor-c',
        kana: buildSentence(a2, b2, c1).kana,
        isCorrect: false
    };

    const options = shuffle([correctOption, distractorA, distractorB, distractorC]);

    return {
        templateId: template.id,
        references,
        questionMeaning: questionSentence.meaning,
        options
    };
}
