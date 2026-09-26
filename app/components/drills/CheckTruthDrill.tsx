"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { CharItem } from '../../types/kana';
import { Circle, X } from 'lucide-react';

interface CheckTruthDrillProps {
    groupChars: CharItem[];
    onCorrect: () => void;
    onWrong: () => void;
    isSansSerif?: boolean;
    isActive?: boolean;
}

const getStatementText = (count: number, isSalah: boolean): string => {
    const isZero = count === 0;
    const isAll = count === 6;

    if (isZero) {
        return isSalah 
            ? (Math.random() < 0.5 ? "Semua pasangan benar" : "Tidak ada pasangan yang salah")
            : (Math.random() < 0.5 ? "Semua pasangan salah" : "Tidak ada pasangan yang benar");
    }
    if (isAll) {
        return isSalah 
            ? (Math.random() < 0.5 ? "Semua pasangan salah" : "Tidak ada pasangan yang benar")
            : (Math.random() < 0.5 ? "Semua pasangan benar" : "Tidak ada pasangan yang salah");
    }
    
    return `${count} pasangan ${isSalah ? 'salah' : 'benar'}`;
};

const CheckTruthDrill: React.FC<CheckTruthDrillProps> = ({ groupChars, onCorrect, onWrong, isSansSerif, isActive }) => {
    const generateQuestion = useCallback(() => {
        if (!groupChars || groupChars.length === 0) return null;
        
        let pool = [...groupChars];
        // Ensure we have at least 6 characters in the pool by duplicating if necessary
        while (pool.length < 6) {
            pool = [...pool, ...groupChars];
        }
        
        // Pick 6 random characters for the pairs
        const shuffled = pool.sort(() => 0.5 - Math.random());
        const selectedChars = shuffled.slice(0, 6);
        
        // Generate pairs (with some being mismatches)
        const pairs = selectedChars.map(char => {
            const isMismatch = Math.random() < 0.4; // 40% chance of mismatch
            let romaji = char.r;
            if (isMismatch && groupChars.length > 1) {
                let options = groupChars.filter(c => c.r !== char.r);
                romaji = options[Math.floor(Math.random() * options.length)].r;
            }
            return {
                kana: char.k,
                romaji: romaji,
                isMatch: char.r === romaji
            };
        });

        const wrongCount = pairs.filter(p => !p.isMatch).length;
        const correctCount = 6 - wrongCount;

        const isStatementTrue = Math.random() < 0.5;
        const talkAboutSalah = Math.random() < 0.5;

        let statementCount = 0;
        if (isStatementTrue) {
            statementCount = talkAboutSalah ? wrongCount : correctCount;
        } else {
            // Generate a false count, usually +/- 1
            const trueCount = talkAboutSalah ? wrongCount : correctCount;
            const diff = Math.random() < 0.5 ? 1 : -1;
            statementCount = trueCount + diff;
            
            // Clamp to 0-6
            if (statementCount < 0) statementCount = 1;
            if (statementCount > 6) statementCount = 5;
            
            // If it somehow matches trueCount, adjust again
            if (statementCount === trueCount) {
                statementCount = trueCount === 6 ? 5 : trueCount + 1;
            }
        }

        const statementText = getStatementText(statementCount, talkAboutSalah);

        return {
            pairs,
            statementText,
            isStatementTrue
        };
    }, [groupChars]);

    const [question, setQuestion] = useState(() => generateQuestion());

    useEffect(() => {
        if (isActive && !question) {
            setQuestion(generateQuestion());
        }
    }, [isActive, question, generateQuestion]);

    const handleAnswer = (userAnswer: boolean) => {
        if (!isActive || !question) return;

        if (userAnswer === question.isStatementTrue) {
            onCorrect();
            setQuestion(generateQuestion());
        } else {
            onWrong();
        }
    };

    if (!question) return <div>Loading...</div>;

    return (
        <div className="flex flex-col items-center justify-center w-full h-full text-[#5C3A21] relative">
            <div className="absolute top-0 md:-top-8 w-full flex justify-center">
                <h2 className="text-xl font-bold font-sans">Periksa kebenarannya</h2>
            </div>

            <div className="flex flex-col items-center justify-center mt-12 w-full max-w-4xl px-4">
                
                {/* 6 Pairs Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 w-full mb-12">
                    {question.pairs.map((pair, idx) => (
                        <div key={idx} className="flex flex-col items-center justify-center bg-white/20 p-6 rounded-lg drop-shadow-sm border-2 border-[#FFB7A3]/30">
                            <span className={`text-7xl md:text-8xl text-[#5C3A21] ${!isSansSerif ? 'font-serif' : 'font-sans'}`}>
                                {pair.kana}
                            </span>
                            <span className="text-3xl font-arbutus text-[#5C3A21] mt-4">
                                {pair.romaji}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Statement */}
                <div className="mb-10 text-center">
                    <p className="text-2xl md:text-3xl font-bold">"{question.statementText}"</p>
                </div>

                {/* Buttons */}
                <div className="flex space-x-8 md:space-x-12">
                    <button 
                        onClick={() => handleAnswer(true)}
                        className="w-20 h-20 md:w-24 md:h-24 bg-[#FFB7A3] text-[#5C3A21] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform drop-shadow-md cursor-pointer"
                    >
                        <Circle size={48} strokeWidth={2.5} />
                    </button>
                    
                    <button 
                        onClick={() => handleAnswer(false)}
                        className="w-20 h-20 md:w-24 md:h-24 bg-[#FFB7A3] text-[#5C3A21] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform drop-shadow-md cursor-pointer"
                    >
                        <X size={56} strokeWidth={2.5} />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CheckTruthDrill;
