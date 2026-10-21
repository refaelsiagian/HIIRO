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
        petalBg: '#FFB7A3',
      },
    },
    shotesto: {
      paper: {
        bg: '#EC8080',
        border: '#B84444',
        fontColor: '#6F3E28',
        starColor: '#B84444',
        letterOpacity: 'opacity-40',
      },
      room: {
        pageBgGradient: 'linear-gradient(to bottom right, #FFF3F0, #FFDAD1)',
        plateBg: '#FFE8E0',
        plateBorder: '#E89A81',
        fontColor: '#6F3E28',
        starColor: '#CC6E34',
        petalBg: '#FFB7A3',
      },
    },
    // Shiken (Section Exam) - initialized with default basic colors as requested
    shiken: {
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
        petalBg: '#FFB7A3',
      },
    },
    daishiken: {
      paper: {
        bg: '#B576E7',
        border: '#794D9B',
        fontColor: '#4F286F',
        starColor: '#794D9B',
        letterOpacity: 'opacity-40',
      },
      room: {
        pageBgGradient: 'linear-gradient(to bottom right, #FFF3F0, #FFDAD1)',
        plateBg: '#ECC5FF',
        plateBorder: '#C681E8',
        fontColor: '#4A286F',
        starColor: '#8F34CC',
        petalBg: '#FFB7A3',
      },
    },
  },
  katakana: {
    regular: {
      paper: {
        bg: '#FFE8E0',
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
      },
    },
    shotesto: {
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
      },
    },
    // Shiken (Section Exam) - initialized with default basic colors as requested
    shiken: {
      paper: {
        bg: '#FFE8E0',
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
