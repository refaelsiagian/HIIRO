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
    scoreGoal: 16, // Make sure the score to match the pairs times wave counts
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
    timer: 210,
    scoreGoal: 24, // Make sure the score to match the pairs times wave counts
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
      matchCount: 8,
      barIntervalSeconds: 5,
    },
  },
];

/**
 * Comprehensive final exam preset used for Daishiken stages.
 * Consists of 4 distinct high-level quizzes based on daishiken.txt:
 * 1. The Other One (Odd-one-out or missing slot in a 5-letter group)
 * 2. Wordbuilder (Building vocabulary until the letter grid is empty)
 * 3. Under Guidance (Deducing sentence patterns from 4 references)
 * 4. Textbuilder (Completing an 8-sentence passage in sequential order)
 */
export const DAISHIKEN_STAGES_PRESET: StageConfig[] = [
  {
    id: 'the-other-one-1',
    displayName: 'The Other One',
    subtitle: 'The Other One',
    instruction: 'Pilih huruf yang tidak termasuk dalam kelompok atau lengkapi posisi yang kosong',
    timer: 120,
    scoreGoal: 10,
    filepath: 'app/components/drills/TheOtherOneDrill.tsx',
    drillType: 'the-other-one',
    options: {
      totalSlots: 5,
    },
  },
  {
    id: 'wordbuilder-1',
    displayName: 'Wordbuilder',
    subtitle: 'Wordbuilder',
    instruction: 'Susun kata dari huruf yang tersedia di papan hingga seluruh grid kosong',
    timer: 300,
    scoreGoal: 50,
    filepath: 'app/components/drills/WordbuilderDrill.tsx',
    drillType: 'wordbuilder',
    options: {
      maxLives: 5,
    },
  },
  {
    id: 'under-guidance-1',
    displayName: 'Under Guidance',
    subtitle: 'Under Guidance',
    instruction: 'Amati pola struktur 4 kalimat contoh dan pilih kalimat kana yang sesuai arti',
    timer: 180,
    scoreGoal: 8,
    filepath: 'app/components/drills/UnderGuidanceDrill.tsx',
    drillType: 'under-guidance',
  },
  {
    id: 'textbuilder-1',
    displayName: 'Textbuilder',
    subtitle: 'Textbuilder',
    instruction: 'Lengkapi seluruh kalimat rumpang pada teks bacaan secara berurutan',
    timer: 210,
    scoreGoal: 8,
    filepath: 'app/components/drills/TextbuilderDrill.tsx',
    drillType: 'textbuilder',
    options: {
      sentenceCount: 8,
    },
  },
];

