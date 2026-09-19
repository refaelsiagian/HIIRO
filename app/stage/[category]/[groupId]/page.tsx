"use client";

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KANA_METADATA } from '../../../utils/kanaData';
import { GroupData } from '../../../types/kana';
import { useGameStore } from '../../../store/useGameStore';
import { Star, Lock, ArrowLeft } from 'lucide-react';
import { QuizBackgroundSVG } from '../../../components/QuizBackgroundSVG';
import { PetalSVG } from '../../../components/PetalSVG';

const STAGES = [
    { id: 'true-false-1', title: 'True or False', mode: 'true-false' },
    { id: 'true-false-2', title: 'True or False', mode: 'true-false' },
    { id: 'sequence-1', title: 'Sequence Drill', mode: 'sequence' },
    { id: 'sequence-2', title: 'Sequence Drill', mode: 'sequence' },
    { id: 'find-fill-1', title: 'Find & Fill', mode: 'find-fill' },
];

const StageSelection: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const category = params.category as 'hiragana' | 'katakana';
    const groupId = params.groupId as string;
    const { progress, petals } = useGameStore();

    const [isSansSerif, setIsSansSerif] = useState(false);
    const [selectedCharIndex, setSelectedCharIndex] = useState(0);

    const groupData = useMemo(() => {
        const typesData = KANA_METADATA[category];
        if (!typesData) return null;

        for (const typeData of typesData) {
            const foundGroup = typeData.groups.find(g => g.id === groupId);
            if (foundGroup) return foundGroup;
        }
        return null;
    }, [groupId, category]);

    const section = useMemo(() => {
        const typesData = KANA_METADATA[category];
        if (!typesData) return 'gojuon';
        for (const typeData of typesData) {
            if (typeData.groups.find(g => g.id === groupId)) return typeData.id;
        }
        return 'gojuon';
    }, [groupId, category]);

    if (!groupData) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Grup tidak ditemukan...</div>;
    }

    const isShotesto = groupId.startsWith('shotesto');
    const isDaishiken = groupId.startsWith('daishiken');
    const isFinal = isShotesto || isDaishiken;

    const displayChars = groupData.chars.length > 0 ? groupData.chars : [{ k: '?', r: 'test' }];

    const groupProgress = progress[category]?.[section]?.[groupId] || {};
    const earnedStars = Object.values(groupProgress).reduce((acc, curr) => acc + curr.stars, 0);
    const totalStars = isFinal ? 1 * 3 : STAGES.length * 3;
    const currentPetals = petals[category]?.[section] || 0;
    const maxPetals = section === 'daishiken' ? 10 : 5;

    // COLORS LOGIC based on layout desc.txt
    let mainBg = "bg-app-bg";
    let panelBg = "bg-[#FFE8E0]";
    let borderColor = "bg-[#E89A81]";
    let fontColor = "text-[#6F3E28]";
    let starColor = "fill-[#CC6E34] text-[#CC6E34]";
    let starColorEmpty = "text-[#CC6E34] border-[#CC6E34]";
    let petalBg = "bg-[#CC6E34]";

    if (isFinal) {
        panelBg = "bg-[#ECC5FF]";
        borderColor = "bg-[#C681E8]";
        fontColor = "text-[#4A286F]";
        starColor = "fill-[#8F34CC] text-[#8F34CC]";
        starColorEmpty = "text-[#8F34CC] border-[#8F34CC]";
        petalBg = "bg-[#8F34CC]";
    }

    const renderFlower = (stageIndex: number, isUnlocked: boolean, customColor?: string) => {
        let currentPetals = groupProgress[`${groupId}-petals`] || 0;
        
        // Final stage has 10 petals, normal has 5
        const maxPetals = isFinal ? 10 : 5;
        const angleStep = 360 / maxPetals;
        const colorToUse = customColor || starColor;

        return (
            <div className={`relative w-[120px] h-[120px] ${!isUnlocked ? 'opacity-30 grayscale' : ''} ${colorToUse}`}>
                {[...Array(maxPetals)].map((_, i) => {
                    const rotation = i * angleStep;
                    const isActive = currentPetals > i;
                    
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
                                {groupData?.title}
                            </h1>
                            <p className={`text-xl opacity-70 font-sans ${fontColor}`}>{displayChars[0].k} 行</p>
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
                            <div className="flex space-x-4 mb-16">
                                {displayChars.map((char, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => setSelectedCharIndex(index)}
                                        className={`flex flex-col items-center justify-center w-[80px] h-[134px] transition-all duration-300 border-b-[2px] ${
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
                                    {displayChars[selectedCharIndex].k}
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
                    {(isFinal ? [STAGES[0]] : STAGES).map((stage, index) => {
                        const stageStars = groupProgress[stage.id]?.stars || 0;
                        const isLastStage = isFinal || index === STAGES.length - 1;
                        
                        let isUnlocked = true;
                        if (index > 0) {
                            const prevStage = STAGES[index - 1];
                            const prevStars = groupProgress[prevStage.id]?.stars || 0;
                            isUnlocked = prevStars >= 1;
                        }

                        const plateBg = isLastStage ? "#ECC5FF" : "#FFE8E0";
                        const plateBorder = isLastStage ? "#C681E8" : "#E89A81";
                        const plateFontColor = isLastStage ? "text-[#4A286F]" : fontColor;
                        const plateStarColor = isLastStage ? "text-[#8F34CC]" : starColor;

                        return (
                            <button
                                key={stage.id}
                                disabled={!isUnlocked}
                                onClick={() => isUnlocked && router.push(`/drill/${groupId}?cat=${category}&stageId=${stage.id}&mode=${stage.mode}`)}
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
                                                {stage.title}
                                                {!isUnlocked && <Lock className={`w-5 h-5 ml-3 opacity-60 ${plateFontColor}`} />}
                                            </h3>
                                        </div>
                                        
                                        {/* Stars */}
                                        <div className="flex gap-[16px]">
                                            {[1, 2, 3].map(starNum => (
                                                <Star 
                                                    key={starNum} 
                                                    className={`w-[40px] h-[40px] ${plateStarColor}`} 
                                                    fill={starNum <= stageStars ? "currentColor" : "none"}
                                                    strokeWidth={1.5}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Flower (Petals) */}
                                    <div className="flex-shrink-0 flex items-center justify-center pr-[12px]">
                                        {renderFlower(index, isUnlocked, plateStarColor)}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
            </div>
            
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
