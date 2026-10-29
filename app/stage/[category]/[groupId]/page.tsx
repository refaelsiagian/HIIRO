"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '../../../store/useGameStore';
import { Star, Lock, ArrowLeft } from 'lucide-react';
import { QuizBackgroundSVG } from '../../../components/QuizBackgroundSVG';
import { PetalSVG } from '../../../components/PetalSVG';
import DrillView from '../../../components/drills/DrillView';
import { PreGameOverlay } from '../../../components/drills/overlays/PreGameOverlay';
import { PostGameOverlay } from '../../../components/drills/overlays/PostGameOverlay';
import { PauseOverlay } from '../../../components/drills/overlays/PauseOverlay';
import { getResolvedLevelById } from '../../../utils/levelResolver';
import { SECTIONS_CONFIG } from '../../../data/levels/index';
import { StageConfig } from '../../../types/levels';
import { getTierTheme } from '../../../data/theme/tierThemes';

const StageSelection: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const category = params.category as 'hiragana' | 'katakana';
    const groupId = params.groupId as string;
    const { progress, petals } = useGameStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [isSansSerif, setIsSansSerif] = useState(false);
    const [selectedCharIndex, setSelectedCharIndex] = useState(0);
    const [activeDrill, setActiveDrill] = useState<{stageId: string, mode: string} | null>(null);
    const [infoOverlayData, setInfoOverlayData] = useState<{ stage: StageConfig; stageNumber: number } | null>(null);
    const [isClosingInfo, setIsClosingInfo] = useState(false);
    const [postGameOverlayData, setPostGameOverlayData] = useState<any>(null);
    const [closingPauseOverlay, setClosingPauseOverlay] = useState(false);

    const closeInfoOverlay = () => {
        setIsClosingInfo(true);
        setTimeout(() => {
            setInfoOverlayData(null);
            setIsClosingInfo(false);
        }, 400);
    };

    const handleStartDrill = () => {
        if (!infoOverlayData) return;
        setActiveDrill({stageId: infoOverlayData.stage.id, mode: infoOverlayData.stage.drillType});
        setInfoOverlayData(null);
    };

    const level = useMemo(() => {
        return getResolvedLevelById(groupId, category);
    }, [groupId, category]);

    const section = useMemo(() => {
        for (const [secKey, secDef] of Object.entries(SECTIONS_CONFIG)) {
            if (secDef.groups.some(g => g.id === groupId)) return secKey;
        }
        return 'gojuon';
    }, [groupId]);

    if (!level) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Grup tidak ditemukan...</div>;
    }

    if (activeDrill) {
        return (
            <DrillView 
                category={category} 
                groupId={groupId} 
                stageId={activeDrill.stageId} 
                mode={activeDrill.mode} 
                onClose={(data) => {
                    setActiveDrill(null);
                    if (data && data.isPauseClose) {
                        setClosingPauseOverlay(true);
                        setTimeout(() => {
                            setClosingPauseOverlay(false);
                        }, 400);
                    } else if (data) {
                        setPostGameOverlayData(data);
                        setTimeout(() => {
                            setPostGameOverlayData(null);
                        }, 400);
                    }
                }}
                isSansSerif={isSansSerif}
                onToggleSansSerif={() => setIsSansSerif(!isSansSerif)}
            />
        );
    }

    const tier = level.tier;
    const isExam = tier !== 'regular';
    
    const activeStages = level.gameModes;
    const displayChars = level.chars.length > 0 ? level.chars : [{ k: '?', r: 'test' }];

    const groupProgress = isMounted ? (progress[category]?.[section]?.[groupId] || {}) : {};
    const earnedStars = Object.values(groupProgress).reduce((acc, curr) => acc + curr.stars, 0);
    const totalStars = activeStages.length * 3;

    // THEME FROM CONFIG (Declarative based on level.tier)
    const theme = getTierTheme(category, tier);
    const room = theme.room;

    const renderFlower = (stageIndex: number, isUnlocked: boolean, stagePetals: number, customColor?: string) => {
        const maxPetals = 5;
        const angleStep = 360 / maxPetals;
        const colorToUse = customColor || room.petalBg;

        return (
            <div 
                className={`relative w-[120px] h-[120px] ${!isUnlocked ? 'opacity-30 grayscale' : ''}`}
                style={{ color: colorToUse }}
            >
                {[...Array(maxPetals)].map((_, i) => {
                    const rotation = i * angleStep;
                    const isActive = stagePetals > i;
                    
                    return (
                        <div 
                            key={i}
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-[34px] h-[45px]"
                            style={{ 
                                transform: `rotate(${rotation}deg)`, 
                                transformOrigin: "50% 60px" 
                            }}
                        >
                            <PetalSVG 
                                className="w-full h-full"
                                style={{ color: colorToUse }}
                                isFilled={isActive}
                            />
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div 
            className="h-screen font-sans flex flex-col md:flex-row overflow-hidden"
            style={{ 
                background: room.pageBgGradient,
                color: room.fontColor,
                '--theme-plate-bg': room.plateBg,
                '--theme-plate-border': room.plateBorder,
                '--theme-font-color': room.fontColor,
                '--theme-star-color': room.starColor,
                '--theme-petal-bg': room.petalBg,
                '--theme-letter-highlight': room.letterHighlight,
            } as React.CSSProperties}
        >
            {/* LEFT PANEL */}
            <div className="w-full md:w-5/12 flex flex-col h-full overflow-y-auto hide-scrollbar relative">
                
                {/* Independent Back Button */}
                <button 
                    onClick={() => router.push(`/select/${category}/${section}`)} 
                    className="absolute top-12 left-12 hover:opacity-70 transition-opacity z-20"
                    style={{ color: room.fontColor }}
                >
                    <ArrowLeft size={40} strokeWidth={2} />
                </button>
                
                {/* Content Container */}
                <div className="flex-1 flex flex-col pl-[200px] pt-[120px]">
                    
                    {/* Title Section */}
                    <div className="mb-8">
                        {/* Title Row */}
                        <div className="flex items-baseline mb-4">
                            <h1 
                                className="text-[48px] leading-none font-arbutus tracking-tight mr-4"
                                style={{ color: room.fontColor }}
                            >
                                {level.displayName}
                            </h1>
                            <p 
                                className="text-xl opacity-70 font-sans"
                                style={{ color: room.fontColor }}
                            >
                                {level.subtitleKanji}
                            </p>
                        </div>
                        
                        {/* Star Counter */}
                        <div className="flex items-center font-outfit" style={{ color: room.fontColor }}>
                            <Star className="w-5 h-5 mr-2" style={{ color: room.starColor, fill: room.starColor }} />
                            {earnedStars}/{totalStars}
                        </div>
                    </div>

                    {/* Centered Elements: Grid, Large Preview, Radio */}
                    {displayChars.length > 0 && (
                        <div className="flex flex-col items-center flex-1 w-full pt-4">
                            
                            {/* Character Grid - Horizontal */}
                            <div className="flex space-x-4 mb-16 max-w-full overflow-x-auto hide-scrollbar px-2">
                                {displayChars.map((char, index) => {
                                    const isSelected = selectedCharIndex === index;
                                    const highlightColor = room.letterHighlight || '#A55B38';
                                    const highlightBg = highlightColor.startsWith('#') && highlightColor.length === 7
                                        ? `${highlightColor}33`
                                        : highlightColor;

                                    return (
                                        <button 
                                            key={index}
                                            onClick={() => setSelectedCharIndex(index)}
                                            style={{ 
                                                color: room.fontColor,
                                                borderBottomColor: isSelected ? highlightColor : 'transparent',
                                                background: isSelected 
                                                    ? `linear-gradient(to bottom, transparent, ${highlightBg})` 
                                                    : undefined
                                            }}
                                            className="flex flex-col items-center justify-center min-w-[80px] w-[80px] h-[134px] transition-all duration-300 border-b-[2px] flex-shrink-0 hover:bg-black/5"
                                        >
                                            <span className={`text-[40px] mb-4 leading-none ${!isSansSerif ? 'font-serif' : 'font-sans'}`}>{char.k}</span>
                                            <span className="text-2xl font-outfit leading-none">{char.r}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Large Character Preview */}
                            <div className="flex flex-col items-center justify-center mb-16">
                                <span 
                                    className={`text-[280px] leading-none ${!isSansSerif ? 'font-serif' : 'font-sans'}`}
                                    style={{ color: room.fontColor }}
                                >
                                    {displayChars[selectedCharIndex]?.k || '?'}
                                </span>
                            </div>

                            {/* Font Toggle (Under Big Letter) */}
                            <div className="flex items-center text-sm font-medium pb-24" style={{ color: room.fontColor }}>
                                <button 
                                    onClick={() => setIsSansSerif(!isSansSerif)}
                                    className="flex items-center space-x-3 group"
                                >
                                    <div className={`w-5 h-5 rounded-full border-[2px] border-current flex items-center justify-center`}>
                                        {isSansSerif && <div className="w-2.5 h-2.5 rounded-full bg-current"></div>}
                                    </div>
                                    <span className="font-outfit text-xl opacity-80 group-hover:opacity-100 transition-opacity">Ganti ke sans-serif</span>
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT PANEL (Stages List) */}
            <div className="w-full md:w-7/12 relative h-full flex justify-center items-start">
                <div className="absolute inset-y-[120px] left-0 right-0 overflow-y-auto hide-scrollbar flex justify-center px-8 md:px-12">
                    <div className="w-full max-w-2xl space-y-8 pb-8">
                    {activeStages.map((stage, index) => {
                        const stageStars = groupProgress[stage.id]?.stars || 0;
                        let isUnlocked = true;
                        if (index > 0) {
                            const prevStage = activeStages[index - 1];
                            const prevStars = groupProgress[prevStage.id]?.stars || 0;
                            isUnlocked = prevStars >= 1;
                        }

                        const plateBg = room.plateBg;
                        const plateBorder = room.plateBorder;
                        const stagePetals = petals[category]?.[section]?.[groupId]?.[stage.id] || 0;

                        return (
                            <button
                                key={stage.id}
                                disabled={!isUnlocked}
                                onClick={() => {
                                    if (isUnlocked) {
                                        setInfoOverlayData({ stage, stageNumber: index + 1 });
                                    }
                                }}
                                className={`relative w-[707px] max-w-full h-auto aspect-[707/194] flex items-center justify-between transition-all duration-300 group ${!isUnlocked ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                {/* SVG QUIZ BACKGROUND */}
                                <QuizBackgroundSVG 
                                    className="absolute inset-0 w-full h-full transition-all duration-300 group-hover:brightness-[0.95] group-active:brightness-90" 
                                    bgColor={plateBg} 
                                    borderColor={plateBorder} 
                                
                                />

                                {/* INNER CONTENT LAYER */}
                                <div className="absolute inset-0 p-[20px] flex justify-between z-10 w-full h-full">
                                    
                                    <div className="text-left flex flex-col justify-between h-full py-[4px]" style={{ color: room.fontColor }}>
                                        <div>
                                            <span className="text-[16px] font-outfit font-normal tracking-wide block leading-none mb-[8px]">
                                                Tahap {index + 1}
                                            </span>
                                            <h3 className="text-[32px] font-arbutus flex items-center leading-none">
                                                {stage.displayName}
                                                {!isUnlocked && <Lock className="w-5 h-5 ml-3 opacity-60" />}
                                            </h3>
                                        </div>
                                        
                                        {/* Stars */}
                                        <div className="flex gap-[16px]">
                                            {[1, 2, 3].map(starNum => {
                                                const isFilled = starNum <= stageStars;
                                                return (
                                                    <Star 
                                                        key={starNum} 
                                                        className={`w-[40px] h-[40px] transition-all duration-300 ${!isFilled ? 'opacity-35' : ''}`}
                                                        style={{ 
                                                            color: room.starColor,
                                                            fill: isFilled ? room.starColor : 'none'
                                                        }}
                                                        strokeWidth={1.5}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Flower (Petals) */}
                                    <div className="flex-shrink-0 flex items-center justify-center pr-[12px]">
                                        {renderFlower(index, isUnlocked, stagePetals, room.petalBg)}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
                </div>
            </div>

            {/* INFO OVERLAY */}
            {infoOverlayData && (
                <PreGameOverlay
                    stageNumber={infoOverlayData.stageNumber}
                    title={infoOverlayData.stage.displayName}
                    description={infoOverlayData.stage.instruction}
                    maxTime={infoOverlayData.stage.timer}
                    isClosing={isClosingInfo}
                    onClose={closeInfoOverlay}
                    onStart={handleStartDrill}
                />
            )}
            
            {/* POST GAME OVERLAY (Closing Animation) */}
            {postGameOverlayData && (
                <PostGameOverlay
                    score={postGameOverlayData.score}
                    targetScore={postGameOverlayData.targetScore}
                    lives={postGameOverlayData.lives}
                    maxLives={postGameOverlayData.maxLives}
                    timeLeft={postGameOverlayData.timeLeft}
                    maxTime={postGameOverlayData.maxTime}
                    currentPetals={postGameOverlayData.currentPetals}
                    isClosing={true}
                    onClose={() => {}}
                    onReload={() => {}}
                />
            )}
            
            {/* PAUSE OVERLAY (Closing Animation) */}
            {closingPauseOverlay && (
                <PauseOverlay 
                    onContinue={() => {}}
                    onReturnToMenu={() => {}}
                    onRestart={() => {}}
                    isClosing={true}
                />
            )}
            
            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default StageSelection;
