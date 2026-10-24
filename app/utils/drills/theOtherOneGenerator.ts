import charsDataRaw from '../../data/chars.json';
import groupsDataRaw from '../../data/groups.json';

export interface SlotItem {
    id: number;
    kana: string;
    isOdd?: boolean;
    isBlank?: boolean;
}

export interface OptionItem {
    id: number;
    kana: string;
    isCorrect: boolean;
}

export interface TheOtherOneQuestion {
    type: 'odd-one' | 'missing-slot';
    slots: SlotItem[];
    options?: OptionItem[];
    targetKana?: string;
}

interface RawChar {
    char: string;
    category: string;
    romaji: string;
    consonant?: string;
    vowel?: string;
    group?: string;
}

interface RawGroup {
    id: string;
    category: string;
    char_member: string[];
}

const VOWELS = ['a', 'i', 'u', 'e', 'o'];
const DAKUON_CONSONANTS = new Set(['g', 'z', 'd', 'b', 'p', 'j', 'v']);
const DAKUON_GROUPS = new Set([
    'g-gyo', 'z-gyo', 'd-gyo', 'b-gyo', 'p-gyo',
    'g-yoon', 'j-yoon', 'b-yoon', 'p-yoon'
]);

function isDakuonOrHandakuon(c: { group?: string; consonant?: string }): boolean {
    return (c.group ? DAKUON_GROUPS.has(c.group) : false) || (c.consonant ? DAKUON_CONSONANTS.has(c.consonant) : false);
}

function getBaseFamily(c: { consonant?: string }): string {
    const cons = c.consonant || '';
    if (!cons) return 'vowel';
    if (['k', 'g'].includes(cons)) return 'k';
    if (['s', 'z', 'j'].includes(cons)) return 's';
    if (['t', 'd', 'c'].includes(cons)) return 't';
    if (['h', 'b', 'p', 'f'].includes(cons)) return 'h';
    if (cons === 'n') return 'n';
    if (cons === 'm') return 'm';
    if (cons === 'y') return 'y';
    if (cons === 'r') return 'r';
    if (cons === 'w') return 'w';
    return cons;
}

function shuffleArray<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function isYoonChar(c: RawChar): boolean {
    return Boolean((c.group && c.group.includes('yoon')) || c.char.length > 1);
}

function isYaFamilyChar(c: RawChar): boolean {
    return c.group === 'y-gyo' || ['ya', 'yu', 'yo'].includes(c.romaji);
}

/**
 * Picks distinct characters from a vowel -dan pool ensuring:
 * 1. Root consonant diversity (e.g. ha, ba, pa never appear together)
 * 2. At most 1 Yōon per set
 * 3. No standalone ya/yu/yo alongside corresponding Yōon
 */
function pickDiverseDanChars(charsPool: RawChar[], count: number): RawChar[] {
    const shuffled = shuffleArray(charsPool);
    const picked: RawChar[] = [];
    const usedFamilies = new Set<string>();
    let yoonCount = 0;

    for (const c of shuffled) {
        const family = getBaseFamily(c);
        const isYoon = isYoonChar(c);
        const isYaFamily = isYaFamilyChar(c);

        // Rule 1: No duplicate consonant roots
        if (usedFamilies.has(family)) continue;
        // Rule 2: At most 1 Yōon per question
        if (isYoon && yoonCount >= 1) continue;

        // Rule 2: Standalone ya/yu/yo conflict with corresponding Yōon
        if (isYaFamily && picked.some(p => isYoonChar(p))) continue;
        if (isYoon && picked.some(p => isYaFamilyChar(p))) continue;

        picked.push(c);
        usedFamilies.add(family);
        if (isYoon) yoonCount++;
        if (picked.length === count) break;
    }
    return picked;
}

/**
 * Pure generator function for The Other One Drill questions.
 * Generates both Type 1 (Odd-one-out) and Type 2 (Missing slot) with 50-50 probability,
 * strict anti-spoiler rules, and randomized slot orders.
 */
export function generateTheOtherOneQuestion(category: 'hiragana' | 'katakana'): TheOtherOneQuestion | null {
    const allChars = (charsDataRaw as RawChar[]).filter(c => c.category === category);
    const gyoGroups = (groupsDataRaw as RawGroup[]).filter(
        g => g.category === category && g.char_member && g.char_member.length === 5
    );

    if (allChars.length === 0 || gyoGroups.length === 0) return null;

    const type: 'odd-one' | 'missing-slot' = Math.random() < 0.5 ? 'odd-one' : 'missing-slot';
    const groupKind: 'gyo' | 'dan' = Math.random() < 0.5 ? 'gyo' : 'dan';

    if (type === 'odd-one') {
        if (groupKind === 'gyo') {
            const gyo = gyoGroups[Math.floor(Math.random() * gyoGroups.length)];
            const isGroupDakuon = isDakuonOrHandakuon({ group: gyo.id });
            const matching4 = shuffleArray(gyo.char_member).slice(0, 4);

            // Rule 3: If gyo is dakuon/handakuon, the odd one MUST also be dakuon/handakuon
            const candidateOthers = allChars.filter(c =>
                c.group !== gyo.id && isDakuonOrHandakuon(c) === isGroupDakuon
            );
            const oddChar = candidateOthers[Math.floor(Math.random() * candidateOthers.length)].char;

            const slots: SlotItem[] = shuffleArray([
                ...matching4.map((kana, idx) => ({ id: idx, kana, isOdd: false })),
                { id: 99, kana: oddChar, isOdd: true },
            ]);

            return { type: 'odd-one', slots };
        } else {
            const vowel = VOWELS[Math.floor(Math.random() * VOWELS.length)];
            const danChars = allChars.filter(c => c.vowel === vowel);
            const picked4 = pickDiverseDanChars(danChars, 4);

            const usedFamilies = new Set(picked4.map(c => getBaseFamily(c)));
            const hasYoon = picked4.some(c => isYoonChar(c));

            const candidateOthers = allChars.filter(c => {
                if (c.vowel === vowel) return false;
                if (usedFamilies.has(getBaseFamily(c))) return false;
                if (isYoonChar(c) && hasYoon) return false;
                if (isYaFamilyChar(c) && hasYoon) return false;
                if (isYoonChar(c) && picked4.some(p => isYaFamilyChar(p))) return false;
                return true;
            });
            const oddChar = candidateOthers[Math.floor(Math.random() * candidateOthers.length)].char;

            const slots: SlotItem[] = shuffleArray([
                ...picked4.map((c, idx) => ({ id: idx, kana: c.char, isOdd: false })),
                { id: 99, kana: oddChar, isOdd: true },
            ]);

            return { type: 'odd-one', slots };
        }
    } else {
        // type === 'missing-slot'
        if (groupKind === 'gyo') {
            const gyo = gyoGroups[Math.floor(Math.random() * gyoGroups.length)];
            const isGroupDakuon = isDakuonOrHandakuon({ group: gyo.id });
            const shuffled = shuffleArray(gyo.char_member);
            const targetChar = shuffled[0];
            const matching4 = shuffled.slice(1, 5);

            const slots: SlotItem[] = shuffleArray([
                ...matching4.map((kana, idx) => ({ id: idx, kana, isBlank: false })),
                { id: 99, kana: '', isBlank: true },
            ]);

            const candidateDistractors = allChars.filter(c =>
                c.group !== gyo.id && isDakuonOrHandakuon(c) === isGroupDakuon
            );
            const distractors = shuffleArray(candidateDistractors)
                .slice(0, 3)
                .map(c => c.char);

            const options: OptionItem[] = shuffleArray([
                { id: 1, kana: targetChar, isCorrect: true },
                ...distractors.map((kana, idx) => ({ id: idx + 2, kana, isCorrect: false })),
            ]);

            return { type: 'missing-slot', slots, options, targetKana: targetChar };
        } else {
            const vowel = VOWELS[Math.floor(Math.random() * VOWELS.length)];
            const danChars = allChars.filter(c => c.vowel === vowel);
            const picked5 = pickDiverseDanChars(danChars, 5);
            const target = picked5[0];
            const matching4 = picked5.slice(1, 5);

            const slots: SlotItem[] = shuffleArray([
                ...matching4.map((c, idx) => ({ id: idx, kana: c.char, isBlank: false })),
                { id: 99, kana: '', isBlank: true },
            ]);

            const usedFamilies = new Set(picked5.map(c => getBaseFamily(c)));
            const hasYoonInSlots = matching4.some(c => isYoonChar(c));

            const candidateDistractors = allChars.filter(c => {
                if (c.vowel === vowel) return false;
                if (usedFamilies.has(getBaseFamily(c))) return false;
                if (isYoonChar(c) && hasYoonInSlots) return false;
                return true;
            });
            const distractors = shuffleArray(candidateDistractors)
                .slice(0, 3)
                .map(c => c.char);

            const options: OptionItem[] = shuffleArray([
                { id: 1, kana: target.char, isCorrect: true },
                ...distractors.map((kana, idx) => ({ id: idx + 2, kana, isCorrect: false })),
            ]);

            return { type: 'missing-slot', slots, options, targetKana: target.char };
        }
    }
}
