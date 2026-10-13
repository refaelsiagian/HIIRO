import charsDataRaw from '../data/chars.json';
import groupsDataRaw from '../data/groups.json';
import typesDataRaw from '../data/types.json';
import { RawChar, RawGroup, RawType } from '../types/kana';
import {
  GroupLevelDefinition,
  SectionLevelDefinition,
  ResolvedChar,
  ResolvedGroupLevel,
  ResolvedSectionLevel,
} from '../types/levels';
import { SECTIONS_CONFIG } from '../data/levels/index';

const charsData = charsDataRaw as RawChar[];
const groupsData = groupsDataRaw as RawGroup[];
const typesData = typesDataRaw as RawType[];

/**
 * Resolves a single GroupLevelDefinition into a full ResolvedGroupLevel
 * by pulling character, romaji, display names, and confusable_with data
 * directly from groups.json and chars.json.
 */
export function resolveLevel(
  definition: GroupLevelDefinition,
  category: 'hiragana' | 'katakana'
): ResolvedGroupLevel {
  let displayName = definition.displayName || '';
  let subtitleKanji = definition.subtitleKanji || '';
  const charStrings: string[] = [];

  // 1. Standard single group
  if (definition.groupId) {
    const groupRow = groupsData.find(
      (g) => g.id === definition.groupId && g.category === category
    );
    if (groupRow) {
      if (!displayName) displayName = groupRow.display_name;
      if (!subtitleKanji) subtitleKanji = groupRow.subtitle_kanji;
      charStrings.push(...groupRow.char_member);
    }
  }

  // 2. Multiple groups review (e.g. Shotesto)
  if (definition.includeGroups) {
    definition.includeGroups.forEach((gId) => {
      const groupRow = groupsData.find(
        (g) => g.id === gId && g.category === category
      );
      if (groupRow) {
        charStrings.push(...groupRow.char_member);
      }
    });
    if (!displayName) displayName = 'Shōtesuto';
    if (!subtitleKanji) subtitleKanji = '小テスト';
  }

  // 3. Entire section review (e.g. Daishiken)
  if (definition.includeSection) {
    const typeRow = typesData.find(
      (t) => t.id === definition.includeSection && t.category === category
    );
    if (typeRow) {
      typeRow.group_member.forEach((gId) => {
        const groupRow = groupsData.find(
          (g) => g.id === gId && g.category === category
        );
        if (groupRow) {
          charStrings.push(...groupRow.char_member);
        }
      });
      if (!displayName) displayName = 'Daishiken';
      if (!subtitleKanji) subtitleKanji = '大試験';
    }
  }

  // 4. Category-wide final exam (daishiken-final)
  if (definition.id === 'daishiken-final') {
    const catGroups = groupsData.filter((g) => g.category === category);
    catGroups.forEach((g) => {
      charStrings.push(...g.char_member);
    });
    if (!displayName) displayName = 'Daishiken';
    if (!subtitleKanji) subtitleKanji = '大試験';
  }

  // Map each kana character string to full character data from chars.json
  const resolvedChars: ResolvedChar[] = [];
  const romajiList: string[] = [];

  charStrings.forEach((charStr) => {
    const charRow = charsData.find(
      (c) => c.char === charStr && c.category === category
    );
    if (charRow) {
      resolvedChars.push({
        k: charRow.char,
        r: charRow.romaji,
        category,
        consonant: charRow.consonant || '',
        vowel: charRow.vowel || '',
        confusableWith: charRow.confusable_with || [],
        groupId: charRow.group || '',
      });
      romajiList.push(charRow.romaji);
    }
  });

  return {
    id: definition.id,
    displayName,
    subtitleKanji,
    chars: resolvedChars,
    letters: romajiList,
    gameModes: definition.gameModes,
  };
}

/**
 * Resolves an entire section (e.g. Gojūon, Dakuon, etc.) for a specific category.
 */
export function resolveSection(
  section: SectionLevelDefinition,
  category: 'hiragana' | 'katakana'
): ResolvedSectionLevel {
  return {
    id: section.id,
    displayName: section.displayName,
    subtitleKanji: section.subtitleKanji,
    groups: section.groups.map((groupDef) => resolveLevel(groupDef, category)),
  };
}

/**
 * Get a specific resolved level by its id (e.g. 'a-gyo', 'shotesto-dakuon-1').
 * If section is omitted, searches across all registered sections.
 */
export function getResolvedLevelById(
  levelId: string,
  category: 'hiragana' | 'katakana',
  section?: SectionLevelDefinition
): ResolvedGroupLevel | null {
  if (section) {
    const definition = section.groups.find((g) => g.id === levelId);
    if (!definition) return null;
    return resolveLevel(definition, category);
  }

  const sectionsList = Object.values(SECTIONS_CONFIG) as SectionLevelDefinition[];
  for (const s of sectionsList) {
    const found = s.groups.find((g: GroupLevelDefinition) => g.id === levelId);
    if (found) {
      return resolveLevel(found, category);
    }
  }

  return null;
}
