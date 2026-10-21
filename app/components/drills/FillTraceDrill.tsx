"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CharItem } from '../../types/kana';

interface FillTraceDrillProps {
    groupChars: CharItem[];
    onCorrect: () => void;
    onWrong: () => void;
    isSansSerif?: boolean;
    isActive?: boolean;
}

const FillTraceDrill: React.FC<FillTraceDrillProps> = ({ groupChars, onCorrect, onWrong, isSansSerif, isActive }) => {
    const sequenceLength = 5;
    const displayTime = 1000; // 1s interval

    const createNewQuestionData = useCallback((chars: CharItem[]) => {
        if (!chars || chars.length === 0) return { newSequence: [], newFillOrder: [], newOptions: [] };
        
        let pool = [...chars];
        let seq: CharItem[] = [];
        let lastKana: string | null = null;
        
        for (let i = 0; i < sequenceLength; i++) {
            let available = pool.filter(c => c.k !== lastKana);
            if (available.length === 0) available = pool; // fallback
            
            const chosen = available[Math.floor(Math.random() * available.length)];
            seq.push(chosen);
            lastKana = chosen.k;
        }

        // Random order of spots to guess
        const order = Array.from({length: sequenceLength}, (_, i) => i).sort(() => 0.5 - Math.random());
        
        // Options are all chars, grouped by original order into 3 chunks, then we shuffle the chunks.
        let uniqueChars = [...chars].filter((v, i, a) => a.findIndex(t => (t.k === v.k)) === i);

        // When pool is larger than 15 (e.g. cumulative Shiken), cap options to 15 (3 rows of 5)
        // while guaranteeing all sequence characters are included as options.
        if (uniqueChars.length > 15) {
            const seqKanas = new Set(seq.map(s => s.k));
            const seqChars = uniqueChars.filter(c => seqKanas.has(c.k));
            const distractors = uniqueChars.filter(c => !seqKanas.has(c.k)).sort(() => 0.5 - Math.random());
            const neededDistractors = 15 - seqChars.length;
            uniqueChars = [...seqChars, ...distractors.slice(0, neededDistractors)].sort(() => 0.5 - Math.random());
        }

        let rows: CharItem[][] = [];
        const chunkSize = Math.ceil(uniqueChars.length / 3);
        
        for(let i = 0; i < uniqueChars.length; i += chunkSize) {
            let rowChars = uniqueChars.slice(i, i + chunkSize);
            rowChars = rowChars.sort(() => 0.5 - Math.random());
            rows.push(rowChars);
        }
        
        // Shuffle the rows
        rows = rows.sort(() => 0.5 - Math.random());
        // Flatten back for easy mapping, or we can keep it as rows. Let's keep it as rows for precise rendering.
        
        return {
            newSequence: seq,
            newFillOrder: order,
            newOptions: rows, // now a 2D array
        };
    }, []);

    const [questionData] = useState(() => createNewQuestionData(groupChars));
    const [sequence, setSequence] = useState<CharItem[]>(questionData.newSequence);
    const [fillOrder, setFillOrder] = useState<number[]>(questionData.newFillOrder);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [options, setOptions] = useState<CharItem[][]>(questionData.newOptions);
    
    const [phase, setPhase] = useState<'memory' | 'answer'>('memory');
    const [tick, setTick] = useState<number>(0);
    const [message, setMessage] = useState<string>("Hapalkan jejaknya");
    const [wrongAttempt, setWrongAttempt] = useState(false);

    const startNextQuestion = useCallback(() => {
        const { newSequence, newFillOrder, newOptions } = createNewQuestionData(groupChars);
        setSequence(newSequence);
        setFillOrder(newFillOrder);
        setCurrentStep(0);
        setOptions(newOptions);
        setPhase('memory');
        setTick(0);
        setMessage("Hapalkan jejaknya");
        setWrongAttempt(false);
    }, [groupChars, createNewQuestionData]);

    useEffect(() => {
        if (!isActive || phase !== 'memory') return;
        if (sequence.length === 0) return;

        const timer = setTimeout(() => {
            if (tick < sequenceLength - 1) {
                setTick(prev => prev + 1);
            } else {
                setPhase('answer');
                setMessage("Isi jejak yang hilang");
            }
        }, displayTime);

        return () => clearTimeout(timer);
    }, [tick, phase, sequence.length, isActive]);

    const handleChoice = (kana: string) => {
        if (phase === 'memory' || !isActive) return;

        const targetIndex = fillOrder[currentStep];

        if (kana !== sequence[targetIndex].k) {
            onWrong();
            setPhase('memory');
            setTick(0);
            setMessage("Salah, hapalkan ulang");
            setWrongAttempt(true);
            return;
        }

        setWrongAttempt(false);
        // Correct for this spot
        if (currentStep < sequenceLength - 1) {
            setCurrentStep(prev => prev + 1);
            setMessage("Isi jejak yang hilang");
        } else {
            // All spots filled
            onCorrect();
            setMessage("Benar!");
            setTimeout(startNextQuestion, 600);
        }
    };

    if (sequence.length === 0) return <div>Loading...</div>;

    // Calculate visibility window
    // At tick 0: show index 0
    // At tick 1: show index 0,1
    // At tick 2: show index 0,1,2
    // At tick 3: show index 0,1,2,3
    // At tick 4: show index 1,2,3,4
    // etc.
    const isVisibleInMemory = (index: number) => {
        if (phase !== 'memory') return false;
        if (index > tick) return false;
        return true;
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full text-[#5C3A21] relative">
            <div className="absolute top-0 md:-top-8 w-full flex justify-center">
                <h2 className={`text-xl font-bold font-sans ${wrongAttempt ? 'text-red-500' : ''}`}>
                    {message}
                </h2>
            </div>
            
            <div className="flex flex-col items-center justify-center w-full mt-12">
                
                {/* Spots row */}
                <div className="flex justify-center items-end space-x-2 md:space-x-4 h-32 mb-16 px-4 w-full max-w-5xl overflow-x-auto hide-scrollbar">
                    {sequence.map((item, index) => {
                        const isMemoryVisible = isVisibleInMemory(index);
                        const targetIndex = fillOrder[currentStep];
                        const isAnswerTarget = phase === 'answer' && index === targetIndex;
                        const isFilled = phase === 'answer' && fillOrder.indexOf(index) < currentStep;

                        return (
                            <div 
                                key={index} 
                                className={`w-12 h-16 md:w-16 md:h-24 flex items-end justify-center pb-2 flex-shrink-0 transition-all duration-300 relative overflow-hidden rounded-t-lg
                                    ${isAnswerTarget ? 'border-b-4 border-[#C15A3D]' : 'border-b-4 border-[#C15A3D]/40'}`}
                            >
                                {isAnswerTarget && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                                )}
                                <span 
                                    className={`text-4xl md:text-5xl transition-opacity duration-300 relative z-10
                                        ${!isSansSerif ? 'font-serif' : 'font-sans'}
                                        ${isMemoryVisible || isFilled ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
                                    `}
                                >
                                    {item.k}
                                </span>
                                {/* Optional: showing question mark for target in answer phase */}
                                {isAnswerTarget && !isFilled && (
                                    <span className="absolute text-3xl opacity-30 font-sans font-bold bottom-4 animate-pulse z-10">?</span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Options (Only in answer phase) */}
                <div className={`flex flex-col items-center justify-center gap-4 w-full px-4 transition-opacity duration-500 ${phase === 'answer' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    {options.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center gap-4">
                            {row.map((opt, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleChoice(opt.k)}
                                    disabled={phase !== 'answer'}
                                    className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center hover:scale-105 active:scale-95 cursor-pointer drop-shadow-md transition-transform"
                                >
                                    <div 
                                        className="absolute inset-0 w-full h-full bg-[#FFB7A3]"
                                        style={{ 
                                            backgroundColor: 'var(--theme-petal-bg, #FFB7A3)',
                                            maskImage: 'url(/icons/shuriken.svg)', 
                                            WebkitMaskImage: 'url(/icons/shuriken.svg)', 
                                            maskSize: 'contain', 
                                            WebkitMaskSize: 'contain',
                                            maskPosition: 'center',
                                            maskRepeat: 'no-repeat',
                                        }}
                                    />
                                    <span className={`relative z-10 text-3xl md:text-4xl text-[#5C3A21] ${!isSansSerif ? 'font-serif' : 'font-sans'}`}>
                                        {opt.k}
                                    </span>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default FillTraceDrill;
