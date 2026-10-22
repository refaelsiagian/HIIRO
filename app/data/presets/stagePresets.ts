import { StageConfig } from '../../types/levels';

/**
 * Standard 5-stage progression used across regular character groups.
 */
export const NORMAL_STAGES_PRESET: StageConfig[] = [
  {
    id: 'true-false-1',
    displayName: 'True or False',
    subtitle: 'Truth or False',
    instruction: 'Tentukan apakah pasangan huruf kana dan romajinya benar atau salah',
    timer: 45,
    scoreGoal: 10,
    filepath: 'app/components/drills/TrueFalseDrill.tsx',
    drillType: 'true-false',
  },
  {
    id: 'true-false-2',
    displayName: 'True or False Multi',
    subtitle: 'Truth or False',
    instruction: 'Tentukan apakah pasangan huruf kana dan romajinya benar atau salah',
    timer: 45,
    scoreGoal: 10,
    filepath: 'app/components/drills/TrueFalseDrill.tsx',
    drillType: 'true-false-multi',
    options: {
      isMulti: true,
    },
  },
  {
    id: 'sequence-1',
    displayName: 'Sequence Drill 1',
    subtitle: 'Urutan',
    instruction: 'Pilih karakter yang tepat sesuai dengan urutan',
    timer: 60,
    scoreGoal: 5,
    filepath: 'app/components/drills/SequenceDrill.tsx',
    drillType: 'sequence',
    options: {
      level: 1,
    },
  },
  {
    id: 'sequence-2',
    displayName: 'Sequence Drill 2',
    subtitle: 'Urutan',
    instruction: 'Pilih karakter yang tepat sesuai dengan urutan',
    timer: 90,
    scoreGoal: 7,
    filepath: 'app/components/drills/SequenceDrill.tsx',
    drillType: 'sequence-2',
    options: {
      level: 2,
    },
  },
  {
    id: 'find-fill-1',
    displayName: 'Find & Fill',
    subtitle: 'Cari & Isi',
    instruction: 'Temukan dan isi bagian yang kosong dengan benar',
    timer: 120,
    scoreGoal: 10,
    filepath: 'app/components/drills/FindFillDrill.tsx',
    drillType: 'find-fill',
  },
];

/**
 * 4-stage mini-game review progression used across Shōtesuto checkpoints.
 */
export const SHOTESTO_STAGES_PRESET: StageConfig[] = [
  {
    id: 'check-truth-1',
    displayName: 'Check the Truth',
    subtitle: 'Check Truth',
    instruction: 'Periksa pernyataan dan tentukan benar atau salah',
    timer: 90,
    scoreGoal: 10,
    filepath: 'app/components/drills/CheckTruthDrill.tsx',
    drillType: 'check-truth',
  },
  {
    id: 'fill-trace-1',
    displayName: 'Fill the Trace',
    subtitle: 'Fill the Trace',
    instruction: 'Ingat urutan kana yang muncul lalu isi posisi yang ditandai',
    timer: 180,
    scoreGoal: 5,
    filepath: 'app/components/drills/FillTraceDrill.tsx',
    drillType: 'fill-trace',
    options: {
      traceSpots: 7,
    },
  },
  {
    id: 'flip-it-1',
    displayName: 'Flip It!',
    subtitle: 'Flip It!',
    instruction: 'Buka kartu dan cocokkan pasangan kana dengan romaji yang tepat',
    timer: 180,
    scoreGoal: 16,
    filepath: 'app/components/drills/FlipItDrill.tsx',
    drillType: 'flip-it',
    options: {
      pairsPerWave: 8,
      waveCount: 2,
    },
  },
  {
    id: 'quick-glance-1',
    displayName: 'Quick Glance',
    subtitle: 'Quick Glance',
    instruction: 'Temukan pasangan yang cocok di antara grid sebelum bar merah habis',
    timer: 150,
    scoreGoal: 20,
    filepath: 'app/components/drills/QuickGlanceDrill.tsx',
    drillType: 'quick-glance',
    options: {
      totalPairs: 40,
      matchCount: 6,
      barIntervalSeconds: 10,
    },
  },
];

/**
 * 4-stage comprehensive section exam preset used across Shiken stages.
 * Evaluates all letters learned up to and including the current section.
 */
export const SHIKEN_STAGES_PRESET: StageConfig[] = [
  {
    id: 'check-truth-1',
    displayName: 'Check the Truth',
    subtitle: 'Check Truth',
    instruction: 'Periksa pernyataan dan tentukan benar atau salah',
    timer: 90,
    scoreGoal: 10,
    filepath: 'app/components/drills/CheckTruthDrill.tsx',
    drillType: 'check-truth',
  },
  {
    id: 'fill-trace-1',
    displayName: 'Fill the Trace',
    subtitle: 'Fill the Trace',
    instruction: 'Ingat urutan kana yang muncul lalu isi posisi yang ditandai',
    timer: 180,
    scoreGoal: 1,
    filepath: 'app/components/drills/FillTraceDrill.tsx',
    drillType: 'fill-trace',
    options: {
      traceSpots: 7,
    },
  },
  {
    id: 'flip-it-1',
    displayName: 'Flip It!',
    subtitle: 'Flip It!',
    instruction: 'Buka kartu dan cocokkan pasangan kana dengan romaji yang tepat',
    timer: 180,
    scoreGoal: 24,
    filepath: 'app/components/drills/FlipItDrill.tsx',
    drillType: 'flip-it',
    options: {
      pairsPerWave: 12,
      waveCount: 2,
    },
  },
  {
    id: 'quick-glance-1',
    displayName: 'Quick Glance',
    subtitle: 'Quick Glance',
    instruction: 'Temukan pasangan yang cocok di antara grid sebelum bar merah habis',
    timer: 150,
    scoreGoal: 20,
    filepath: 'app/components/drills/QuickGlanceDrill.tsx',
    drillType: 'quick-glance',
    options: {
      totalPairs: 40,
      matchCount: 6,
      barIntervalSeconds: 10,
    },
  },
];

/**
 * Comprehensive final exam preset used for Daishiken stages.
 * Note: Can be refined once final Daishiken drill modes are decided.
 */
export const DAISHIKEN_STAGES_PRESET: StageConfig[] = [
  {
    id: 'daishiken-exam-1',
    displayName: 'Daishiken Final Exam',
    subtitle: 'Ujian Komprehensif',
    instruction: 'Ujian komprehensif menguji seluruh huruf dalam bagian ini',
    timer: 180,
    scoreGoal: 25,
    filepath: 'app/components/drills/QuickGlanceDrill.tsx',
    drillType: 'quick-glance',
    options: {
      totalPairs: 60,
      matchCount: 6,
      barIntervalSeconds: 10,
    },
  },
];
