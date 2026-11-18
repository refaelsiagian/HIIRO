"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../../store/useGameStore';
import { Pause, Heart, ArrowLeft, Ban, Clock } from 'lucide-react';
import { CountdownOverlay } from './overlays/CountdownOverlay';
import { PostGameOverlay } from './overlays/PostGameOverlay';
import { PauseOverlay } from './overlays/PauseOverlay';
import { getTierTheme } from '../../data/theme/tierThemes';

interface DrillEngineProps {
    category: string;
    section: string;
    groupId: string;
    stageId: string;
    mode?: string;
    maxTime: number; // e.g. 60
    maxLives: number; // e.g. 3
    targetScore: number; // How many correct answers to win
    engineMode?: 'standard' | 'endless';
    bonusTime?: {
        everyAnswers?: number;
        addSeconds: number;
        description?: string;
    };
    starThresholds?: [number, number, number];
    rulesPreset?: 'standard' | 'endless';
    children: (props: {
        onCorrect: () => void;
        onWrong: () => void;
        isSansSerif: boolean;
        onToggleSansSerif: () => void;
        isActive?: boolean;
        addBonusTime?: (seconds?: number) => void;
    }) => React.ReactNode;
    onClose: (postGameData?: any) => void;
    isSansSerif: boolean;
    onToggleSansSerif: () => void;
}

const DrillEngine: React.FC<DrillEngineProps> = ({
    category,
    section,
    groupId,
    stageId,
    mode,
    maxTime,
    maxLives,
    targetScore,
    engineMode = 'standard',
    bonusTime,
    starThresholds,
    rulesPreset,
    children,
    onClose,
    isSansSerif,
    onToggleSansSerif
}) => {
    const isEndless = engineMode === 'endless';
    const thresholds: [number, number, number] = starThresholds || [20, 40, 60];

    const { completeStage, failStage, petals, highestPetals } = useGameStore();
    const currentPetals = petals[category]?.[section]?.[groupId]?.[stageId] || 0;
    const stageHighestPetals = highestPetals?.[category]?.[section]?.[groupId]?.[stageId] || currentPetals;

    const [timeLeft, setTimeLeft] = useState(maxTime);
    const [lives, setLives] = useState(maxLives);
    const [score, setScore] = useState(0);
    const scoreRef = useRef(0);
    const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
    const [starsEarned, setStarsEarned] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [hasPaused, setHasPaused] = useState(false);
    const [isClosingOverlay, setIsClosingOverlay] = useState(false);
    const [resetKey, setResetKey] = useState(0);
    const [bonusNotification, setBonusNotification] = useState<{ id: number; text: string } | null>(null);

    const triggerBonusTime = useCallback((seconds?: number) => {
        const bonusAmount = seconds !== undefined ? seconds : (bonusTime?.addSeconds ?? 5);
        setTimeLeft(prev => prev + bonusAmount);
        setBonusNotification({ id: Date.now(), text: `+${bonusAmount}s` });
        setTimeout(() => {
            setBonusNotification(null);
        }, 1200);
    }, [bonusTime?.addSeconds]);

    const cat = (category === 'katakana' ? 'katakana' : 'hiragana') as 'hiragana' | 'katakana';
    const theme = getTierTheme(cat, groupId);
    const room = theme.room;
    const isFinal = groupId.startsWith('daishiken');
    const finalRoom = getTierTheme(cat, 'daishiken').room;
    const activeRoom = isFinal ? finalRoom : room;

    useEffect(() => {
        if (gameState === 'ready') {
            const t1 = setTimeout(() => {
                setIsClosingOverlay(true);
            }, 1100);
            const t2 = setTimeout(() => {
                setGameState('playing');
                setIsClosingOverlay(false);
            }, 1500);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        }

        if (gameState !== 'playing' || isPaused) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, isPaused]);

    const handleGameOver = useCallback((success: boolean) => {
        setGameState('finished');

        if (isEndless) {
            let stars = 0;
            if (score >= thresholds[2]) stars = 3;
            else if (score >= thresholds[1]) stars = 2;
            else if (score >= thresholds[0]) stars = 1;

            setStarsEarned(stars);
            if (stars >= 1) {
                completeStage(category, section, groupId, stageId, stars, score);
            } else {
                failStage(category, section, groupId, stageId);
            }
        } else {
            if (!success) {
                failStage(category, section, groupId, stageId);
                setStarsEarned(0);
            } else {
                let stars = 0;
                const timeThreshold = maxTime >= 30 ? 15 : maxTime / 2;
                
                if (success) stars += 1;
                if (lives === maxLives) stars += 1;
                if (timeLeft >= timeThreshold) stars += 1;

                setStarsEarned(stars);
                completeStage(category, section, groupId, stageId, stars, score);
            }
        }
    }, [isEndless, thresholds, category, section, groupId, stageId, maxLives, maxTime, score, lives, timeLeft, failStage, completeStage]);

    useEffect(() => {
        if (gameState !== 'playing') return;

        if (isEndless) {
            if (lives <= 0 || timeLeft <= 0) {
                handleGameOver(false);
            }
        } else {
            if (score >= targetScore) {
                handleGameOver(true);
            } else if (lives <= 0 || timeLeft <= 0) {
                handleGameOver(false);
            }
        }
    }, [score, lives, timeLeft, targetScore, gameState, isEndless, handleGameOver]);

    const handleCorrect = useCallback(() => {
        if (gameState !== 'playing') return;
        const nextScore = scoreRef.current + 1;
        scoreRef.current = nextScore;
        setScore(nextScore);

        if (isEndless && bonusTime?.everyAnswers && nextScore % bonusTime.everyAnswers === 0) {
            triggerBonusTime(bonusTime.addSeconds);
        }
    }, [gameState, isEndless, bonusTime, triggerBonusTime]);

    const handleWrong = useCallback(() => {
        if (gameState !== 'playing') return;
        setLives(prev => prev - 1);
    }, [gameState]);


    const handleFinishedClose = () => {
        setIsClosingOverlay(true);
        setTimeout(() => {
            onClose();
        }, 220);
    };

    const handleFinishedReload = () => {
        // Reset all state instantly
        scoreRef.current = 0;
        setTimeLeft(maxTime);
        setLives(maxLives);
        setScore(0);
        setStarsEarned(0);
        setIsPaused(false);
        setHasPaused(false);
        setGameState('ready');
        setIsClosingOverlay(false);
        setResetKey(prev => prev + 1);
    };



    return (
        <div 
            className="min-h-screen p-6 font-sans flex flex-col items-center justify-between relative overflow-hidden"
            style={{
                background: 'transparent',
                color: activeRoom.fontColor,
                '--theme-plate-bg': activeRoom.plateBg,
                '--theme-plate-border': activeRoom.plateBorder,
                '--theme-font-color': activeRoom.fontColor,
                '--theme-star-color': activeRoom.starColor,
                '--theme-petal-bg': activeRoom.petalBg,
                '--theme-letter-highlight': activeRoom.letterHighlight,
            } as React.CSSProperties}
        >
            
            {/* TOP HUD */}
            <div className="w-full relative flex flex-col items-center pt-8">
                {/* Pause Button */}
                <button 
                    onClick={() => {
                        if (!hasPaused) {
                            setIsPaused(true);
                            setHasPaused(true);
                        }
                    }}
                    disabled={hasPaused}
                    className={`absolute top-8 right-8 md:right-12 transition-opacity flex items-center justify-center w-12 h-12 ${hasPaused ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-70'}`}
                    style={{ color: activeRoom.fontColor }}
                >
                    <Pause size={36} fill="currentColor" strokeWidth={0} />
                    {hasPaused && (
                        <Ban size={44} className="absolute text-red-500" strokeWidth={4} />
                    )}
                </button>
                
                {/* Hearts */}
                <div className="flex space-x-2 mb-2">
                    {[...Array(maxLives)].map((_, i) => (
                        <Heart 
                            key={i} 
                            className={`w-8 h-8 ${i < lives ? 'fill-red-600 text-red-600' : 'text-red-200/50'}`} 
                        />
                    ))}
                </div>
                
                {/* Center Value: Score in Endless Mode, Timer in Standard Mode */}
                {isEndless ? (
                    <div 
                        className="font-outfit text-[44px] leading-none"
                        style={{ color: activeRoom.fontColor }}
                    >
                        {score}
                    </div>
                ) : (
                    <div 
                        className="font-outfit text-[44px] leading-none"
                        style={{ color: activeRoom.fontColor }}
                    >
                        {timeLeft}
                    </div>
                )}
                
                {/* Progress Bar Container */}
                <div className="w-full max-w-[400px] mt-4 relative">
                    <div className="w-full h-3 bg-black/10 rounded-full overflow-hidden relative">
                        <div 
                            className={`h-full rounded-full transition-all duration-300 ease-out ${
                                isEndless && timeLeft <= 10 ? 'bg-red-500 animate-pulse' : ''
                            }`}
                            style={{ 
                                width: isEndless
                                    ? `${Math.min(100, Math.max(0, (timeLeft / maxTime) * 100))}%`
                                    : `${Math.min(100, (score / targetScore) * 100)}%`,
                                backgroundColor: isEndless && timeLeft <= 10 ? undefined : activeRoom.fontColor,
                            }}
                        />
                    </div>

                    {/* ENDLESS HUD: Clock-like timer with seconds under progress bar on the right */}
                    {isEndless && (
                        <div 
                            className="flex items-center justify-end mt-1.5 font-outfit text-sm font-semibold tracking-wide"
                            style={{ color: activeRoom.fontColor }}
                        >
                            <Clock size={16} className={`mr-1.5 ${timeLeft <= 10 ? 'text-red-500 animate-bounce' : 'opacity-80'}`} />
                            <span className={timeLeft <= 10 ? 'text-red-500 font-bold' : 'opacity-90'}>
                                {timeLeft}s
                            </span>
                        </div>
                    )}

                    {/* Floating Bonus Time Notification */}
                    {bonusNotification && (
                        <div 
                            key={bonusNotification.id}
                            className="absolute -top-7 right-0 text-emerald-600 font-outfit font-black text-xl animate-bounce drop-shadow-sm pointer-events-none"
                        >
                            {bonusNotification.text}
                        </div>
                    )}
                </div>
            </div>

            {/* Game Content */}
            <div key={resetKey} className="w-full max-w-6xl 2xl:max-w-7xl pb-6 flex-1 flex flex-col items-center justify-center relative">
                {children({ 
                    onCorrect: handleCorrect, 
                    onWrong: handleWrong, 
                    isSansSerif, 
                    onToggleSansSerif,
                    isActive: gameState === 'playing' && !isPaused,
                    addBonusTime: triggerBonusTime,
                })}
            </div>

            {/* PAUSE MODAL */}
            {isPaused && (
                <PauseOverlay 
                    onContinue={() => setIsPaused(false)}
                    onRestart={handleFinishedReload}
                    onReturnToMenu={() => {
                        onClose();
                    }}
                />
            )}

            {/* OVERLAYS */}
            {gameState === 'ready' && (
                <CountdownOverlay isClosing={isClosingOverlay} />
            )}

            {gameState === 'finished' && (
                <PostGameOverlay
                    score={score}
                    targetScore={targetScore}
                    lives={lives}
                    maxLives={maxLives}
                    timeLeft={timeLeft}
                    maxTime={maxTime}
                    currentPetals={currentPetals}
                    highestPetals={stageHighestPetals}
                    isClosing={isClosingOverlay}
                    onClose={handleFinishedClose}
                    onReload={handleFinishedReload}
                    rulesPreset={rulesPreset || (isEndless ? 'endless' : 'standard')}
                    starThresholds={thresholds}
                />
            )}
        </div>
    );
};

export default DrillEngine;
