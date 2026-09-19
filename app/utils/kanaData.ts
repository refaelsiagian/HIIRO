import hiraganaData from '../data/hiragana.json';
import katakanaData from '../data/katakana.json';
import { KanaMetadata, GroupData } from '../types/kana';

interface RawKanaChar {
    char: string;
    romaji: string;
    group: string;
    type: string;
}

const TITLE_MAP: Record<string, string> = {
    "a-gyo": "Vokal Dasar",
    "k-gyo": "K-Gyo",
    "s-gyo": "S-Gyo",
    "t-gyo": "T-Gyo",
    "n-gyo": "N-Gyo",
    "h-gyo": "H-Gyo",
    "m-gyo": "M-Gyo",
    "y-gyo": "Y-Gyo",
    "r-gyo": "R-Gyo",
    "w-gyo": "W-Gyo",
    "n-final": "N Akhiran",
    "g-gyo": "G-Gyo",
    "z-gyo": "Z-Gyo",
    "d-gyo": "D-Gyo",
    "b-gyo": "B-Gyo",
    "p-gyo": "P-Gyo",
    "k-yoon": "K-Yoon",
    "s-yoon": "S-Yoon",
    "t-yoon": "T-Yoon",
    "n-yoon": "N-Yoon",
    "h-yoon": "H-Yoon",
    "m-yoon": "M-Yoon",
    "r-yoon": "R-Yoon",
    "g-yoon": "G-Yoon",
    "j-yoon": "J-Yoon",
    "b-yoon": "B-Yoon",
    "p-yoon": "P-Yoon",
    "v-special": "V-Series",
    "f-special": "F-Series",
    "t-special": "Ti/Di Series",
    "d-special": "D-Series",
    "w-special": "W-Series",
    "symbol": "Simbol"
};

function getGroupTitle(groupId: string): string {
    if (TITLE_MAP[groupId]) {
        return TITLE_MAP[groupId];
    }
    // Fallback: split by dash and capitalize
    const parts = groupId.split('-');
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('-');
}

function parseKanaData(rawData: any[]): { [section: string]: GroupData[] } {
    const sections: { [section: string]: { [groupId: string]: GroupData } } = {};

    rawData.forEach((item: RawKanaChar) => {
        // Map types to sections
        let section = item.type;
        if (section === 'dakuten-handakuten') section = 'dakuten';

        if (!sections[section]) sections[section] = {};

        if (!sections[section][item.group]) {
            sections[section][item.group] = {
                id: item.group,
                title: getGroupTitle(item.group),
                chars: []
            };
        }

        sections[section][item.group].chars.push({
            k: item.char,
            r: item.romaji
        });
    });

    const result: { [section: string]: GroupData[] } = {};
    for (const section in sections) {
        const groups = Object.values(sections[section]);
        const finalGroups: GroupData[] = [];
        let shotestoCount = 1;

        // Inject Shotesto every 3 groups
        for (let i = 0; i < groups.length; i++) {
            finalGroups.push(groups[i]);
            // Every 3 groups, if it's not the last group, insert a shotesto
            if ((i + 1) % 3 === 0 && i !== groups.length - 1) {
                finalGroups.push({
                    id: `shotesto-${section}-${shotestoCount}`,
                    title: `小テスト ${shotestoCount}`, // Shotesto
                    chars: [] // Shotesto might not have specific preview chars, or we can take from previous 3 groups
                });
                shotestoCount++;
            }
        }
        
        // Add Daishiken at the end of this subsection
        finalGroups.push({
            id: `daishiken-${section}`,
            title: '大試験',
            chars: []
        });

        result[section] = finalGroups;
    }
    
    // Add Daishiken section at the end
    result['daishiken'] = [
        {
            id: 'daishiken-final',
            title: '大試験',
            chars: []
        }
    ];
    
    return result;
}

export const KANA_METADATA: KanaMetadata = {
    hiragana: parseKanaData(hiraganaData),
    katakana: parseKanaData(katakanaData)
};
