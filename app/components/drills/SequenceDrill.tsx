"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { CharItem } from '../../types/kana';

interface SequenceDrillProps {
    groupChars: CharItem[];
    onCorrect: () => void;
    onWrong: () => void;
    isSansSerif?: boolean;
    onToggleSansSerif?: () => void;
    isMulti?: boolean;
    isActive?: boolean;
    level?: number;
}

const SequenceDrill: React.FC<SequenceDrillProps> = ({ groupChars, onCorrect, onWrong, isSansSerif, isActive, level = 1 }) => {
    const sequenceLength = level === 2 ? 5 : 3;
    const displayTime = level === 2 ? 800 : 1200;

    const createNewQuestionData = useCallback((chars: CharItem[]) => {
        // Fallback for empty groups
        if (!chars || chars.length === 0) return { newSequence: [], newOptions: [] };
        
        let seq: CharItem[] = [];

        if (level === 2) {
            // Level 2: Characters may repeat in the sequence, but not immediately adjacent
            let lastChar: string | null = null;
            for (let i = 0; i < sequenceLength; i++) {
                let available = chars.filter(c => c.r !== lastChar);
                if (available.length === 0) available = chars;
                
                const chosen = available[Math.floor(Math.random() * available.length)];
                seq.push(chosen);
                lastChar = chosen.r;
            }
        } else {
            // Level 1: Characters DO NOT repeat in the sequence (must be unique)
            let availablePool = [...chars];
            for (let i = 0; i < sequenceLength; i++) {
                if (availablePool.length === 0) {
                    // Fallback only if the group itself has fewer characters than sequenceLength (e.g. Wa-gyo with 2 chars)
                    const lastChosen = seq[seq.length - 1]?.r;
                    availablePool = chars.filter(c => c.r !== lastChosen);
                    if (availablePool.length === 0) availablePool = [...chars];
                }
                
                const randIndex = Math.floor(Math.random() * availablePool.length);
                const chosen = availablePool[randIndex];
                seq.push(chosen);
                availablePool.splice(randIndex, 1);
            }
        }
        
        // Options are ALL chars from the group, shuffled
        let optionsPool = [...chars];
        // If the group is small, we duplicate to have at least 3 options
        while (optionsPool.length < 3) {
            optionsPool = [...optionsPool, ...chars];
        }
        
        const options = optionsPool.sort(() => 0.5 - Math.random());
        return {
            newSequence: seq,
            newOptions: options,
        };
    }, [level, sequenceLength]);

    const [initialData] = useState(() => createNewQuestionData(groupChars));
    const [sequence, setSequence] = useState<CharItem[]>(initialData.newSequence);
    const [options, setOptions] = useState<CharItem[]>(initialData.newOptions);
    const [displayIndex, setDisplayIndex] = useState<number>(0);
    const [isDisplaying, setIsDisplaying] = useState<boolean>(true);
    const [userInput, setUserInput] = useState<string[]>([]);
    const [message, setMessage] = useState<string>("Hapalkan urutannya");

    const startNextQuestion = useCallback(() => {
        const { newSequence, newOptions } = createNewQuestionData(groupChars);
        setSequence(newSequence);
        setOptions(newOptions);
        setUserInput([]);
        setIsDisplaying(true);
        setDisplayIndex(0);
        setMessage("Hapalkan urutannya");
    }, [groupChars, createNewQuestionData]);

    useEffect(() => {
        if (!isDisplaying || !isActive) return;
        if (sequence.length === 0) return;

        const timer = setTimeout(() => {
            if (displayIndex < sequenceLength - 1) {
                setDisplayIndex(prev => prev + 1);
            } else {
                setIsDisplaying(false);
                setMessage("Pilih sesuai urutan");
                setDisplayIndex(sequenceLength);
            }
        }, displayTime);

        return () => clearTimeout(timer);
    }, [displayIndex, isDisplaying, sequence.length, isActive, sequenceLength, displayTime]);

    const handleChoice = (romaji: string) => {
        if (isDisplaying) return;

        const currentIndex = userInput.length;
        if (romaji !== sequence[currentIndex].r) {
            onWrong();
            // Reset this sequence attempt
            setUserInput([]);
            setIsDisplaying(true);
            setDisplayIndex(0);
            setMessage("Salah, hapalkan ulang");
            return;
        }

        const nextInput = [...userInput, romaji];
        setUserInput(nextInput);

        if (nextInput.length === sequenceLength) {
            onCorrect();
            setMessage("Benar!");
            setTimeout(startNextQuestion, 600);
        }
    };

    if (sequence.length === 0) return <div>No data</div>;

    return (
        <div className="flex flex-col items-center justify-center w-full h-full text-[#5C3A21] relative">
            {/* Absolute positioning keeps the message stuck in place */}
            <div className="absolute top-0 md:-top-8 w-full flex justify-center">
                <h2 className="text-xl font-bold font-sans">{message}</h2>
            </div>
            
            <div className="flex flex-col items-center justify-center min-h-[350px] w-full mt-12">
                {isDisplaying ? (
                    <div className="flex items-center justify-center h-48">
                        {displayIndex < sequenceLength && (
                            <span className={`text-[240px] leading-none ${!isSansSerif ? 'font-serif' : 'font-sans'}`}>
                                {sequence[displayIndex].k}
                            </span>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Blanks for answers */}
                        <div className="flex justify-center space-x-8 mb-16 h-24 items-end">
                            {sequence.map((item, index) => {
                                const isAnswered = index < userInput.length;
                                const answeredRomaji = userInput[index];
                                const answeredItem = sequence.find(s => s.r === answeredRomaji);
                                
                                return (
                                    <div 
                                        key={index} 
                                        className={`w-20 flex items-end justify-center pb-2 h-20 ${!isAnswered ? 'border-b-4 border-[#C15A3D]' : ''}`}
                                    >
                                        {isAnswered && answeredItem && (
                                            <span className={`text-6xl ${!isSansSerif ? 'font-serif' : 'font-sans'}`}>{answeredItem.k}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Shuriken Options */}
                        <div className="flex flex-wrap justify-center gap-6 max-w-3xl">
                            {options.map((opt, index) => {
                                const isUsed = level === 2 ? false : userInput.includes(opt.r);
                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleChoice(opt.r)}
                                        disabled={isUsed}
                                        className={`relative w-24 h-24 flex items-center justify-center transition-all
                                            ${isUsed ? 'opacity-0 pointer-events-none scale-95' : 'hover:scale-105 active:scale-95 cursor-pointer drop-shadow-xl'}`}
                                    >
                                        {/* Shuriken Background Mask */}
                                        <div 
                                            className="absolute inset-0 w-full h-full bg-[#FFB7A3]"
                                            style={{ 
                                                backgroundColor: 'var(--theme-petal-bg, #FFB7A3)',
                                                maskImage: 'url(/icons/shuriken.svg)', 
                                                WebkitMaskImage: 'url(/icons/shuriken.svg)', 
                                                maskSize: 'contain', 
                                                WebkitMaskSize: 'contain',
                                                maskPosition: 'center',
                                                WebkitMaskPosition: 'center',
                                                maskRepeat: 'no-repeat',
                                                WebkitMaskRepeat: 'no-repeat'
                                            }}
                                        />
                                        {/* Text on top */}
                                        <span className="relative z-10 text-3xl font-arbutus text-[#5C3A21] mt-1">
                                            {opt.r}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SequenceDrill;