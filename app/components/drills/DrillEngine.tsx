"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../../store/useGameStore';
import { Pause, Heart, ArrowLeft, Ban } from 'lucide-react';
import { CountdownOverlay } from './overlays/CountdownOverlay';
import { PostGameOverlay } from './overlays/PostGameOverlay';
import { PauseOverlay } from './overlays/PauseOverlay';

interface DrillEngineProps {
    category: string;
    section: string;
    groupId: string;
    stageId: string;
    mode?: string;
    maxTime: number; // e.g. 60
    maxLives: number; // e.g. 3
    targetScore: number; // How many correct answers to win
    children: (props: {
        onCorrect: () => void;
        onWrong: () => void;
        isSansSerif: boolean;
        onToggleSansSerif: () => void;
        isActive?: boolean;
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
    children,
    onClose,
    isSansSerif,
    onToggleSansSerif
}) => {
    const { completeStage, failStage, petals } = useGameStore();
    const currentPetals = petals[category]?.[section]?.[groupId]?.[stageId] || 0;

    const [timeLeft, setTimeLeft] = useState(maxTime);
    const [lives, setLives] = useState(maxLives);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
    const [starsEarned, setStarsEarned] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [hasPaused, setHasPaused] = useState(false);
    const [isClosingOverlay, setIsClosingOverlay] = useState(false);
    const [resetKey, setResetKey] = useState(0);

    const isFinal = groupId.startsWith('daishiken') || groupId.startsWith('shotesto');

    // COLORS LOGIC based on layout desc.txt
    let mainBg = "bg-app-bg";
    let panelBg = "bg-[#FFE8E0]";
    let borderColor = "border-[#E89A81]";
    let fontColor = "text-[#6F3E28]";
    let barBg = "bg-[#6F3E28]";
    let starColor = "fill-[#CC6E34] text-[#CC6E34]";

    if (isFinal) {
        panelBg = "bg-[#ECC5FF]";
        borderColor = "border-[#C681E8]";
        fontColor = "text-[#4A286F]";
        barBg = "bg-[#4A286F]";
        starColor = "fill-[#8F34CC] text-[#8F34CC]";
    }

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
    }, [category, section, groupId, stageId, maxLives, maxTime, score, lives, timeLeft, failStage, completeStage]);

    useEffect(() => {
        if (gameState !== 'playing') return;

        if (score >= targetScore) {
            handleGameOver(true);
        } else if (lives <= 0 || timeLeft <= 0) {
            handleGameOver(false);
        }
    }, [score, lives, timeLeft, targetScore, gameState, handleGameOver]);

    const handleCorrect = () => {
        if (gameState !== 'playing') return;
        setScore(prev => prev + 1);
    };

    const handleWrong = () => {
        if (gameState !== 'playing') return;
        setLives(prev => prev - 1);
    };


    const handleFinishedClose = () => {
        // Instantly return to menu and pass data so parent can render the closing animation over the menu
        onClose({
            score,
            targetScore,
            lives,
            maxLives,
            timeLeft,
            maxTime: maxTime,
            currentPetals
        });
    };

    const handleFinishedReload = () => {
        // Reset all state instantly
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
        <div className={`min-h-screen ${mainBg} p-6 font-sans flex flex-col items-center justify-between relative overflow-hidden ${fontColor}`}>
            
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
                    className={`absolute top-8 right-8 md:right-12 transition-opacity flex items-center justify-center w-12 h-12 ${fontColor} ${hasPaused ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-70'}`}
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
                
                {/* Timer */}
                <div className={`font-outfit text-[44px] leading-none ${fontColor}`}>
                    {timeLeft}
                </div>
                
                {/* Progress Bar */}
                <div className="w-full max-w-[400px] h-3 bg-black/10 rounded-full mt-4 overflow-hidden relative">
                    <div 
                        className={`h-full ${barBg} transition-all duration-300 ease-out`}
                        style={{ width: `${Math.min(100, (score / targetScore) * 100)}%` }}
                    />
                </div>
            </div>

            {/* Game Content */}
            <div key={resetKey} className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center relative pb-24">
                {children({ 
                    onCorrect: handleCorrect, 
                    onWrong: handleWrong, 
                    isSansSerif, 
                    onToggleSansSerif,
                    isActive: gameState === 'playing' && !isPaused
                })}
            </div>

            {/* PAUSE MODAL */}
            {isPaused && (
                <PauseOverlay 
                    onContinue={() => setIsPaused(false)}
                    onRestart={handleFinishedReload}
                    onReturnToMenu={() => {
                        // Instantly return to menu with isPauseClose flag
                        onClose({ isPauseClose: true });
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
                    isClosing={isClosingOverlay}
                    onClose={handleFinishedClose}
                    onReload={handleFinishedReload}
                />
            )}
        </div>
    );
};

export default DrillEngine;
