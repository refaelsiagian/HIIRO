"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CharItem } from '../../types/kana';
import { generateTheOtherOneQuestion, TheOtherOneQuestion } from '../../utils/drills/theOtherOneGenerator';

interface TheOtherOneDrillProps {
    groupChars: CharItem[];
    onCorrect: () => void;
    onWrong: () => void;
    isSansSerif?: boolean;
    isActive?: boolean;
}

/**
 * The Other One Drill (Daishiken Quiz 1)
 * Clean React View component.
 * All linguistic generation logic, anti-spoiler filters, and permutations
 * are extracted to `theOtherOneGenerator.ts`.
 */
const TheOtherOneDrill: React.FC<TheOtherOneDrillProps> = ({
    groupChars,
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

    const [question, setQuestion] = useState<TheOtherOneQuestion | null>(null);
    const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
    const [isAnswering, setIsAnswering] = useState(false);

    const loadNextQuestion = useCallback(() => {
        setQuestion(generateTheOtherOneQuestion(category));
        setSelectedSlotIndex(null);
        setSelectedOptionIndex(null);
        setIsAnswering(false);
    }, [category]);

    // Initial question load
    useEffect(() => {
        if (!question) {
            setQuestion(generateTheOtherOneQuestion(category));
        }
    }, [question, category]);

    // Handle Type 1 click (Odd-one-out)
    const handleSlotClick = (index: number, isOdd?: boolean) => {
        if (!isActive || isAnswering || !question) return;

        setIsAnswering(true);
        setSelectedSlotIndex(index);

        if (isOdd) {
            onCorrect();
            setTimeout(loadNextQuestion, 350);
        } else {
            onWrong();
            setTimeout(loadNextQuestion, 450);
        }
    };

    // Handle Type 2 click (Missing slot options)
    const handleOptionClick = (index: number, isCorrect: boolean) => {
        if (!isActive || isAnswering || !question) return;

        setIsAnswering(true);
        setSelectedOptionIndex(index);

        if (isCorrect) {
            onCorrect();
            setTimeout(loadNextQuestion, 350);
        } else {
            onWrong();
            setTimeout(loadNextQuestion, 450);
        }
    };

    if (!question) {
        return <div className="flex items-center justify-center h-full text-[#5C3A21] font-bold">Memuat...</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full text-[#5C3A21] relative px-4">
            {/* Simple instruction centered at the top */}
            <div className="text-center mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl font-bold font-sans text-[#5C3A21]">
                    {question.type === 'odd-one'
                        ? 'Pilih satu yang tidak sesuai di kelompok ini'
                        : 'Pilih satu yang sesuai dengan kelompok ini'}
                </h2>
            </div>

            {/* 5 Slots Row */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 mb-10 w-full max-w-4xl">
                {question.slots.map((slot, idx) => {
                    if (question.type === 'odd-one') {
                        const isSelected = selectedSlotIndex === idx;
                        let cardColor = "bg-white/70 hover:bg-white border-[#DF7956]/40 hover:border-[#DF7956] hover:scale-105 shadow-sm";

                        if (isSelected) {
                            cardColor = slot.isOdd
                                ? "bg-emerald-100 border-emerald-500 scale-105 shadow-md"
                                : "bg-rose-100 border-rose-500 scale-105 shadow-md animate-shake";
                        }

                        const isMultiChar = slot.kana.length > 1;
                        return (
                            <button
                                key={`${slot.kana}-${idx}`}
                                onClick={() => handleSlotClick(idx, slot.isOdd)}
                                disabled={isAnswering}
                                className={`
                                    flex items-center justify-center 
                                    w-14 h-20 sm:w-20 sm:h-28 md:w-24 md:h-32 
                                    rounded-2xl border-2 transition-all cursor-pointer select-none
                                    ${cardColor}
                                `}
                            >
                                <span className={`font-bold ${isSansSerif ? 'font-sans' : 'font-serif'} leading-none text-[#5C3A21] ${
                                    isMultiChar 
                                        ? 'text-2xl sm:text-3xl md:text-4xl tracking-tighter' 
                                        : 'text-4xl sm:text-5xl md:text-6xl'
                                }`}>
                                    {slot.kana}
                                </span>
                            </button>
                        );
                    } else {
                        // Type 2: Missing slot
                        const isBlank = slot.isBlank;
                        const filledByCorrect = isBlank && selectedOptionIndex !== null && question.options?.[selectedOptionIndex]?.isCorrect;
                        const isMultiChar = (filledByCorrect ? question.targetKana || '' : slot.kana).length > 1;

                        return (
                            <div
                                key={idx}
                                className={`
                                    flex items-center justify-center 
                                    w-14 h-20 sm:w-20 sm:h-28 md:w-24 md:h-32 
                                    rounded-2xl border-2 transition-all select-none
                                    ${isBlank
                                        ? filledByCorrect
                                            ? "bg-emerald-100 border-emerald-500 scale-105 shadow-md"
                                            : "bg-[#DF7956]/15 border-dashed border-[#DF7956]"
                                        : "bg-white/70 border-[#DF7956]/40 shadow-sm"
                                    }
                                `}
                            >
                                {isBlank ? (
                                    <span className={`font-bold ${isSansSerif ? 'font-sans' : 'font-serif'} leading-none ${
                                        filledByCorrect
                                            ? isMultiChar
                                                ? 'text-2xl sm:text-3xl md:text-4xl tracking-tighter text-emerald-700'
                                                : 'text-4xl sm:text-5xl md:text-6xl text-emerald-700'
                                            : 'text-4xl sm:text-5xl md:text-6xl text-[#DF7956]/40'
                                    }`}>
                                        {filledByCorrect ? question.targetKana : '？'}
                                    </span>
                                ) : (
                                    <span className={`font-bold ${isSansSerif ? 'font-sans' : 'font-serif'} leading-none text-[#5C3A21] ${
                                        isMultiChar 
                                            ? 'text-2xl sm:text-3xl md:text-4xl tracking-tighter' 
                                            : 'text-4xl sm:text-5xl md:text-6xl'
                                    }`}>
                                        {slot.kana}
                                    </span>
                                )}
                            </div>
                        );
                    }
                })}
            </div>

            {/* 4 Options Grid for Type 2 (Missing Slot) */}
            {question.type === 'missing-slot' && question.options && (
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 max-w-xl w-full">
                    {question.options.map((opt, idx) => {
                        const isSelected = selectedOptionIndex === idx;
                        const isOptMulti = opt.kana.length > 1;
                        let optStyle = "bg-white/80 hover:bg-white border-[#DF7956]/40 hover:border-[#DF7956] hover:scale-105 shadow-sm";

                        if (isSelected) {
                            optStyle = opt.isCorrect
                                ? "bg-emerald-100 border-emerald-500 scale-105 shadow-md"
                                : "bg-rose-100 border-rose-500 scale-105 shadow-md animate-shake";
                        }

                        return (
                            <button
                                key={`${opt.kana}-${idx}`}
                                onClick={() => handleOptionClick(idx, opt.isCorrect)}
                                disabled={isAnswering}
                                className={`
                                    flex items-center justify-center 
                                    w-16 h-20 sm:w-20 sm:h-24 md:w-24 md:h-28 
                                    rounded-2xl border-2 transition-all cursor-pointer select-none
                                    ${optStyle}
                                `}
                            >
                                <span className={`font-bold ${isSansSerif ? 'font-sans' : 'font-serif'} leading-none text-[#5C3A21] ${
                                    isOptMulti 
                                        ? 'text-2xl sm:text-3xl md:text-4xl tracking-tighter' 
                                        : 'text-3xl sm:text-4xl md:text-5xl'
                                }`}>
                                    {opt.kana}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TheOtherOneDrill;
