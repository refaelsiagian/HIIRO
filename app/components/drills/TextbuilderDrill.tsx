"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CharItem } from '../../types/kana';
import { CheckCircle2, XCircle, BookOpen, Sparkles } from 'lucide-react';
import {
    generateTextbuilderStory,
    TextbuilderStory,
    TextbuilderOption
} from '../../utils/drills/textbuilderGenerator';

interface TextbuilderDrillProps {
    groupChars: CharItem[];
    targetScore?: number;
    onCorrect: () => void;
    onWrong: () => void;
    isSansSerif?: boolean;
    isActive?: boolean;
}

/**
 * Textbuilder Drill (Daishiken Quiz 4)
 * - 8-sentence passage with initial blank slots.
 * - Each sentence shows:
 *     1. Romaji hint ON TOP of the blank spot.
 *     2. The blank slot (or filled Kana).
 *     3. Sentence meaning UNDER the blank spot.
 * - Player selects the correct Kana sentence out of 4 options (1 correct + 3 confusable distractors).
 * - Sentences are solved sequentially from 1 to 8.
 */
const TextbuilderDrill: React.FC<TextbuilderDrillProps> = ({
    groupChars,
    targetScore = 8,
    onCorrect,
    onWrong,
    isSansSerif,
    isActive = true,
}) => {
    // Detect category (hiragana or katakana)
    const category = useMemo<'hiragana' | 'katakana'>(() => {
        if (groupChars && groupChars.length > 0 && (groupChars[0] as any).category) {
            return (groupChars[0] as any).category as 'hiragana' | 'katakana';
        }
        const firstChar = groupChars?.[0]?.k || '';
        return /[\u30A0-\u30FF]/.test(firstChar) ? 'katakana' : 'hiragana';
    }, [groupChars]);

    const [story, setStory] = useState<TextbuilderStory | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedOptId, setSelectedOptId] = useState<string | null>(null);
    const [isAnswering, setIsAnswering] = useState(false);

    // Initialize or reset story
    const loadNewStory = useCallback(() => {
        setStory(generateTextbuilderStory(category));
        setCurrentStep(0);
        setSelectedOptId(null);
        setIsAnswering(false);
    }, [category]);

    useEffect(() => {
        loadNewStory();
    }, [loadNewStory]);

    const activeSentence = story?.sentences[currentStep] || null;

    const handleSelectOption = (opt: TextbuilderOption) => {
        if (!isActive || isAnswering || !story || !activeSentence) return;

        setIsAnswering(true);
        setSelectedOptId(opt.id);

        if (opt.isCorrect) {
            onCorrect();
            setTimeout(() => {
                setSelectedOptId(null);
                setIsAnswering(false);
                if (currentStep < story.sentences.length - 1) {
                    setCurrentStep(prev => prev + 1);
                }
            }, 550);
        } else {
            onWrong();
            setTimeout(() => {
                setSelectedOptId(null);
                setIsAnswering(false);
            }, 600);
        }
    };

    if (!story || !activeSentence) {
        return (
            <div className="flex items-center justify-center w-full h-full min-h-[350px]">
                <div className="w-8 h-8 rounded-full border-2 border-[#DF7956] border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-between w-full max-w-5xl mx-auto h-full text-[#5C3A21] px-2 sm:px-4 py-1 select-none">
            {/* Top Bar: Story Title & Progress */}
            <div className="w-full flex items-center justify-between text-xs sm:text-sm font-bold text-[#5C3A21]/75 mb-2 px-1">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#DF7956]/15 text-[#DF7956] border border-[#DF7956]/30 font-mono">
                        <BookOpen size={13} /> {story.title}
                    </span>
                    <span className="text-xs text-[#5C3A21]/70 hidden md:inline-block font-normal italic">
                        {story.fullMeaning}
                    </span>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold font-mono bg-white/80 border border-[#DF7956]/30 text-[#DF7956]">
                    Kalimat {currentStep + 1} / {story.sentences.length}
                </span>
            </div>

            {/* Story Passage Grid (8 Sentences) */}
            <div className="w-full bg-white/85 backdrop-blur-md border-2 border-[#DF7956]/30 rounded-2xl p-2.5 sm:p-3.5 mb-2.5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
                    {story.sentences.map((s, idx) => {
                        const isFilled = idx < currentStep;
                        const isCurrent = idx === currentStep;

                        return (
                            <div
                                key={s.id}
                                className={`flex flex-col justify-between p-2 sm:p-2.5 rounded-xl border transition-all duration-300 ${
                                    isFilled
                                        ? 'bg-emerald-50/90 border-emerald-300/80 shadow-xs'
                                        : isCurrent
                                            ? 'bg-[#DF7956]/12 border-2 border-[#DF7956] shadow-sm ring-2 ring-[#DF7956]/20'
                                            : 'bg-white/50 border-[#DF7956]/20 opacity-60'
                                }`}
                            >
                                {/* 1. TOP: Romaji Hint */}
                                <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono font-bold tracking-wide text-[#DF7956] mb-0.5">
                                    <span className="flex items-center gap-1">
                                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                                            isFilled ? 'bg-emerald-200 text-emerald-800' : isCurrent ? 'bg-[#DF7956] text-white' : 'bg-black/10 text-[#5C3A21]'
                                        }`}>
                                            {s.id}
                                        </span>
                                        <span>{s.romaji}</span>
                                    </span>
                                    {isFilled && (
                                        <CheckCircle2 size={14} className="text-emerald-600" />
                                    )}
                                </div>

                                {/* 2. MIDDLE: Blank Spot or Filled Kana Sentence */}
                                <div className="py-1 min-h-[30px] flex items-center">
                                    {isFilled ? (
                                        <span className={`font-bold text-sm sm:text-base text-emerald-800 tracking-wider ${isSansSerif ? 'font-sans' : 'font-serif'}`}>
                                            {s.kana}
                                        </span>
                                    ) : isCurrent ? (
                                        <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[#DF7956] tracking-wider animate-pulse">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#DF7956] inline-block animate-ping" />
                                            <span>[ _ _ _ _ _ _ _ _ _ _ ]</span>
                                        </div>
                                    ) : (
                                        <span className="text-[#5C3A21]/30 text-xs tracking-widest font-mono">
                                            [ • • • • • • • • • • ]
                                        </span>
                                    )}
                                </div>

                                {/* 3. BOTTOM: Sentence Meaning */}
                                <div className="text-[11px] sm:text-xs text-[#5C3A21]/75 italic font-medium leading-tight">
                                    {s.meaning}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Options Area: 4 Kana Choice Buttons */}
            <div className="w-full flex flex-col items-center">
                <div className="w-full flex items-center justify-between text-xs font-bold text-[#5C3A21]/80 mb-1.5 px-2">
                    <span className="flex items-center gap-1">
                        <Sparkles size={13} className="text-[#DF7956]" />
                        Pilih kalimat Kana yang tepat untuk Kalimat #{currentStep + 1}:
                    </span>
                    <span className="font-mono text-[#DF7956] text-xs">
                        {activeSentence.romaji}
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 w-full">
                    {activeSentence.options.map((opt) => {
                        const isSelected = selectedOptId === opt.id;
                        let btnStyle = "bg-white/90 border-[#DF7956]/30 hover:border-[#DF7956] hover:bg-[#DF7956]/10 text-[#5C3A21]";

                        if (isSelected) {
                            if (opt.isCorrect) {
                                btnStyle = "bg-emerald-500 border-emerald-600 text-white shadow-md scale-[1.01]";
                            } else {
                                btnStyle = "bg-rose-500 border-rose-600 text-white shadow-md";
                            }
                        }

                        return (
                            <button
                                key={opt.id}
                                onClick={() => handleSelectOption(opt)}
                                disabled={!isActive || isAnswering}
                                className={`relative flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 transition-all duration-200 shadow-xs cursor-pointer active:scale-98 text-left ${btnStyle}`}
                            >
                                <span className={`text-sm sm:text-base md:text-lg font-bold tracking-wide ${isSansSerif ? 'font-sans' : 'font-serif'}`}>
                                    {opt.kana}
                                </span>

                                {isSelected && (
                                    opt.isCorrect ? (
                                        <CheckCircle2 size={18} className="text-white shrink-0 ml-2" />
                                    ) : (
                                        <XCircle size={18} className="text-white shrink-0 ml-2 animate-bounce" />
                                    )
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TextbuilderDrill;
