import charsDataRaw from '../data/chars.json';
import groupsDataRaw from '../data/groups.json';
import typesDataRaw from '../data/types.json';
import { 
    KanaMetadata, 
    TypeData, 
    GroupData, 
    CharItem, 
    RawChar, 
    RawGroup, 
    RawType 
} from '../types/kana';

const charsData: RawChar[] = charsDataRaw as RawChar[];
const groupsData: RawGroup[] = groupsDataRaw as RawGroup[];
const typesData: RawType[] = typesDataRaw as RawType[];

function parseData(): KanaMetadata {
    const result: KanaMetadata = {
        hiragana: [],
        katakana: []
    };

    const categories = ['hiragana', 'katakana'];

    categories.forEach(category => {
        // Filter types by category
        const catTypes = typesData.filter(t => t.category === category);
        
        catTypes.forEach(typeRow => {
            const typeGroups: GroupData[] = [];
            let shotestoCount = 1;

            typeRow.group_member.forEach((groupId, i) => {
                // Find group
                const groupRow = groupsData.find(g => g.id === groupId && g.category === category);
                if (!groupRow) return;

                // Find chars for this group
                // Note: groupRow.char_member defines order, but we can also just filter charsData
                // Let's use filter to get all full Char data
                const groupChars: CharItem[] = [];
                groupRow.char_member.forEach(charString => {
                    const charRow = charsData.find(c => c.char === charString && c.category === category);
                    if (charRow) {
                        groupChars.push({
                            k: charRow.char,
                            r: charRow.romaji
                        });
                    }
                });

                const groupData: GroupData = {
                    id: groupRow.id,
                    title: groupRow.display_name,
                    display_name: groupRow.display_name,
                    subtitle_kanji: groupRow.subtitle_kanji,
                    chars: groupChars
                };

                typeGroups.push(groupData);

                if ((i + 1) % 3 === 0 && i !== typeRow.group_member.length - 1) {
                    // Collect chars from the last 3 groups
                    const last3Groups = typeGroups.slice(-3);
                    const shotestoChars = last3Groups.flatMap(g => g.chars);
                    
                    typeGroups.push({
                        id: `shotesto-${typeRow.id}-${shotestoCount}`,
                        title: `小テスト ${shotestoCount}`,
                        display_name: 'Shōtesuto',
                        subtitle_kanji: '小テスト',
                        chars: shotestoChars
                    });
                    shotestoCount++;
                }
            });

            // Inject Daishiken at the end of this type
            // Collect all chars in this type
            const allTypeChars = typeGroups.filter(g => !g.id.startsWith('shotesto')).flatMap(g => g.chars);
            
            typeGroups.push({
                id: `daishiken-${typeRow.id}`,
                title: '大試験',
                display_name: 'Daishiken',
                subtitle_kanji: '大試験',
                chars: allTypeChars
            });

            result[category].push({
                id: typeRow.id,
                display_name: typeRow.display_name,
                subtitle_hiragana: typeRow.subtitle_hiragana,
                subtitle_katakana: typeRow.subtitle_katakana,
                subtitle_kanji: typeRow.subtitle_kanji,
                groups: typeGroups
            });
        });

        // Add Final Daishiken section
        // Collect all chars from all types in this category
        const allCategoryChars = result[category].flatMap(t => 
            t.groups.filter(g => !g.id.startsWith('shotesto') && !g.id.startsWith('daishiken')).flatMap(g => g.chars)
        );
        
        result[category].push({
            id: 'daishiken',
            display_name: 'Daishiken',
            subtitle_hiragana: 'だいしけん',
            subtitle_katakana: 'ダイシケン',
            subtitle_kanji: '大試験',
            groups: [
                {
                    id: 'daishiken-final',
                    title: '大試験',
                    display_name: 'Daishiken',
                    subtitle_kanji: '大試験',
                    chars: allCategoryChars
                }
            ]
        });
    });

    return result;
}

export const KANA_METADATA: KanaMetadata = parseData();

// Helper to get raw character data if needed by drills
export function getCharData(kana: string, category: string): RawChar | undefined {
    return charsData.find(c => c.char === kana && c.category === category);
}
