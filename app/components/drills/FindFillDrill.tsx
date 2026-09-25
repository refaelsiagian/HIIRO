"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { CharItem } from '../../types/kana';
import { ChevronsLeft, ChevronLeft, Ban, ChevronRight, ChevronsRight } from 'lucide-react';

interface FindFillDrillProps {
    groupChars: CharItem[];
    onCorrect: () => void;
    onWrong: () => void;
    isSansSerif?: boolean;
    onToggleSansSerif?: () => void;
    isActive?: boolean;
}

const FindFillDrill: React.FC<FindFillDrillProps> = ({ groupChars, onCorrect, onWrong, isSansSerif, isActive }) => {
    const capacity = groupChars.length;

    const generatePrefilledBoard = useCallback(() => {
        // Pick 2 or 3 random unique characters from groupChars
        // If capacity is smaller (e.g. 3 for ya yu yo), pick 1 or 2
        let count = Math.floor(Math.random() * 2) + 2; // 2 or 3
        if (capacity < 4) count = 1; 

        const shuffled = [...groupChars].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }, [groupChars, capacity]);

    const generateQuestion = useCallback((currentBoards: CharItem[][], currentHidden: boolean[], previousCharRomaji?: string) => {
        if (!groupChars || groupChars.length === 0) return null;
        
        let availableChars = [...groupChars];
        
        // Filter out characters that exist in ALL current boards
        if (currentBoards.length === 4) {
            availableChars = groupChars.filter(char => {
                // Is this char missing from AT LEAST one NON-HIDDEN board?
                return currentBoards.some((board, idx) => !currentHidden[idx] && !board.some(c => c.r === char.r));
            });
            
            // Fallback just in case (should not happen since boards clear at 5)
            if (availableChars.length === 0) {
                availableChars = [...groupChars];
            }
        }

        // Prevent consecutive same characters if possible
        if (previousCharRomaji && availableChars.length > 1) {
            const filtered = availableChars.filter(c => c.r !== previousCharRomaji);
            if (filtered.length > 0) {
                availableChars = filtered;
            }
        }

        const char = availableChars[Math.floor(Math.random() * availableChars.length)];
        
        const isMismatch = Math.random() < 0.2; // 20% mismatch
        let romaji = char.r;
        
        if (isMismatch && groupChars.length > 1) {
            let options = groupChars.filter(c => c.r !== char.r);
            romaji = options[Math.floor(Math.random() * options.length)].r;
        }

        return { char, romaji, isMatch: !isMismatch };
    }, [groupChars]);

    const [boards, setBoards] = useState<CharItem[][]>([]);
    const [hiddenBoards, setHiddenBoards] = useState<boolean[]>([false, false, false, false]);
    const [question, setQuestion] = useState(generateQuestion([], [false, false, false, false]));

    useEffect(() => {
        if (boards.length === 0) {
            const initialBoards = [
                generatePrefilledBoard(),
                generatePrefilledBoard(),
                generatePrefilledBoard(),
                generatePrefilledBoard()
            ];
            setBoards(initialBoards);
            setQuestion(generateQuestion(initialBoards, [false, false, false, false]));
        }
    }, [boards.length, generatePrefilledBoard, generateQuestion]);

    const handleAction = (actionType: 'discard' | number) => {
        if (!isActive || !question) return;

        let newBoards = [...boards];
        let newHidden = [...hiddenBoards];

        // If any board is hidden (cleared previously), restore it FIRST
        for (let i = 0; i < 4; i++) {
            if (newHidden[i]) {
                newBoards[i] = generatePrefilledBoard();
                newHidden[i] = false;
            }
        }

        if (actionType === 'discard') {
            if (!question.isMatch) {
                // Correct discard
                setBoards(newBoards);
                setHiddenBoards(newHidden);
                setQuestion(generateQuestion(newBoards, newHidden, question.char.r));
            } else {
                // Wrong discard
                onWrong();
            }
        } else {
            const boardIndex = actionType;
            const targetBoard = boards[boardIndex]; 
            
            if (hiddenBoards[boardIndex]) {
                return; // Ignore clicks on disappeared boards
            }

            if (!question.isMatch) {
                // Sent a mismatch to a board! Wrong!
                onWrong();
            } else {
                // Sent a match to a board
                if (targetBoard.some(c => c.r === question.char.r)) {
                    // Board already has this letter
                    onWrong();
                } else {
                    // Correct placement!
                    newBoards[boardIndex] = [...targetBoard, question.char];
                    
                    if (newBoards[boardIndex].length >= capacity) {
                        // Board completed!
                        setBoards(newBoards); // Show the completed board briefly
                        setHiddenBoards(newHidden); // Commit any restored boards!
                        
                        // We simulate the board being hidden for the next question generation
                        const futureHidden = [...newHidden];
                        futureHidden[boardIndex] = true;
                        setQuestion(generateQuestion(newBoards, futureHidden, question.char.r));
                        
                        setTimeout(() => {
                            onCorrect(); // Increment global progress
                            
                            // Use functional state update to prevent stale closures if player clicked rapidly
                            setHiddenBoards(prevHidden => {
                                const nextHidden = [...prevHidden];
                                nextHidden[boardIndex] = true;
                                return nextHidden;
                            });
                        }, 500);
                        
                        return; // Early return to prevent normal state update below
                    } else {
                        // Just added a piece
                        setBoards(newBoards);
                        setHiddenBoards(newHidden);
                        setQuestion(generateQuestion(newBoards, newHidden, question.char.r));
                    }
                }
            }
        }
    };

    if (!question || boards.length < 4) return <div>Loading...</div>;

    const renderBoard = (board: CharItem[], index: number) => {
        const isHidden = hiddenBoards[index];

        return (
            <div key={index} className={`relative w-[100px] h-[400px] md:w-[120px] md:h-[500px] flex justify-center items-center transition-all duration-500 ${isHidden ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                {/* Board SVG */}
                <div 
                    className="absolute inset-0 w-full h-full bg-[#FFB7A3]"
                    style={{ 
                        maskImage: 'url(/icons/board.svg)', 
                        WebkitMaskImage: 'url(/icons/board.svg)', 
                        maskSize: '100% 100%', 
                        WebkitMaskSize: '100% 100%',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat'
                    }}
                />
                
                {/* Slots */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-12 md:py-16">
                    {Array.from({ length: capacity }).map((_, slotIdx) => {
                        const isFilled = slotIdx < board.length;
                        return (
                            <div key={slotIdx} className="w-12 h-12 flex items-center justify-center">
                                {isFilled ? (
                                    <span className={`text-4xl md:text-5xl text-[#5C3A21] ${!isSansSerif ? 'font-serif' : 'font-sans'}`}>
                                        {board[slotIdx].k}
                                    </span>
                                ) : (
                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#C15A3D] rounded-sm transform rotate-45 opacity-80" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full text-[#5C3A21] relative">
            <div className="absolute top-0 md:-top-8 w-full flex justify-center">
                <h2 className="text-xl font-bold font-sans">Tentukan letaknya</h2>
            </div>
            
            <div className="flex w-full items-center justify-center mt-12 gap-8 md:gap-16">
                
                {/* Left Boards */}
                <div className="flex space-x-2 md:space-x-6">
                    {renderBoard(boards[0], 0)}
                    {renderBoard(boards[1], 1)}
                </div>

                {/* Center Control */}
                <div className="flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center justify-center h-[300px]">
                        <span className={`text-[120px] md:text-[180px] leading-none text-[#5C3A21] ${!isSansSerif ? 'font-serif' : 'font-sans'}`}>
                            {question.char.k}
                        </span>
                        <span className="text-4xl md:text-5xl font-arbutus text-[#5C3A21] mt-8">
                            {question.romaji}
                        </span>
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-4 md:space-x-6 mt-24">
                        {[
                            { action: 0, icon: <ChevronsLeft size={28} /> },
                            { action: 1, icon: <ChevronLeft size={28} /> },
                            { action: 'discard', icon: <Ban size={24} strokeWidth={2.5} /> },
                            { action: 2, icon: <ChevronRight size={28} /> },
                            { action: 3, icon: <ChevronsRight size={28} /> },
                        ].map((btn, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleAction(btn.action as any)} 
                                className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 drop-shadow-md cursor-pointer"
                            >
                                <div 
                                    className="absolute inset-0 w-full h-full bg-[#FFB7A3]"
                                    style={{ 
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
                                <span className="relative z-10 text-[#5C3A21]">
                                    {btn.icon}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Boards */}
                <div className="flex space-x-2 md:space-x-6">
                    {renderBoard(boards[2], 2)}
                    {renderBoard(boards[3], 3)}
                </div>

            </div>
        </div>
    );
};

export default FindFillDrill;
