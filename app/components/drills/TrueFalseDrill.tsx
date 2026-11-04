"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { CharItem } from '../../types/kana';
import { Circle, X } from 'lucide-react';

interface TrueFalseProps {
    groupChars: CharItem[];
    onCorrect: () => void;
    onWrong: () => void;
    isSansSerif?: boolean;
    onToggleSansSerif?: () => void;
    isMulti?: boolean;
    isActive?: boolean;
}

const TrueFalseDrill: React.FC<TrueFalseProps> = ({ 
    groupChars, 
    onCorrect, 
    onWrong, 
    isSansSerif, 
    onToggleSansSerif, 
    isMulti = false,
    isActive = true,
}) => {
    const generateQuestion = useCallback((prevItemsList: {kana: string, romaji: string}[] = []) => {
        if (!groupChars || groupChars.length === 0) return { items: [{ kana: '?', romaji: '?' }], isTrue: true };
        
        const prevKanas = prevItemsList.map(i => i.kana);
        const prevRomajis = prevItemsList.map(i => i.romaji);

        const maxCount = Math.min(groupChars.length, isMulti ? (Math.random() > 0.5 ? 2 : 3) : 1);
        const count = Math.max(1, maxCount);
        const isTrue = Math.random() > 0.5;

        // Separate items into new (not used in prev question) and prev
        let newItems = groupChars.filter(c => !prevKanas.includes(c.k) && !prevRomajis.includes(c.r));
        if (newItems.length < count) {
            // Fallback if too strict
            newItems = groupChars.filter(c => !prevKanas.includes(c.k));
        }
        const usedPrevItems = groupChars.filter(c => !newItems.includes(c));

        const shuffledNew = [...newItems].sort(() => 0.5 - Math.random());
        const shuffledPrev = [...usedPrevItems].sort(() => 0.5 - Math.random());

        let selectedChars: CharItem[] = [];
        if (count === 1) {
            // For single item, prefer completely new
            selectedChars = shuffledNew.length >= 1 ? [shuffledNew[0]] : [shuffledPrev[0]];
        } else {
            // For multi items, allow at most 1 item from prevKanas to be reused
            let pool = [...shuffledNew];
            if (shuffledPrev.length > 0) {
                pool.push(shuffledPrev[0]); 
            }
            pool = pool.sort(() => 0.5 - Math.random());
            selectedChars = pool.slice(0, Math.min(count, pool.length));
            
            // Fallback if group is too small
            if (selectedChars.length < count) {
                const remaining = groupChars.filter(c => !selectedChars.some(sc => sc.k === c.k));
                const shuffledRemaining = [...remaining].sort(() => 0.5 - Math.random());
                selectedChars = [...selectedChars, ...shuffledRemaining].slice(0, count);
            }
        }

        const items = selectedChars.map(c => ({ kana: c.k, romaji: c.r }));

        if (!isTrue) {
            // Scramble "some" of them (between 1 and count)
            const scrambleCount = Math.floor(Math.random() * items.length) + 1;
            const indicesToScramble = [...Array(items.length).keys()].sort(() => 0.5 - Math.random()).slice(0, scrambleCount);
            
            indicesToScramble.forEach(idx => {
                const originalRomaji = selectedChars[idx].r;
                
                // Collect romajis already present in the question to prevent duplicates
                const currentDisplayedRomaji = items.map((it, i) => i === idx ? null : it.romaji).filter(Boolean);

                // Find wrong romaji that isn't the correct answer AND isn't already displayed AND isn't from previous question
                let otherItems = groupChars.filter(c => 
                    c.r !== originalRomaji && 
                    !currentDisplayedRomaji.includes(c.r) &&
                    !prevRomajis.includes(c.r)
                );
                
                if (otherItems.length === 0) {
                    otherItems = groupChars.filter(c => c.r !== originalRomaji && !currentDisplayedRomaji.includes(c.r));
                }
                if (otherItems.length === 0) {
                    otherItems = groupChars.filter(c => c.r !== originalRomaji); // Fallback: just don't be the correct answer
                }
                if (otherItems.length === 0) {
                    otherItems = groupChars; // Absolute fallback
                }
                
                items[idx].romaji = otherItems[Math.floor(Math.random() * otherItems.length)].r;
            });
        }

        return { items, isTrue };
    }, [groupChars, isMulti]);

    const [question, setQuestion] = useState(generateQuestion());

    const handleAnswer = useCallback((answer: boolean) => {
        if (!isActive) return;
        if (answer === question.isTrue) {
            onCorrect();
            setQuestion(generateQuestion(question.items));
        } else {
            onWrong();
        }
    }, [isActive, question, onCorrect, onWrong, generateQuestion]);

    // Keyboard support: O / ArrowLeft / Z for True, X / ArrowRight / C for False
    useEffect(() => {
        if (!isActive) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;
            const key = e.key.toLowerCase();
            if (key === 'o' || key === 'arrowleft' || key === 'z') {
                if (key === 'arrowleft') e.preventDefault();
                handleAnswer(true);
            } else if (key === 'x' || key === 'arrowright' || key === 'c') {
                if (key === 'arrowright') e.preventDefault();
                handleAnswer(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isActive, handleAnswer]);

    const isCompound = question.items.some(item => item.kana.length > 1);
    const itemCount = question.items.length;

    // Responsive font sizes & layout scaling depending on item count & compound characters
    let kanaTextSize = 'text-[120px] sm:text-[150px] md:text-[180px]';
    let romajiTextSize = 'text-3xl sm:text-4xl md:text-5xl';
    let gapClass = 'gap-8 md:gap-16';

    if (itemCount >= 2) {
        // Same size for 2 and 3 letters with generous horizontal space
        gapClass = itemCount === 3 ? 'gap-6 sm:gap-10 md:gap-14 lg:gap-16' : 'gap-8 sm:gap-14 md:gap-20';
        if (isCompound) {
            kanaTextSize = 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl';
            romajiTextSize = 'text-2xl sm:text-3xl md:text-4xl';
        } else {
            kanaTextSize = 'text-7xl sm:text-8xl md:text-9xl lg:text-[130px]';
            romajiTextSize = 'text-3xl sm:text-4xl md:text-5xl';
        }
    } else {
        if (isCompound) {
            kanaTextSize = 'text-[100px] sm:text-[130px] md:text-[160px]';
        }
    }

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto h-full text-[#5C3A21] relative select-none">
            {/* Question Display */}
            <div className="flex items-center justify-center w-full max-w-6xl px-2 sm:px-4 md:px-6">
                <div className={`flex items-center justify-center w-full ${gapClass}`}>
                    {question.items.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center justify-center min-w-0 flex-shrink-0">
                            <span 
                                className={`whitespace-nowrap leading-none text-[#5C3A21] mb-4 sm:mb-6 tracking-tight ${kanaTextSize} ${!isSansSerif ? 'font-serif' : 'font-sans'}`}
                            >
                                {item.kana}
                            </span>
                            <span className={`font-arbutus tracking-wider text-[#5C3A21] ${romajiTextSize}`}>
                                {item.romaji}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Answer Buttons (Check Truth styling) */}
            <div className="flex items-center justify-center space-x-8 sm:space-x-12 md:space-x-16 mt-12 sm:mt-16 md:mt-20">
                <button
                    onClick={() => handleAnswer(true)}
                    disabled={!isActive}
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 bg-[#FFB7A3] text-[#5C3A21] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform drop-shadow-md cursor-pointer"
                    aria-label="True"
                >
                    <Circle className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11" strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => handleAnswer(false)}
                    disabled={!isActive}
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 bg-[#FFB7A3] text-[#5C3A21] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform drop-shadow-md cursor-pointer"
                    aria-label="False"
                >
                    <X className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12" strokeWidth={2.5} />
                </button>
            </div>

            {/* Sans-serif toggle */}
            {onToggleSansSerif && (
                <button 
                    onClick={onToggleSansSerif}
                    className="flex items-center text-[#5C3A21] opacity-60 hover:opacity-100 transition-opacity font-outfit text-sm sm:text-base mt-8 sm:mt-10"
                >
                    <div className="w-4 h-4 rounded-full border border-[#5C3A21] mr-2 flex items-center justify-center">
                        {isSansSerif && <div className="w-2 h-2 rounded-full bg-[#5C3A21]" />}
                    </div>
                    Ganti ke sans-serif
                </button>
            )}
        </div>
    );
};

export default TrueFalseDrill;
