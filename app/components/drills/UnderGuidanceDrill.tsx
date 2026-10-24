"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CharItem } from '../../types/kana';
import { CheckCircle2, XCircle, BookOpen, HelpCircle } from 'lucide-react';
import {
    generateUnderGuidanceQuestion,
    UnderGuidanceQuestion
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
 * Under Guidance Drill (Daishiken Quiz 3)
 * - Shows 4 guidance/reference sentences in Kana with their Indonesian meanings.
 * - Displays a question containing only the meaning.
 * - Player deduces the words by minimal pair comparison and selects the correct Kana sentence out of 4 options.
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

    const [question, setQuestion] = useState<UnderGuidanceQuestion | null>(null);
    const [selectedOptId, setSelectedOptId] = useState<string | null>(null);
    const [isAnswering, setIsAnswering] = useState(false);
    const [questionIndex, setQuestionIndex] = useState(1);

    const loadNextQuestion = useCallback(() => {
        setQuestion(generateUnderGuidanceQuestion(category));
        setSelectedOptId(null);
        setIsAnswering(false);
    }, [category]);

    useEffect(() => {
        loadNextQuestion();
    }, [loadNextQuestion]);

    const handleSelectOption = (optId: string, isCorrect: boolean) => {
        if (!isActive || isAnswering || !question) return;

        setIsAnswering(true);
        setSelectedOptId(optId);

        if (isCorrect) {
            onCorrect();
            setTimeout(() => {
                setQuestionIndex(prev => prev + 1);
                loadNextQuestion();
            }, 650);
        } else {
            onWrong();
            setTimeout(() => {
                setSelectedOptId(null);
                setIsAnswering(false);
            }, 600);
        }
    };

    if (!question) {
        return (
            <div className="flex items-center justify-center w-full h-full min-h-[350px]">
                <div className="w-8 h-8 rounded-full border-2 border-[#DF7956] border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-between w-full max-w-4xl mx-auto h-full text-[#5C3A21] px-2 sm:px-4 py-2 select-none">
            {/* Top Info Bar */}
            <div className="w-full flex items-center justify-between text-xs sm:text-sm font-bold text-[#5C3A21]/75 mb-2 px-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#DF7956]/15 text-[#DF7956] border border-[#DF7956]/30 font-mono">
                    Soal {questionIndex} / {targetScore}
                </span>
                <span className="text-xs text-[#5C3A21]/70 font-medium hidden sm:inline-block">
                    Pilih kalimat Kana yang sesuai arti
                </span>
            </div>

            {/* 4 Reference Sentences Card */}
            <div className="w-full max-w-2xl bg-white/80 backdrop-blur-md border-2 border-[#DF7956]/30 rounded-2xl p-3 sm:p-4 mb-2.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#DF7956] mb-2.5">
                    <BookOpen size={15} /> 4 Kalimat Panduan (Guidance Sentences)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                    {question.references.map((ref, idx) => (
                        <div
                            key={idx}
                            className="bg-white/90 p-2.5 sm:p-3 rounded-xl border border-[#DF7956]/20 shadow-xs"
                        >
                            <div className={`text-base sm:text-lg font-bold text-[#5C3A21] leading-snug ${isSansSerif ? 'font-sans' : 'font-serif'}`}>
                                {ref.kana}
                            </div>
                            <div className="text-xs sm:text-[13px] text-[#5C3A21]/75 mt-0.5 font-medium">
                                {ref.meaning}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Target Question Card */}
            <div className="w-full max-w-2xl bg-gradient-to-r from-[#DF7956]/15 via-white/90 to-[#DF7956]/15 border-2 border-[#DF7956] rounded-2xl p-3 sm:p-4 mb-3 text-center shadow-sm">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#DF7956] mb-1">
                    <HelpCircle size={15} /> Pertanyaan: Kalimat Kana untuk Arti Berikut
                </div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#5C3A21]">
                    "{question.questionMeaning}"
                </div>
            </div>

            {/* 4 Options Grid */}
            <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {question.options.map((opt) => {
                    const isSelected = selectedOptId === opt.id;
                    return (
                        <button
                            key={opt.id}
                            onClick={() => handleSelectOption(opt.id, opt.isCorrect)}
                            disabled={isAnswering}
                            className={`p-3 sm:p-3.5 rounded-xl border-2 transition-all duration-200 text-left flex items-center justify-between cursor-pointer ${
                                isSelected
                                    ? opt.isCorrect
                                        ? 'bg-emerald-100 border-emerald-500 text-emerald-800 scale-102 shadow-md'
                                        : 'bg-rose-100 border-rose-500 text-rose-800 scale-102 shadow-md animate-bounce'
                                    : 'bg-white/95 hover:bg-white border-[#DF7956]/30 hover:border-[#DF7956] text-[#5C3A21] shadow-sm hover:scale-101 active:scale-99'
                            }`}
                        >
                            <span className={`text-base sm:text-lg font-bold leading-snug ${isSansSerif ? 'font-sans' : 'font-serif'}`}>
                                {opt.kana}
                            </span>
                            {isSelected && (
                                opt.isCorrect
                                    ? <CheckCircle2 size={20} className="text-emerald-600 shrink-0 ml-2 animate-popup" />
                                    : <XCircle size={20} className="text-rose-600 shrink-0 ml-2 animate-popup" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default UnderGuidanceDrill;
