"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CharItem } from '../../types/kana';
import { ChevronsLeft, ChevronLeft, Ban, ChevronRight, ChevronsRight } from 'lucide-react';
import charsDataRaw from '../../data/chars.json';
import groupsDataRaw from '../../data/groups.json';

interface FindFillMugenDrillProps {
    groupChars: CharItem[];
    onCorrect: () => void;
    onWrong: () => void;
    isSansSerif?: boolean;
    isActive?: boolean;
    bonusSeconds?: number;
    addBonusTime?: (seconds?: number) => void;
}

interface BoardDefinition {
    id: string;
    name: string;
    subName: string;
    type: 'gyo' | 'dan';
    chars: { k: string; r: string }[];
    bgColor: string;
    accentColor: string;
}

interface RawChar {
    char: string;
    category: string;
    romaji: string;
    consonant?: string;
    vowel?: string;
    group?: string;
}

interface RawGroup {
    id: string;
    display_name: string;
    subtitle_kanji?: string;
    category: string;
    char_member: string[];
    type?: string;
}

// 2 brown color versions for Find & Fill Mugen:
// Normal (Gyo / Row): Light board (#FFB7A3) with dark diamond slots (#C15A3D)
// Reverse (Dan / Column): Dark board (#C15A3D) with light diamond slots (#FFB7A3)
const COLOR_NORMAL = { bg: '#FFB7A3', slot: '#C15A3D', text: '#5C3A21' };
const COLOR_REVERSE = { bg: '#C15A3D', slot: '#FFB7A3', text: '#FFFFFF' };

export const FindFillMugenDrill: React.FC<FindFillMugenDrillProps> = ({
    groupChars,
    onCorrect,
    onWrong,
    isSansSerif,
    isActive = true,
    bonusSeconds,
    addBonusTime,
}) => {
    // Detect category (hiragana or katakana)
    const category = useMemo<'hiragana' | 'katakana'>(() => {
        if (groupChars && groupChars.length > 0 && (groupChars[0] as any).category) {
            return (groupChars[0] as any).category as 'hiragana' | 'katakana';
        }
        const first = groupChars?.[0]?.k || '';
        return /[\u30A0-\u30FF]/.test(first) ? 'katakana' : 'hiragana';
    }, [groupChars]);

    // Build all available board templates dynamically from chars.json and groups.json
    // Includes all category letters: Gojūon, Dakuon & Handakuon, Yōon, and Specials
    const availableBoardTemplates = useMemo<BoardDefinition[]>(() => {
        const allCategoryChars = (charsDataRaw as RawChar[]).filter(c => c.category === category);
        // Exclude union groups (yw-gyo, tw-special) from Gyo boards so they are only tested via Dan (vowel) boards
        const catGroups = (groupsDataRaw as RawGroup[]).filter(
            g => g.category === category && g.char_member && g.char_member.length === 5 && g.id !== 'yw-gyo' && g.id !== 'tw-special'
        );

        // 1. Gyō boards (pure single-row 5-char families: Gojuon + Dakuon/Handakuon + V-Series)
        const gyoBoards: BoardDefinition[] = catGroups.map(g => {
            const chars = g.char_member.map(k => {
                const found = allCategoryChars.find(c => c.char === k);
                return { k, r: found ? found.romaji : '' };
            });
            return {
                id: g.id,
                name: g.display_name,
                subName: g.display_name,
                type: 'gyo',
                chars,
                bgColor: '',
                accentColor: '',
            };
        });

        // 2. Dan boards (all 5 vowel columns containing all characters of that vowel: Gojūon + Dakuon + Yōon + Specials)
        const VOWELS = ['a', 'i', 'u', 'e', 'o'];
        const DAN_NAMES_HIRAGANA: Record<string, string> = {
            a: 'あ段', i: 'い段', u: 'う段', e: 'え段', o: 'お段'
        };
        const DAN_NAMES_KATAKANA: Record<string, string> = {
            a: 'ア段', i: 'イ段', u: 'ウ段', e: 'エ段', o: 'オ段'
        };

        const danBoards: BoardDefinition[] = VOWELS.map(v => {
            const chars = allCategoryChars
                .filter(c => c.vowel === v)
                .map(c => ({ k: c.char, r: c.romaji }));
            return {
                id: `${v}-dan`,
                name: category === 'katakana' ? DAN_NAMES_KATAKANA[v] : DAN_NAMES_HIRAGANA[v],
                subName: `${v.toUpperCase()}-dan`,
                type: 'dan',
                chars,
                bgColor: '',
                accentColor: '',
            };
        });

        return [...gyoBoards, ...danBoards];
    }, [category]);

    // Active 4 boards on screen
    interface ActiveBoard {
        template: BoardDefinition;
        currentChars: { k: string; r: string }[];
        bgColor: string;
        accentColor: string;
    }

    const createBoardInstance = useCallback((template: BoardDefinition): ActiveBoard => {
        // Pre-fill 2 or 3 random unique characters from this set
        const count = Math.min(template.chars.length, Math.floor(Math.random() * 2) + 2); // 2 or 3
        const shuffled = [...template.chars].sort(() => 0.5 - Math.random());
        const prefilled = shuffled.slice(0, count);
        const isReverse = template.type === 'dan';

        return {
            template,
            currentChars: prefilled,
            bgColor: isReverse ? COLOR_REVERSE.bg : COLOR_NORMAL.bg,
            accentColor: isReverse ? COLOR_REVERSE.slot : COLOR_NORMAL.slot,
        };
    }, []);

    const [activeBoards, setActiveBoards] = useState<ActiveBoard[]>([]);
    const [hiddenBoards, setHiddenBoards] = useState<boolean[]>([false, false, false, false]);

    // Reset boards if category changes
    useEffect(() => {
        setActiveBoards([]);
        setQuestion(null);
        setHiddenBoards([false, false, false, false]);
        completedCountsRef.current = { gyo: 0, dan: 0 };
    }, [category]);

    // Pick 4 initial unique board templates: 2 gyo (normal) and 2 dan (reverse)
    // Symmetrical layout: Board 0 (Outer Left = Gyō), Board 1 (Inner Left = Dan), Board 2 (Inner Right = Dan), Board 3 (Outer Right = Gyō)
    useEffect(() => {
        if (activeBoards.length === 0 && availableBoardTemplates.length > 0) {
            const gyoPool = availableBoardTemplates.filter(t => t.type === 'gyo').sort(() => 0.5 - Math.random());
            const danPool = availableBoardTemplates.filter(t => t.type === 'dan').sort(() => 0.5 - Math.random());
            const picked = [
                createBoardInstance(gyoPool[0]),
                createBoardInstance(danPool[0]),
                createBoardInstance(danPool[1]),
                createBoardInstance(gyoPool[1]),
            ];
            setActiveBoards(picked);
        }
    }, [activeBoards.length, availableBoardTemplates, createBoardInstance]);

    // Parity Tracker: ensures Gyo and Dan complete at an equal rate
    const completedCountsRef = useRef<{ gyo: number; dan: number }>({ gyo: 0, dan: 0 });

    // Question State
    interface QuestionData {
        char: { k: string; r: string };
        displayRomaji: string;
        targetBoardIndex: number; // -1 if mismatch or doesn't belong
        isMismatch: boolean;
    }

    const generateQuestion = useCallback((
        boards: ActiveBoard[], 
        hidden: boolean[], 
        previousRomaji?: string
    ): QuestionData | null => {
        if (boards.length < 4) return null;

        // Collect missing characters separated by board type (gyo vs dan)
        const gyoCandidates: { char: { k: string; r: string }; boardIndex: number }[] = [];
        const danCandidates: { char: { k: string; r: string }; boardIndex: number }[] = [];

        boards.forEach((b, bIdx) => {
            if (hidden[bIdx] || b.currentChars.length >= 5) return;
            const targetList = b.template.type === 'gyo' ? gyoCandidates : danCandidates;
            b.template.chars.forEach(c => {
                if (!b.currentChars.some(existing => existing.k === c.k)) {
                    targetList.push({ char: c, boardIndex: bIdx });
                }
            });
        });

        // Dynamic Parity Balancer:
        // Dan has 13-26 total characters vs Gyo's 5, meaning Dan can absorb more characters.
        // Overlapping characters (e.g. ku in ka-gyo and u-dan) can be placed into either board.
        // If Dan has completed more boards than Gyo, aggressively prioritize Gyo (85%).
        // If Gyo is ahead, boost Dan (65%). If tied, favor Gyo (65%) to neutralize Dan's natural pool advantage.
        const gyoCompleted = completedCountsRef.current.gyo;
        const danCompleted = completedCountsRef.current.dan;

        let gyoWeight = 0.65;
        if (danCompleted > gyoCompleted) {
            gyoWeight = 0.85;
        } else if (gyoCompleted > danCompleted) {
            gyoWeight = 0.35;
        }

        const chooseGyo = Math.random() < gyoWeight;
        let pool: { char: { k: string; r: string }; boardIndex: number }[] = [];

        if (chooseGyo && gyoCandidates.length > 0) {
            // When Dan is ahead or Gyo is chosen, prefer Gyo candidates that CANNOT be stolen by active Dan boards
            const activeDanBoards = boards.filter((b, idx) => !hidden[idx] && b.template.type === 'dan');
            const exclusiveGyo = gyoCandidates.filter(c => 
                !activeDanBoards.some(db => db.template.chars.some(tc => tc.k === c.char.k))
            );
            pool = exclusiveGyo.length > 0 ? exclusiveGyo : gyoCandidates;
        } else if (!chooseGyo && danCandidates.length > 0) {
            pool = danCandidates;
        } else {
            pool = gyoCandidates.length > 0 ? gyoCandidates : danCandidates;
        }

        if (pool.length === 0) return null;

        // Avoid immediate consecutive identical question if multiple options exist
        let eligibleCandidates = pool;
        if (previousRomaji && pool.length > 1) {
            const nonRepeat = pool.filter(c => c.char.r !== previousRomaji);
            if (nonRepeat.length > 0) {
                eligibleCandidates = nonRepeat;
            }
        }

        const isMismatch = Math.random() < 0.22; // 22% mismatch chance
        const selectedCandidate = eligibleCandidates[Math.floor(Math.random() * eligibleCandidates.length)];
        let displayRomaji = selectedCandidate.char.r;

        if (isMismatch) {
            // Pick a wrong romaji from the full category pool
            const allCategoryChars = (charsDataRaw as RawChar[]).filter(c => c.category === category);
            const poolChars = allCategoryChars.length > 0 
                ? allCategoryChars 
                : (groupChars.length > 0 ? groupChars.map(c => ({ char: c.k, romaji: c.r })) : [{ char: 'a', romaji: 'a' }]);
            const wrongOptions = poolChars.filter(c => c.romaji !== selectedCandidate.char.r);
            if (wrongOptions.length > 0) {
                displayRomaji = wrongOptions[Math.floor(Math.random() * wrongOptions.length)].romaji;
            }
        }

        return {
            char: selectedCandidate.char,
            displayRomaji,
            targetBoardIndex: isMismatch ? -1 : selectedCandidate.boardIndex,
            isMismatch,
        };
    }, [category, groupChars]);

    const [question, setQuestion] = useState<QuestionData | null>(null);

    useEffect(() => {
        if (!question && activeBoards.length === 4) {
            setQuestion(generateQuestion(activeBoards, hiddenBoards));
        }
    }, [question, activeBoards, hiddenBoards, generateQuestion]);

    const handleAction = (actionType: 'discard' | number) => {
        if (!isActive || !question || activeBoards.length < 4) return;

        let nextBoards = [...activeBoards];
        let nextHidden = [...hiddenBoards];

        // 1. If any board was hidden from earlier completion, replace with new board of same type
        for (let i = 0; i < 4; i++) {
            if (nextHidden[i]) {
                const targetType = nextBoards[i].template.type;
                const usedIds = new Set(nextBoards.map(b => b.template.id));
                const remainingTemplates = availableBoardTemplates.filter(t => t.type === targetType && !usedIds.has(t.id));
                const pool = remainingTemplates.length > 0 ? remainingTemplates : availableBoardTemplates.filter(t => t.type === targetType);
                const newTmpl = pool[Math.floor(Math.random() * pool.length)];
                nextBoards[i] = createBoardInstance(newTmpl);
                nextHidden[i] = false;
            }
        }

        if (actionType === 'discard') {
            if (question.isMismatch) {
                // Correct discard! (No board completed, advance to next question)
                setActiveBoards(nextBoards);
                setHiddenBoards(nextHidden);
                setQuestion(generateQuestion(nextBoards, nextHidden, question.char.r));
            } else {
                // Wrong discard (it was a valid placement!)
                onWrong();
            }
        } else {
            const boardIndex = actionType;
            if (hiddenBoards[boardIndex]) return;

            if (question.isMismatch) {
                // Placed a mismatch into a board! Wrong!
                onWrong();
                return;
            }

            const targetBoard = nextBoards[boardIndex];
            const belongsToBoard = targetBoard.template.chars.some(c => c.k === question.char.k);
            const alreadyInBoard = targetBoard.currentChars.some(c => c.k === question.char.k);

            if (belongsToBoard && !alreadyInBoard) {
                // Correct placement!
                const updatedChars = [...targetBoard.currentChars, question.char];
                nextBoards[boardIndex] = { ...targetBoard, currentChars: updatedChars };

                if (updatedChars.length >= 5) {
                    // BOARD FULLY COMPLETED! Increment completion tracker
                    completedCountsRef.current[targetBoard.template.type]++;

                    // Award score point per completed board!
                    onCorrect();

                    // Bonus time!
                    if (addBonusTime) {
                        addBonusTime(bonusSeconds);
                    }

                    setActiveBoards(nextBoards);
                    setHiddenBoards(nextHidden);

                    const futureHidden = [...nextHidden];
                    futureHidden[boardIndex] = true;
                    setQuestion(generateQuestion(nextBoards, futureHidden, question.char.r));

                    setTimeout(() => {
                        setHiddenBoards(prev => {
                            const nh = [...prev];
                            nh[boardIndex] = true;
                            return nh;
                        });
                    }, 450);
                    return;
                } else {
                    setActiveBoards(nextBoards);
                    setHiddenBoards(nextHidden);
                    setQuestion(generateQuestion(nextBoards, nextHidden, question.char.r));
                }
            } else {
                // Wrong placement!
                onWrong();
            }
        }
    };

    if (!question || activeBoards.length < 4) {
        return <div className="text-xl font-outfit opacity-60">Bersiap...</div>;
    }

    const renderBoard = (board: ActiveBoard, index: number) => {
        const isHidden = hiddenBoards[index];
        const isReverse = board.template.type === 'dan';
        const boardBg = isReverse ? COLOR_REVERSE.bg : COLOR_NORMAL.bg;
        const slotBg = isReverse ? COLOR_REVERSE.slot : COLOR_NORMAL.slot;
        const textColor = isReverse ? COLOR_REVERSE.text : COLOR_NORMAL.text;

        return (
            <button
                key={index}
                onClick={() => handleAction(index)}
                disabled={!isActive || isHidden}
                className={`relative w-[100px] h-[400px] md:w-[120px] md:h-[500px] flex justify-center items-center transition-all duration-500 cursor-pointer hover:scale-[1.02] active:scale-95 ${
                    isHidden ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
                }`}
                title={`Papan ${index + 1}`}
            >
                {/* Authentic board.svg mask with 2 brown color versions */}
                <div 
                    className="absolute inset-0 w-full h-full"
                    style={{ 
                        backgroundColor: boardBg,
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
                    {Array.from({ length: 5 }).map((_, slotIdx) => {
                        const isFilled = slotIdx < board.currentChars.length;
                        const charItem = isFilled ? board.currentChars[slotIdx] : null;
                        const isCompound = charItem ? charItem.k.length > 1 : false;

                        return (
                            <div key={slotIdx} className="w-full px-1 h-12 flex items-center justify-center">
                                {isFilled && charItem ? (
                                    <span 
                                        className={`whitespace-nowrap leading-none select-none ${
                                            isCompound 
                                                ? 'text-2xl sm:text-3xl md:text-[32px] tracking-tight' 
                                                : 'text-4xl md:text-5xl'
                                        } ${!isSansSerif ? 'font-serif' : 'font-sans'}`}
                                        style={{ color: textColor }}
                                    >
                                        {charItem.k}
                                    </span>
                                ) : (
                                    <div 
                                        className="w-8 h-8 md:w-10 md:h-10 rounded-sm transform rotate-45 opacity-80" 
                                        style={{ backgroundColor: slotBg }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </button>
        );
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full text-[#5C3A21] relative select-none -translate-y-6 sm:-translate-y-8 md:-translate-y-10">
            {/* Title / Instruction */}
            <div className="w-full flex justify-center mb-2 md:mb-3">
                <h2 className="text-lg md:text-xl font-bold font-sans opacity-90">
                    Tentukan letaknya
                </h2>
            </div>
            
            <div className="flex w-full items-center justify-center gap-6 sm:gap-8 md:gap-14 lg:gap-16">
                {/* Left 2 Boards */}
                <div className="flex space-x-2 md:space-x-6">
                    {renderBoard(activeBoards[0], 0)}
                    {renderBoard(activeBoards[1], 1)}
                </div>

                {/* Center Control */}
                <div className="flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center justify-center h-[260px] md:h-[300px]">
                        <span 
                            className={`whitespace-nowrap select-none leading-none text-[#5C3A21] ${
                                question.char.k.length > 1
                                    ? 'text-[90px] sm:text-[120px] md:text-[150px]'
                                    : 'text-[120px] md:text-[180px]'
                            } ${!isSansSerif ? 'font-serif' : 'font-sans'}`}
                        >
                            {question.char.k}
                        </span>
                        <span className="text-4xl md:text-5xl font-arbutus text-[#5C3A21] mt-6 md:mt-8">
                            {question.displayRomaji}
                        </span>
                    </div>

                    {/* Action Buttons using shuriken.svg */}
                    <div className="flex space-x-3 sm:space-x-4 md:space-x-6 mt-14 md:mt-18">
                        {[
                            { action: 0, icon: <ChevronsLeft size={28} />, title: "Papan 1 (Kiri Luar)" },
                            { action: 1, icon: <ChevronLeft size={28} />, title: "Papan 2 (Kiri Dalam)" },
                            { action: 'discard', icon: <Ban size={24} strokeWidth={2.5} />, title: "Buang / Mismatch" },
                            { action: 2, icon: <ChevronRight size={28} />, title: "Papan 3 (Kanan Dalam)" },
                            { action: 3, icon: <ChevronsRight size={28} />, title: "Papan 4 (Kanan Luar)" },
                        ].map((btn, idx) => {
                            const isDiscard = btn.action === 'discard';
                            const targetBoard = typeof btn.action === 'number' ? activeBoards[btn.action] : null;
                            const isReverse = targetBoard?.template.type === 'dan';

                            const shurikenBg = isDiscard ? '#FFB7A3' : (isReverse ? COLOR_REVERSE.bg : COLOR_NORMAL.bg);
                            const iconColor = isDiscard ? '#C15A3D' : (isReverse ? COLOR_REVERSE.text : COLOR_NORMAL.text);

                            return (
                                <button 
                                    key={idx}
                                    onClick={() => handleAction(btn.action as any)} 
                                    disabled={!isActive}
                                    title={btn.title}
                                    className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 drop-shadow-md cursor-pointer"
                                >
                                    <div 
                                        className="absolute inset-0 w-full h-full"
                                        style={{ 
                                            backgroundColor: shurikenBg,
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
                                    <span className="relative z-10" style={{ color: iconColor }}>
                                        {btn.icon}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right 2 Boards */}
                <div className="flex space-x-2 md:space-x-6">
                    {renderBoard(activeBoards[2], 2)}
                    {renderBoard(activeBoards[3], 3)}
                </div>
            </div>
        </div>
    );
};

export default FindFillMugenDrill;
