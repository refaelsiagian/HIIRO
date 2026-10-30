"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CharItem } from '../../types/kana';
import { ChevronsUp, ChevronsDown, Check, RotateCcw } from 'lucide-react';
import {
    generateTextbuilderStory,
    generateRoundPills,
    TextbuilderStory,
    TextbuilderSentence,
    TextbuilderWordPill
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
 * Textbuilder Drill (Daishiken Quiz 4) - Sentence Builder
 * - 8-sentence passage with romaji guide on top, blank slot in middle, and meaning below.
 * - Word pills generated from a random target sentence + confusable distractors + other story words.
 * - Player inspects the pills, determines which sentence matches, and selects it in the passage.
 * - When selected, romaji and meaning appear in the fixed textfield.
 * - Player constructs the sentence with pills, then presses "Periksa".
 * - When solved, pills are transferred into the text passage as completed Kana!
 * - Passage is scrollable with subtle flickering indicator arrows and hidden scrollbars.
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

    // 1. Story session state
    const [story, setStory] = useState<TextbuilderStory | null>(() => {
        return generateTextbuilderStory(category);
    });

    const [solvedSentenceIds, setSolvedSentenceIds] = useState<Set<number>>(new Set());

    // 2. Active target sentence (the one for which current pills are generated)
    const [targetSentenceId, setTargetSentenceId] = useState<number | null>(() => {
        if (!story || story.sentences.length === 0) return null;
        const initialIdx = Math.floor(Math.random() * story.sentences.length);
        return story.sentences[initialIdx].id;
    });

    // 3. Bank pills for current round
    const [roundPills, setRoundPills] = useState<TextbuilderWordPill[]>(() => {
        if (!story || story.sentences.length === 0) return [];
        const initialTarget = story.sentences.find(s => s.id === (targetSentenceId || 1)) || story.sentences[0];
        return generateRoundPills(initialTarget, story.sentences);
    });

    // 4. Selected sentence in the passage by the player
    const [selectedSentenceId, setSelectedSentenceId] = useState<number | null>(null);

    // 5. Placed pills on the underline
    const [selectedPills, setSelectedPills] = useState<TextbuilderWordPill[]>([]);

    // 6. Feedback & answering lock
    const [validationState, setValidationState] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [isAnswering, setIsAnswering] = useState(false);
    const [hintAlert, setHintAlert] = useState(false);

    // Scroll state for passage container
    const passageRef = useRef<HTMLDivElement>(null);
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(false);

    const checkScroll = useCallback(() => {
        const el = passageRef.current;
        if (!el) return;
        const { scrollTop, scrollHeight, clientHeight } = el;
        setCanScrollUp(scrollTop > 10);
        setCanScrollDown(scrollTop + clientHeight < scrollHeight - 10);
    }, []);

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [checkScroll, story]);

    // Active target sentence object
    const currentTargetSentence = useMemo<TextbuilderSentence | null>(() => {
        if (!story || targetSentenceId === null) return null;
        return story.sentences.find(s => s.id === targetSentenceId) || null;
    }, [story, targetSentenceId]);

    // Active player-selected sentence object
    const selectedSentence = useMemo<TextbuilderSentence | null>(() => {
        if (!story || selectedSentenceId === null) return null;
        return story.sentences.find(s => s.id === selectedSentenceId) || null;
    }, [story, selectedSentenceId]);

    // When player clicks an unsolved sentence in the passage
    const handleSelectSentence = (sentence: TextbuilderSentence) => {
        if (!isActive || isAnswering) return;
        if (solvedSentenceIds.has(sentence.id)) return;

        if (selectedSentenceId !== sentence.id) {
            setSelectedSentenceId(sentence.id);
            // Reset placed pills if switching to a different sentence
            setSelectedPills([]);
            setValidationState('idle');
            setHintAlert(false);
        }
    };

    // When player clicks a pill in the bank
    const handleAddPill = (pill: TextbuilderWordPill) => {
        if (!isActive || isAnswering) return;

        if (selectedSentenceId === null) {
            // Prompt player to choose matching sentence first
            setHintAlert(true);
            setTimeout(() => setHintAlert(false), 1200);
            return;
        }

        if (selectedPills.some(p => p.id === pill.id)) return;

        setSelectedPills(prev => [...prev, pill]);
        setValidationState('idle');
    };

    // When player clicks a placed pill on the underline (returns to bank)
    const handleRemovePill = (indexToRemove: number) => {
        if (!isActive || isAnswering) return;

        setSelectedPills(prev => prev.filter((_, i) => i !== indexToRemove));
        setValidationState('idle');
    };

    // Reset placed pills back to bank
    const handleReset = () => {
        if (!isActive || isAnswering) return;

        setSelectedPills([]);
        setValidationState('idle');
    };

    // Check / Submit sentence
    const handleCheck = useCallback(() => {
        if (!isActive || isAnswering || !currentTargetSentence || !story) return;
        if (selectedSentenceId === null || selectedPills.length === 0) return;

        setIsAnswering(true);

        const isCorrectSentence = selectedSentenceId === currentTargetSentence.id;
        const selectedSentenceText = selectedPills.map(p => p.text).join('');
        const targetSentenceText = currentTargetSentence.tokens.join('');
        const isCorrectTokens = selectedSentenceText === targetSentenceText;

        if (isCorrectSentence && isCorrectTokens) {
            // Correct!
            setValidationState('correct');
            onCorrect();

            setTimeout(() => {
                const nextSolved = new Set(solvedSentenceIds);
                nextSolved.add(currentTargetSentence.id);
                setSolvedSentenceIds(nextSolved);

                // Check if all 8 sentences are solved
                if (nextSolved.size >= story.sentences.length) {
                    setIsAnswering(false);
                    return;
                }

                // Pick next random unsolved sentence
                const remaining = story.sentences.filter(s => !nextSolved.has(s.id));
                const nextTarget = remaining[Math.floor(Math.random() * remaining.length)];

                setTargetSentenceId(nextTarget.id);
                setRoundPills(generateRoundPills(nextTarget, story.sentences));
                setSelectedSentenceId(null);
                setSelectedPills([]);
                setValidationState('idle');
                setIsAnswering(false);
            }, 600);
        } else {
            // Wrong!
            setValidationState('wrong');
            onWrong();

            setTimeout(() => {
                setValidationState('idle');
                setIsAnswering(false);
            }, 650);
        }
    }, [
        isActive,
        isAnswering,
        currentTargetSentence,
        story,
        selectedSentenceId,
        selectedPills,
        solvedSentenceIds,
        onCorrect,
        onWrong
    ]);

    // Keyboard support: Enter to submit, Backspace to remove last pill
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                if (selectedSentenceId !== null && selectedPills.length > 0 && !isAnswering) {
                    handleCheck();
                }
            } else if (e.key === 'Backspace') {
                const tag = (e.target as HTMLElement)?.tagName;
                if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
                    if (selectedPills.length > 0 && !isAnswering) {
                        setSelectedPills(prev => prev.slice(0, -1));
                        setValidationState('idle');
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedSentenceId, selectedPills, isAnswering, handleCheck]);

    if (!story) return null;

    const selectedPillIds = new Set(selectedPills.map(p => p.id));
    const targetLength = currentTargetSentence ? currentTargetSentence.tokens.length : 0;
    const isReadyToCheck = selectedSentenceId !== null && selectedPills.length === targetLength;

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto h-full text-[#5C3A21] px-4 py-1 select-none">
            
            {/* 1. Story Passage Container (Open literary page layout with left vertical margin line) */}
            <div className="relative w-full max-w-3xl xl:max-w-4xl mb-5 sm:mb-10">
                
                {/* Flickering Top Arrow */}
                {canScrollUp && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center justify-center animate-bounce">
                        <ChevronsUp size={20} className="text-[#DF7956]/70 drop-shadow-xs" />
                    </div>
                )}

                {/* The 8 Sentences Passage - Inline text flow across the full row */}
                <div
                    ref={passageRef}
                    onScroll={checkScroll}
                    className="max-h-[220px] sm:max-h-[250px] md:max-h-[280px] overflow-y-auto hide-scrollbar border-l-5 border-[#DF7956] pl-4 sm:pl-6 py-2"
                >
                    <div className="flex flex-wrap items-start gap-x-6 sm:gap-x-2 gap-y-4 sm:gap-y-4">
                        {story.sentences.map((s) => {
                            const isSolved = solvedSentenceIds.has(s.id);
                            const isSelected = selectedSentenceId === s.id;

                            return (
                                <div
                                    key={s.id}
                                    onClick={() => handleSelectSentence(s)}
                                    className={`group inline-flex flex-col justify-start transition-all duration-200 rounded-xl p-2 max-w-full ${
                                        isSolved
                                            ? 'cursor-default hover:bg-[#7D4E94]/8'
                                            : isSelected
                                            ? 'cursor-pointer'
                                            : 'cursor-pointer hover:bg-[#7D4E94]/10'
                                    }`}
                                >
                                    {isSolved ? (
                                        /* 1. Solved State: Full Kana text in big font + meaning below */
                                        <div className="flex flex-col">
                                            <div className={`text-lg sm:text-xl md:text-2xl font-semibold text-[#5C3A21] leading-snug tracking-wide break-words ${isSansSerif ? 'font-sans' : 'font-serif'}`}>
                                                {s.tokens.join(' ')}
                                            </div>
                                            <div className="text-xs sm:text-sm md:text-base text-[#5C3A21] mt-2 font-normal leading-tight">
                                                {s.meaning}
                                            </div>
                                        </div>
                                    ) : isSelected ? (
                                        /* 2. Chosen State: Romaji on warm gradient bar with bottom orange underline + meaning below */
                                        <div className="flex flex-col">
                                            <div className="px-3 py-1 bg-gradient-to-t from-[#DF7956]/25 via-[#DF7956]/10 to-transparent border-b-2 border-[#DF7956] rounded-t-md flex items-center min-h-[34px] sm:min-h-[38px] min-w-[170px] sm:min-w-[210px]">
                                                <span className="font-arbutus text-sm sm:text-base md:text-lg font-medium text-[#8A513B] tracking-wide break-all">
                                                    {s.romaji}
                                                </span>
                                            </div>
                                            <div className="text-xs sm:text-sm md:text-base text-[#5C3A21]/80 mt-1 font-normal px-1 leading-tight">
                                                {s.meaning}
                                            </div>
                                        </div>
                                    ) : (
                                        /* 3. Unsolved State: Romaji on subtle underline + meaning below */
                                        <div className="flex flex-col">
                                            <div className="px-3 py-1 border-b-2 border-[#CC6E34] flex items-center min-h-[34px] sm:min-h-[38px] min-w-[170px] sm:min-w-[210px]">
                                                <span className="font-arbutus text-sm sm:text-base md:text-lg italic font-medium text-[#5C3A21]/70 tracking-wide break-all">
                                                    {s.romaji}
                                                </span>
                                            </div>
                                            <div className="text-xs sm:text-sm md:text-base text-[#5C3A21] mt-1 font-normal leading-tight">
                                                {s.meaning}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Flickering Bottom Arrow */}
                {canScrollDown && (
                    <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center justify-center animate-bounce">
                        <ChevronsDown size={20} className="text-[#DF7956]/70 drop-shadow-xs" />
                    </div>
                )}
            </div>

            {/* 2. Target Sentence Textfield Area (Fixed Height: Romaji on top, Underline in middle, Meaning below) */}
            <div className="w-full max-w-3xl xl:max-w-4xl h-[135px] sm:h-[145px] flex flex-col justify-between mb-4 sm:mb-6">
                
                {/* Top: Romaji guide of selected sentence */}
                <div className="text-sm sm:text-base md:text-xl font-arbutus font-medium tracking-wide text-left flex items-center justify-between">
                    {selectedSentence ? (
                        <span className="text-[#8A513B]">
                            {selectedSentence.romaji}
                        </span>
                    ) : (
                        <span className={`transition-colors duration-300 ${hintAlert ? 'text-rose-600' : 'text-[#5C3A21]'}`}>
                            {hintAlert ? 'Pilih kalimat terlebih dahulu' : 'Pilih kalimat yang cocok dengan kata-kata yang tersedia'}
                        </span>
                    )}
                </div>

                {/* Middle: Placed Pills on top of the Underline */}
                <div className={`min-h-[60px] sm:min-h-[68px] pb-2 flex flex-wrap items-end gap-2 border-b-2 transition-all duration-200 ${
                    validationState === 'correct'
                        ? 'border-emerald-500'
                        : validationState === 'wrong'
                        ? 'border-rose-500 animate-shake'
                        : 'border-[#5C3A21]/30'
                }`}>
                    {selectedPills.length === 0 ? (
                        <span className="text-xs sm:text-sm md:text-base text-[#5C3A21]/35 italic py-1 select-none">
                            {selectedSentence ? 'Ketuk kata-kata di bawah untuk menyusun...' : '\u00A0'}
                        </span>
                    ) : (
                        selectedPills.map((pill, idx) => (
                            <button
                                key={`${pill.id}-${idx}`}
                                onClick={() => handleRemovePill(idx)}
                                disabled={isAnswering}
                                title="Klik untuk membatalkan"
                                className={`px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-xl font-semibold text-base sm:text-lg md:text-2xl transition-all duration-150 cursor-pointer shadow-xs active:scale-95 ${
                                    validationState === 'correct'
                                        ? 'bg-emerald-100 border border-emerald-500 text-emerald-800'
                                        : validationState === 'wrong'
                                        ? 'bg-rose-100 border border-rose-500 text-rose-800'
                                        : 'bg-white/95 hover:bg-white text-[#5C3A21] border border-[#FFB7A3]/60 hover:border-rose-400 hover:text-rose-700'
                                }`}
                            >
                                <span className={isSansSerif ? 'font-sans' : 'font-serif'}>
                                    {pill.text}
                                </span>
                            </button>
                        ))
                    )}
                </div>

                {/* Bottom: Meaning of selected sentence */}
                <div className="text-sm sm:text-base md:text-lg text-[#5C3A21]/80 font-medium text-left leading-relaxed pt-1.5 sm:pt-2">
                    {selectedSentence ? selectedSentence.meaning : '\u00A0'}
                </div>
            </div>

            {/* 3. Word Pills Bank (Fixed Height so row changes don't shift layout) */}
            <div className="w-full max-w-3xl xl:max-w-4xl h-[100px] sm:h-[110px] flex flex-wrap content-start items-center gap-2 sm:gap-2.5 mb-4 sm:mb-6">
                {roundPills.map((pill) => {
                    const isUsed = selectedPillIds.has(pill.id);
                    if (isUsed) return null; // Disappears from bank when placed on the line

                    return (
                        <button
                            key={pill.id}
                            onClick={() => handleAddPill(pill)}
                            disabled={isAnswering}
                            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-base sm:text-lg md:text-2xl font-semibold bg-white/80 hover:bg-white text-[#5C3A21] border border-[#FFB7A3]/60 shadow-xs hover:shadow hover:scale-105 active:scale-95 cursor-pointer transition-all duration-150"
                        >
                            <span className={isSansSerif ? 'font-sans' : 'font-serif'}>
                                {pill.text}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* 4. Controls: Reset and Periksa Button */}
            <div className="relative flex items-center justify-center w-full max-w-3xl xl:max-w-4xl h-[56px] sm:h-[62px]">
                {/* Reset button positioned gracefully to the left without shifting Periksa's center */}
                <button
                    onClick={handleReset}
                    disabled={selectedPills.length === 0 || isAnswering}
                    className={`absolute right-[calc(50%+90px)] sm:right-[calc(50%+110px)] flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-xs sm:text-sm text-[#5C3A21]/70 hover:text-[#5C3A21] hover:bg-black/5 transition-all cursor-pointer whitespace-nowrap ${
                        selectedPills.length > 0 && !isAnswering ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                >
                    <RotateCcw size={16} />
                    <span>Reset</span>
                </button>

                {/* Periksa Button anchored firmly in the center */}
                <button
                    onClick={handleCheck}
                    disabled={!isReadyToCheck || isAnswering}
                    className={`flex items-center gap-2 px-10 py-2.5 sm:px-12 sm:py-3.5 rounded-full font-bold text-lg sm:text-xl transition-all duration-200 ${
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

export default TextbuilderDrill;
