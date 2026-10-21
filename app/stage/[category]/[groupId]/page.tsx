"use client";

import React, { useMemo, useState } from 'react';
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

const StageSelection: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const category = params.category as 'hiragana' | 'katakana';
    const groupId = params.groupId as string;
    const { progress, petals } = useGameStore();

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

    const isShotesto = groupId.startsWith('shotesto');
    const isDaishiken = groupId.startsWith('daishiken');
    const isFinal = isShotesto || isDaishiken;
    
    const activeStages = level.gameModes;
    const displayChars = level.chars.length > 0 ? level.chars : [{ k: '?', r: 'test' }];

    const groupProgress = progress[category]?.[section]?.[groupId] || {};
    const earnedStars = Object.values(groupProgress).reduce((acc, curr) => acc + curr.stars, 0);
    const totalStars = activeStages.length * 3;

    // COLORS LOGIC based on layout desc.txt
    let mainBg = "bg-app-bg";
    let fontColor = "text-[#6F3E28]";
    let starColor = "text-[#CC6E34]";
    let starColorEmpty = "text-[#CC6E34]";

    if (isFinal) {
        fontColor = "text-[#4A286F]";
        starColor = "text-[#8F34CC]";
        starColorEmpty = "text-[#8F34CC]";
    }

    const renderFlower = (stageIndex: number, isUnlocked: boolean, stagePetals: number, customColor?: string) => {
        const maxPetals = 5;
        const angleStep = 360 / maxPetals;
        const colorToUse = customColor || starColor;

        return (
            <div className={`relative w-[120px] h-[120px] ${!isUnlocked ? 'opacity-30 grayscale' : ''} ${colorToUse}`}>
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
                                className={`w-full h-full ${colorToUse}`}
                                isFilled={isActive}
                            />
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={`h-screen ${mainBg} font-sans text-slate-800 flex flex-col md:flex-row overflow-hidden`}>
            {/* LEFT PANEL */}
            <div className="w-full md:w-5/12 flex flex-col h-full overflow-y-auto hide-scrollbar relative">
                
                {/* Independent Back Button */}
                <button 
                    onClick={() => router.push(`/select/${category}/${section}`)} 
                    className={`absolute top-12 left-12 hover:opacity-70 transition-opacity z-20 ${fontColor}`}
                >
                    <ArrowLeft size={40} strokeWidth={2} />
                </button>
                
                {/* Content Container */}
                <div className="flex-1 flex flex-col pl-[200px] pt-[120px]">
                    
                    {/* Title Section */}
                    <div className="mb-8">
                        {/* Title Row */}
                        <div className="flex items-baseline mb-4">
                            <h1 className={`text-[48px] leading-none font-arbutus tracking-tight mr-4 ${fontColor}`}>
                                {level.displayName}
                            </h1>
                            <p className={`text-xl opacity-70 font-sans ${fontColor}`}>
                                {level.subtitleKanji}
                            </p>
                        </div>
                        
                        {/* Star Counter */}
                        <div className={`flex items-center font-outfit ${fontColor}`}>
                            <Star className={`w-5 h-5 mr-2 ${starColor}`} fill="currentColor" />
                            {earnedStars}/{totalStars}
                        </div>
                    </div>

                    {/* Centered Elements: Grid, Large Preview, Radio */}
                    {displayChars.length > 0 && (
                        <div className="flex flex-col items-center flex-1 w-full pt-4">
                            
                            {/* Character Grid - Horizontal */}
                            <div className="flex space-x-4 mb-16 max-w-full overflow-x-auto hide-scrollbar px-2">
                                {displayChars.map((char, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => setSelectedCharIndex(index)}
                                        className={`flex flex-col items-center justify-center min-w-[80px] w-[80px] h-[134px] transition-all duration-300 border-b-[2px] flex-shrink-0 ${
                                            selectedCharIndex === index 
                                                ? (isFinal 
                                                    ? 'bg-gradient-to-b from-[#F3E0FF]/0 to-[#ECC5FF] border-[#C681E8]' 
                                                    : 'bg-gradient-to-b from-[#FFE0CD]/0 to-[#FFB49F] border-[#A55B38]')
                                                : 'border-transparent hover:bg-black/5'
                                        } ${fontColor}`}
                                    >
                                        <span className={`text-[40px] mb-4 leading-none ${!isSansSerif ? 'font-serif' : 'font-sans'}`}>{char.k}</span>
                                        <span className="text-2xl font-outfit leading-none">{char.r}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Large Character Preview */}
                            <div className="flex flex-col items-center justify-center mb-16">
                                <span className={`text-[280px] leading-none ${fontColor} ${!isSansSerif ? 'font-serif' : 'font-sans'}`}>
                                    {displayChars[selectedCharIndex]?.k || '?'}
                                </span>
                            </div>

                            {/* Font Toggle (Under Big Letter) */}
                            <div className={`flex items-center text-sm font-medium pb-24 ${fontColor}`}>
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
                        const isLastStage = isDaishiken || index === activeStages.length - 1;
                        
                        let isUnlocked = true;
                        if (index > 0) {
                            const prevStage = activeStages[index - 1];
                            const prevStars = groupProgress[prevStage.id]?.stars || 0;
                            isUnlocked = prevStars >= 1;
                        }

                        const plateBg = isLastStage ? "#ECC5FF" : "#FFE8E0";
                        const plateBorder = isLastStage ? "#C681E8" : "#E89A81";
                        const plateFontColor = isLastStage ? "text-[#4A286F]" : fontColor;
                        const plateStarColor = isLastStage ? "text-[#8F34CC]" : starColor;
                        const plateStarColorEmpty = isLastStage ? "text-[#8F34CC]" : starColorEmpty;
                        
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
                                    
                                    <div className="text-left flex flex-col justify-between h-full py-[4px]">
                                        <div>
                                            <span className={`text-[16px] font-outfit font-normal tracking-wide block leading-none mb-[8px] ${plateFontColor}`}>
                                                Tahap {index + 1}
                                            </span>
                                            <h3 className={`text-[32px] font-arbutus flex items-center leading-none ${plateFontColor}`}>
                                                {stage.displayName}
                                                {!isUnlocked && <Lock className={`w-5 h-5 ml-3 opacity-60 ${plateFontColor}`} />}
                                            </h3>
                                        </div>
                                        
                                        {/* Stars */}
                                        <div className="flex gap-[16px]">
                                            {[1, 2, 3].map(starNum => (
                                                <Star 
                                                    key={starNum} 
                                                    className={`w-[40px] h-[40px] ${starNum <= stageStars ? plateStarColor : plateStarColorEmpty} transition-all duration-300`} 
                                                    fill={starNum <= stageStars ? "currentColor" : "none"}
                                                    strokeWidth={1.5}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Flower (Petals) */}
                                    <div className="flex-shrink-0 flex items-center justify-center pr-[12px]">
                                        {renderFlower(index, isUnlocked, stagePetals, plateStarColor)}
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
