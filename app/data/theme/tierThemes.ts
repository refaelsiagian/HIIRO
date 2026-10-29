/**
 * Visual Theme Configuration for HIIRO
 * 
 * Houses both:
 * 1. Paper Theme: The visual appearance of the subsection card in the carousel (The Door).
 * 2. Room Theme: The visual atmosphere when entering the stage list and drills (The Room).
 * 
 * Includes 4 tiers:
 * - 'regular': Standard character groups (A-gyo, Ka-gyo, etc.)
 * - 'shotesto': Review checkpoint quizes
 * - 'shiken': Section-level final exam (currently uses default basic colors as placeholder)
 * - 'daishiken': Category-level grand final exam
 */

export type CardTier = 'regular' | 'shotesto' | 'shiken' | 'daishiken';

export interface PaperTheme {
  bg: string;            // Hex color for SVG card background
  border: string;        // Hex color for SVG card border
  fontColor: string;     // Hex color for card text
  starColor: string;     // Hex color for star fill & text
  letterOpacity: string; // Tailwind opacity for decorative background letter (e.g. 'opacity-40')
}

export interface RoomTheme {
  // Web Ambiance
  pageBgGradient: string; // CSS background gradient for the page
  
  // Stage Plate (QuizBackgroundSVG)
  plateBg: string;        // Hex color for plate background
  plateBorder: string;    // Hex color for plate border
  fontColor: string;      // Hex color for text inside plate
  starColor: string;      // Hex color for star fill & text
  
  // Interactive Drill Elements
  petalBg: string;        // Hex color for shuriken/petal buttons in drills
  
  // Character Selector Highlight
  letterHighlight: string; // Hex color for active letter highlight & bottom border
}

export interface TierTheme {
  paper: PaperTheme;
  room: RoomTheme;
}

export const TIER_THEMES: Record<'hiragana' | 'katakana', Record<CardTier, TierTheme>> = {
  hiragana: {
    regular: {
      paper: {
        bg: '#E89A81',
        border: '#915946',
        fontColor: '#6F3E28',
        starColor: '#CC6E34',
        letterOpacity: 'opacity-40',
      },
      room: {
        pageBgGradient: 'linear-gradient(to bottom right, #FFF3F0, #FFDAD1)',
        plateBg: '#FFE8E0',
        plateBorder: '#E89A81',
        fontColor: '#6F3E28',
        starColor: '#CC6E34',
        petalBg: '#CC6E34',
        letterHighlight: '#A55B38',
      },
    },
    shotesto: {
      paper: {
        bg: '#8BAA88',
        border: '#55624D',
        fontColor: '#353C35',
        starColor: '#55624D',
        letterOpacity: 'opacity-40',
      },
      room: {
        pageBgGradient: 'linear-gradient(to bottom right, #F5FFF2, #C6E3BC)',
        plateBg: '#E2EFDF',
        plateBorder: '#709360',
        fontColor: '#1F4712',
        starColor: '#709360',
        petalBg: '#709360',
        letterHighlight: '#709360',
      },
    },
    // Shiken (Section Exam) 
    shiken: {
      paper: {
        bg: '#EC8080',
        border: '#B53E3E',
        fontColor: '#6F3E28',
        starColor: '#B53E3E',
        letterOpacity: 'opacity-40',
      },
      room: {
        pageBgGradient: 'linear-gradient(to bottom right, #FFF0F0, #FFC0C0)',
        plateBg: '#FFE0E0',
        plateBorder: '#CE5252',
        fontColor: '#6F2828',
        starColor: '#CE5252',
        petalBg: '#CE5252',
        letterHighlight: '#CE5252',
      },
    },
    daishiken: {
      paper: {
        bg: '#B893D5',
        border: '#794D9B',
        fontColor: '#4F286F',
        starColor: '#794D9B',
        letterOpacity: 'opacity-40',
      },
      room: {
        pageBgGradient: 'linear-gradient(to bottom right, #F8F3FF, #D8C6EE)',
        plateBg: '#F4DDFF',
        plateBorder: '#A264C1',
        fontColor: '#4A286F',
        starColor: '#8F5ABD',
        petalBg: '#8F5ABD',
        letterHighlight: '#8F5ABD',
      },
    },
  },
  katakana: {
    regular: {
      paper: {
        bg: '#FAD7CC',
        border: '#CC6E34',
        fontColor: '#6F3E28',
        starColor: '#CC6E34',
        letterOpacity: 'opacity-40',
      },
      room: {
        pageBgGradient: 'linear-gradient(to bottom right, #FFF3F0, #FFDAD1)',
        plateBg: '#FFE8E0',
        plateBorder: '#E89A81',
        fontColor: '#6F3E28',
        starColor: '#CC6E34',
        petalBg: '#FFB7A3',
        letterHighlight: '#A55B38',
      },
    },
    shotesto: {
      paper: {
        bg: '#D3E5D3',
        border: '#5B995E',
        fontColor: '#22341E',
        starColor: '#5B995E',
        letterOpacity: 'opacity-40',
      },
      room: {
        pageBgGradient: 'linear-gradient(to bottom right, #F3FFF0, #BACFB3)',
        plateBg: '#FFE8E0',
        plateBorder: '#E89A81',
        fontColor: '#6F3E28',
        starColor: '#CC6E34',
        petalBg: '#FFB7A3',
        letterHighlight: '#709360',
      },
    },
    // Shiken (Section Exam) 
    shiken: {
      paper: {
        bg: '#FFD4D4',
        border: '#CE6262',
        fontColor: '#6F3E28',
        starColor: '#CE6262',
        letterOpacity: 'opacity-40',
      },
      room: {
        pageBgGradient: 'linear-gradient(to bottom right, #FFF3F0, #FFDAD1)',
        plateBg: '#FFE8E0',
        plateBorder: '#E89A81',
        fontColor: '#6F3E28',
        starColor: '#CC6E34',
        petalBg: '#FFB7A3',
        letterHighlight: '#CE5252',
      },
    },
    daishiken: {
      paper: {
        bg: '#F5E0FF',
        border: '#8656AC',
        fontColor: '#4F286F',
        starColor: '#8656AC',
        letterOpacity: 'opacity-40',
      },
      room: {
        pageBgGradient: 'linear-gradient(to bottom right, #FFF3F0, #FFDAD1)',
        plateBg: '#ECC5FF',
        plateBorder: '#C681E8',
        fontColor: '#4A286F',
        starColor: '#8F34CC',
        petalBg: '#FFB7A3',
        letterHighlight: '#C681E8',
      },
    },
  },
};

/**
 * Resolves the tier ('regular' | 'shotesto' | 'shiken' | 'daishiken') from a group ID.
 */
export function getTierFromGroupId(groupId: string): CardTier {
  if (groupId.startsWith('daishiken')) return 'daishiken';
  if (groupId.startsWith('shiken')) return 'shiken';
  if (groupId.startsWith('shotesto')) return 'shotesto';
  return 'regular';
}

/**
 * Convenience helper to get the complete TierTheme for a given category and groupId/tier.
 */
export function getTierTheme(category: 'hiragana' | 'katakana', tierOrGroupId: CardTier | string): TierTheme {
  const isDirectTier = ['regular', 'shotesto', 'shiken', 'daishiken'].includes(tierOrGroupId);
  const tier: CardTier = isDirectTier
    ? (tierOrGroupId as CardTier)
    : getTierFromGroupId(tierOrGroupId);

  const categoryThemes = TIER_THEMES[category] || TIER_THEMES.hiragana;
  return categoryThemes[tier] || categoryThemes.regular;
}

export default TIER_THEMES;
