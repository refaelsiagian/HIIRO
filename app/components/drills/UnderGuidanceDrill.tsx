"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CharItem } from '../../types/kana';
import { Check, RotateCcw } from 'lucide-react';
import {
    generateUnderGuidanceQuestion,
    UnderGuidanceQuestion,
    GuidanceToken
} from '../../utils/drills/underGuidanceGenerator';

interface UnderGuidanceDrillProps {
    groupChars: CharItem[];
    targetScore?: number;
    onCorrect: () => void;
    onWrong: () => void;
    isSansSerif?: boolean;
    isActive?: boolean;
}

/**
 * Under Guidance Drill (Daishiken Quiz 3) - Sentence Builder
 * - Shows 4 guidance sentences (2x2) with fixed height to prevent vertical jumping.
 * - Displays a target sentence underline with the meaning underneath at a stable vertical coordinate.
 * - Provides a bank of words and particles with a reserved fixed height so row changes don't shift the Periksa button.
 * - Clicking a bank tile moves it onto the underline; clicking a placed tile returns it.
 * - Responsive to zoom and viewport scaling without layout distortion.
 */
const UnderGuidanceDrill: React.FC<UnderGuidanceDrillProps> = ({
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

    // Initialize synchronously on mount so it's already rendered during "Bersiap"
    const [question, setQuestion] = useState<UnderGuidanceQuestion | null>(() => {
        return generateUnderGuidanceQuestion(category);
    });
    const [selectedTokens, setSelectedTokens] = useState<GuidanceToken[]>([]);
    const [validationState, setValidationState] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [isAnswering, setIsAnswering] = useState(false);

    const loadNextQuestion = useCallback(() => {
        setQuestion(generateUnderGuidanceQuestion(category));
        setSelectedTokens([]);
        setValidationState('idle');
        setIsAnswering(false);
    }, [category]);

    // Handle clicking a token in the bank (to add to the sentence)
    const handleAddToken = (token: GuidanceToken) => {
        if (!isActive || isAnswering || !question) return;
        if (selectedTokens.some(t => t.id === token.id)) return;

        setSelectedTokens(prev => [...prev, token]);
        setValidationState('idle');
    };

    // Handle clicking a placed token on the underline (to return it to the bank)
    const handleRemoveToken = (indexToRemove: number) => {
        if (!isActive || isAnswering) return;

        setSelectedTokens(prev => prev.filter((_, i) => i !== indexToRemove));
        setValidationState('idle');
    };

    // Handle removing the last token
    const handleRemoveLast = () => {
        if (!isActive || isAnswering || selectedTokens.length === 0) return;

        setSelectedTokens(prev => prev.slice(0, -1));
        setValidationState('idle');
    };

    // Handle reset (clears the sentence)
    const handleReset = () => {
        if (!isActive || isAnswering) return;

        setSelectedTokens([]);
        setValidationState('idle');
    };

    // Handle checking the sentence
    const handleCheck = useCallback(() => {
        if (!isActive || isAnswering || !question) return;
        if (selectedTokens.length !== question.targetTokens.length) return;

        setIsAnswering(true);
        const selectedTexts = selectedTokens.map(t => t.text);
        const isCorrect = selectedTexts.every((text, i) => text === question.targetTokens[i]);

        if (isCorrect) {
            setValidationState('correct');
            onCorrect();
            setTimeout(() => {
                loadNextQuestion();
            }, 650);
        } else {
            setValidationState('wrong');
            onWrong();
            setTimeout(() => {
                setValidationState('idle');
                setIsAnswering(false);
            }, 650);
        }
    }, [isActive, isAnswering, question, selectedTokens, onCorrect, onWrong, loadNextQuestion]);

    // Keyboard support: Enter to submit, Backspace to remove last token
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                if (question && selectedTokens.length === question.targetTokens.length && !isAnswering) {
                    handleCheck();
                }
            } else if (e.key === 'Backspace') {
                const tag = (e.target as HTMLElement)?.tagName;
                if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
                    if (selectedTokens.length > 0 && !isAnswering) {
                        handleRemoveLast();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [question, selectedTokens, isAnswering, handleCheck]);

    if (!question) {
        return (
            <div className="flex items-center justify-center w-full h-full min-h-[350px]">
                <div className="w-8 h-8 rounded-full border-2 border-[#DF7956] border-t-transparent animate-spin" />
            </div>
        );
    }

    const selectedTokenIds = new Set(selectedTokens.map(t => t.id));
    const isReadyToCheck = selectedTokens.length === question.targetTokens.length;

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto h-full text-[#5C3A21] px-4 py-2 select-none">
            
            {/* 1. 4 Guidance Sentences (2x2 Grid with Generous Room & Clean Width) */}
            <div className="w-full max-w-3xl xl:max-w-4xl min-h-[145px] sm:min-h-[160px] flex flex-col justify-center mb-10 sm:mb-14">
                <div className="grid grid-cols-2 gap-x-10 sm:gap-x-16 gap-y-4 sm:gap-y-6 w-full text-left">
                    {question.references.map((ref, idx) => (
                        <div key={idx} className="flex flex-col">
                            <span className={`text-2xl sm:text-[28px] md:text-[28px] text-[#5C3A21] font-semibold leading-snug tracking-wide ${isSansSerif ? 'font-sans' : 'font-serif'}`}>
                                {ref.kana}
                            </span>
                            <span className="text-sm sm:text-base text-[#5C3A21]/75 mt-1 font-sans">
                                {ref.meaning}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Target Sentence Area (Placed Tiles, Underline, and Target Meaning) */}
            <div className="w-full max-w-3xl xl:max-w-4xl h-[92px] sm:h-[102px] flex flex-col justify-between mb-8 sm:mb-10">
                {/* Placed Tiles sitting on top of the Underline */}
                <div className={`h-[52px] sm:h-[58px] pb-1.5 flex flex-wrap items-end gap-2 border-b-2 transition-all duration-200 ${
                    validationState === 'correct'
                        ? 'border-emerald-500'
                        : validationState === 'wrong'
                        ? 'border-rose-500 animate-shake'
                        : 'border-[#5C3A21]/30'
                }`}>
                    {selectedTokens.length === 0 ? (
                        <span className="text-sm sm:text-base text-[#5C3A21]/25 italic py-1 select-none">
                            &nbsp;
                        </span>
                    ) : (
                        selectedTokens.map((token, idx) => (
                            <button
                                key={`${token.id}-${idx}`}
                                onClick={() => handleRemoveToken(idx)}
                                disabled={isAnswering}
                                title="Klik untuk membatalkan"
                                className={`px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl font-semibold text-lg sm:text-2xl transition-all duration-150 cursor-pointer shadow-xs active:scale-95 ${
                                    validationState === 'correct'
                                        ? 'bg-emerald-100 border border-emerald-500 text-emerald-800'
                                        : validationState === 'wrong'
                                        ? 'bg-rose-100 border border-rose-500 text-rose-800'
                                        : 'bg-white/90 hover:bg-white text-[#5C3A21] border border-[#FFB7A3]/60 hover:border-rose-400 hover:text-rose-700'
                                }`}
                            >
                                <span className={isSansSerif ? 'font-sans' : 'font-serif'}>
                                    {token.text}
                                </span>
                            </button>
                        ))
                    )}
                </div>

                {/* Target meaning directly underneath the line */}
                <div className="text-base sm:text-lg text-[#5C3A21]/85 font-medium text-left mt-1.5">
                    {question.questionMeaning}
                </div>
            </div>

            {/* 3. Bank of Words and Particles (Fixed Height so 1 vs 2 rows never shifts the button) */}
            <div className="w-full max-w-3xl xl:max-w-4xl h-[105px] sm:h-[115px] flex flex-wrap content-start items-center gap-2 sm:gap-2.5 mb-6 sm:mb-8">
                {question.bankTokens.map((token) => {
                    const isUsed = selectedTokenIds.has(token.id);
                    if (isUsed) return null; // Disappears from bank when placed on the line

                    return (
                        <button
                            key={token.id}
                            onClick={() => handleAddToken(token)}
                            disabled={isAnswering}
                            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-lg sm:text-2xl font-semibold bg-white/80 hover:bg-white text-[#5C3A21] border border-[#FFB7A3]/60 shadow-xs hover:shadow hover:scale-105 active:scale-95 cursor-pointer transition-all duration-150"
                        >
                            <span className={isSansSerif ? 'font-sans' : 'font-serif'}>
                                {token.text}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* 4. Controls: Reset and Periksa Button (Fixed Height & Anchored Center Position) */}
            <div className="relative flex items-center justify-center w-full max-w-3xl xl:max-w-4xl h-[52px] sm:h-[58px]">
                {/* Reset button positioned gracefully to the left without shifting Periksa's center */}
                <button
                    onClick={handleReset}
                    disabled={selectedTokens.length === 0 || isAnswering}
                    className={`absolute right-[calc(50%+85px)] sm:right-[calc(50%+100px)] flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs sm:text-sm text-[#5C3A21]/70 hover:text-[#5C3A21] hover:bg-black/5 transition-all cursor-pointer whitespace-nowrap ${
                        selectedTokens.length > 0 && !isAnswering ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                >
                    <RotateCcw size={15} />
                    <span>Reset</span>
                </button>

                {/* Periksa Button anchored firmly in the center */}
                <button
                    onClick={handleCheck}
                    disabled={!isReadyToCheck || isAnswering}
                    className={`flex items-center gap-2 px-9 py-2.5 sm:px-11 sm:py-3 rounded-full font-bold text-lg sm:text-xl transition-all duration-200 ${
                        isReadyToCheck && !isAnswering
                            ? 'bg-[#DF7956] text-white hover:scale-105 active:scale-95 drop-shadow-md cursor-pointer'
                            : 'bg-[#DF7956]/40 text-white/70 cursor-not-allowed scale-98'
                    }`}
                >
                    <Check size={22} strokeWidth={3} />
                    <span>Periksa</span>
                </button>
            </div>

        </div>
    );
};

export default UnderGuidanceDrill;