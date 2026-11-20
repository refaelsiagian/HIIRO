"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Lock } from 'lucide-react';
import { useGameStore } from '../../../store/useGameStore';
import { SubKatakanaPaperSVG } from '../../../components/SubKatakanaPaperSVG';
import { SubHiraganaPaperSVG } from '../../../components/SubHiraganaPaperSVG';
import { SECTIONS_CONFIG } from '../../../data/levels/index';
import { resolveSection } from '../../../utils/levelResolver';
import { getTierTheme } from '../../../data/theme/tierThemes';
import typesDataRaw from '../../../data/types.json';

const GroupSelection: React.FC = () => {
    const params = useParams();
    const category = params.category as 'hiragana' | 'katakana';
    const section = params.section as string;
    const { getGroupStars, getGroupHighestPetals, getSectionStars, getSectionHighestPetals, progress } = useGameStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const sectionDef = SECTIONS_CONFIG[section];
    const resolvedSection = useMemo(() => {
        if (!sectionDef) return null;
        return resolveSection(sectionDef, category);
    }, [sectionDef, category]);

    // Subtitle from types.json for kana typography
    const typeMeta = (typesDataRaw as any[]).find(t => t.id === section && t.category === category);

    if (!resolvedSection) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Bagian tidak ditemukan...</div>;
    }

    const groups = resolvedSection.groups;
    const rawDisplaySub = category === 'katakana' 
        ? (typeMeta?.subtitle_katakana || resolvedSection.subtitleKanji) 
        : (typeMeta?.subtitle_hiragana || resolvedSection.subtitleKanji);
    
    // Format header title to use inline separators instead of newlines
    const headerTitle = resolvedSection.displayName.replace('\n', ' & ');
    const headerSub = rawDisplaySub.replace('\n', '・');

    return (
        <div className="min-h-screen p-4 sm:p-6 flex flex-col overflow-x-hidden">
            {/* HEADER NAVIGASI */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 animate-fadein">
                <Link
                    href={`/select/${category}`}
                    prefetch={true}
                    className="p-2 sm:p-3 text-slate-800 hover:text-blue-600 transition-colors inline-block"
                >
                    <ArrowLeft className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={2} />
                </Link>
            </div>

            {/* HEADER */}
            <header className="text-center mt-8 mb-6 sm:mt-12 sm:mb-16 animate-header-enter px-4">
                <h1 className="text-3xl sm:text-5xl text-[#5C3A21] tracking-tight font-arbutus break-words">
                    {headerTitle}
                </h1>
                <p className="text-[#5C3A21]/70 mt-1 sm:mt-2 text-xl sm:text-2xl font-akaya">
                    {headerSub}
                </p>
            </header>

            {/* HORIZONTAL CAROUSEL */}
            <main className="flex-1 w-full flex items-center overflow-x-auto pb-8 sm:pb-12 snap-x snap-mandatory hide-scrollbar">
                <div className="flex space-x-6 sm:space-x-12 px-6 sm:px-12 md:px-32 w-max mx-auto h-[440px] sm:h-[480px] items-center">
                    {groups.map((group, index) => {
                        const tier = group.tier;
                        const isExam = tier !== 'regular';
                        
                        const sectionStars = getSectionStars(category, section);
                        const sectionPetals = getSectionHighestPetals(category, section);

                        // Calculate total and completed stages in preceding groups (used for Shiken unlock & display)
                        let totalSectionStages = 0;
                        let completedSectionStages = 0;

                        if (tier === 'shiken') {
                            const precedingGroups = groups.slice(0, index);
                            precedingGroups.forEach(pg => {
                                totalSectionStages += pg.gameModes.length;
                                const pgProgress = isMounted ? (progress?.[category]?.[section]?.[pg.id] || {}) : {};
                                pg.gameModes.forEach(stage => {
                                    if (pgProgress[stage.id]?.stars > 0) {
                                        completedSectionStages++;
                                    }
                                });
                            });
                        }

                        let isUnlocked = true;
                        let lockPills: string[] = [];

                        if (index > 0) {
                            if (!isMounted) {
                                isUnlocked = false;
                            } else if (tier === 'shiken') {
                                // Shiken requires ALL preceding stages in the section to be completed, plus required petals
                                const hasPetalReq = group.requiredPetals !== undefined && group.requiredPetals > 0;
                                const isStagesMet = completedSectionStages >= totalSectionStages;
                                const isPetalsMet = !hasPetalReq || sectionPetals >= group.requiredPetals!;

                                if (!isStagesMet || !isPetalsMet) {
                                    isUnlocked = false;
                                    lockPills = [
                                        `Tahap: ${completedSectionStages}/${totalSectionStages}`,
                                        `🌸 ${sectionPetals}/${group.requiredPetals || 0}`
                                    ];
                                }
                            } else {
                                const hasPetalReq = group.requiredPetals !== undefined && group.requiredPetals > 0;
                                const hasStarReq = group.requiredStars !== undefined && group.requiredStars > 0;

                                if (hasPetalReq && sectionPetals < group.requiredPetals!) {
                                    isUnlocked = false;
                                    lockPills = [`Butuh ${group.requiredPetals} 🌸 (${sectionPetals}/${group.requiredPetals})`];
                                } else if (hasStarReq && sectionStars < group.requiredStars!) {
                                    isUnlocked = false;
                                    lockPills = [`Butuh ${group.requiredStars} ★ (${sectionStars}/${group.requiredStars})`];
                                } else if (!hasPetalReq && !hasStarReq && group.requiredStars !== 0) {
                                    // Fallback if not explicitly configured: previous group has >= 1 star
                                    const prevGroup = groups[index - 1];
                                    const prevStars = getGroupStars(category, section, prevGroup.id);
                                    if (prevStars < 1) {
                                        isUnlocked = false;
                                        lockPills = ['Butuh 1 Bintang'];
                                    }
                                }
                            }
                        }

                        const earnedStars = getGroupStars(category, section, group.id);
                        const maxStars = group.gameModes.length * 3;
                        
                        const displayTitle = group.displayName;
                        const displaySubTitle = group.subtitleKanji;
                        const displayChars = isExam
                            ? group.subtitleKanji.replace(/\s*\d+/, '')
                            : group.chars.map(c => c.k).join('').replace(/\s/g, '').substring(0, 6);

                        // Unified theme from config
                        const theme = getTierTheme(category, tier);
                        const paper = theme.paper;

                        const cardInner = (
                            <>
                                {/* SVG BACKGROUND */}
                                <div className={`absolute inset-0 z-0 ${!isUnlocked ? 'opacity-50' : 'group-hover:drop-shadow-xl'} transition-all duration-300`}>
                                    {category === 'katakana' ? (
                                        <SubKatakanaPaperSVG bgColor={paper.bg} borderColor={paper.border} className="w-full h-full drop-shadow-sm" />
                                    ) : (
                                        <SubHiraganaPaperSVG bgColor={paper.bg} borderColor={paper.border} className="w-full h-full drop-shadow-sm" />
                                    )}
                                </div>

                                {/* INNER CARD CONTENT */}
                                <div className="absolute inset-0 z-10" style={{ color: paper.fontColor }}>
                                    {!isUnlocked && (
                                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/15 backdrop-blur-[1px] p-4 text-center">
                                            <div className="bg-white/90 p-3.5 rounded-full shadow-lg mb-2.5">
                                                <Lock className="w-7 h-7 text-[#5C3A21]" />
                                            </div>
                                            <div className="flex flex-col items-center space-y-1.5">
                                                {lockPills.map((pill, pIdx) => (
                                                    <span 
                                                        key={pIdx} 
                                                        className="text-xs font-bold font-outfit px-3 py-1 rounded-full bg-white/90 text-[#5C3A21] shadow-sm tracking-wide whitespace-nowrap"
                                                    >
                                                        {pill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div 
                                        className={`absolute top-[28px] left-[20px] sm:top-[36px] sm:left-[30px] ${paper.letterOpacity} text-[36px] sm:text-[48px] font-serif leading-[48px] sm:leading-[60px] font-normal tracking-[8px] sm:tracking-[12px]`}
                                        style={{ writingMode: 'vertical-rl' }}
                                    >
                                        {displayChars}
                                    </div>
                                    
                                    <div className="absolute top-[72px] sm:top-[92px] left-[110px] sm:left-[152px] right-0 pr-5 sm:pr-[42px] flex flex-col items-start z-10">
                                        <h2 className="text-2xl sm:text-[32px] font-arbutus font-normal whitespace-pre-line leading-tight sm:leading-none mb-1.5 sm:mb-2 text-left">
                                            {displayTitle}
                                        </h2>
                                        
                                        <p className="text-base sm:text-[20px] font-serif font-normal opacity-80 mb-2 sm:mb-3 text-left">
                                            {displaySubTitle}
                                        </p>
                                        <div className="flex items-center text-sm sm:text-[16px] font-outfit font-normal opacity-90 text-left">
                                            <Star 
                                                className="w-4 h-4 sm:w-[20px] sm:h-[20px] mr-1.5 sm:mr-2" 
                                                style={{ fill: paper.starColor, color: paper.starColor }}
                                            />
                                            {`${earnedStars}/${maxStars}`}
                                        </div>
                                    </div>

                                    <div className="absolute bottom-6 right-6 sm:bottom-[42px] sm:right-[42px] z-10 text-right" style={{ color: paper.fontColor }}>
                                        <p className="text-sm sm:text-[16px] font-outfit font-normal">
                                            {tier === 'regular'
                                                ? `${group.chars.length} huruf`
                                                : tier === 'shotesto'
                                                ? 'Ujian antara'
                                                : tier === 'shiken'
                                                ? 'Ujian bagian'
                                                : 'Ujian akhir'}
                                        </p>
                                    </div>
                                </div>
                            </>
                        );

                        if (!isUnlocked) {
                            return (
                                <div
                                    key={group.id}
                                    aria-disabled="true"
                                    style={{ animationDelay: `${index * 70}ms` }}
                                    className="h-[420px] sm:h-[480px] aspect-[360/480] shrink-0 snap-center transition-all duration-300 relative text-left group opacity-60 cursor-not-allowed grayscale animate-card-deal"
                                >
                                    {cardInner}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={group.id}
                                href={`/stage/${category}/${group.id}`}
                                prefetch={true}
                                style={{ animationDelay: `${index * 70}ms` }}
                                className="h-[420px] sm:h-[480px] aspect-[360/480] shrink-0 snap-center transition-all duration-300 relative text-left group hover:scale-105 active:scale-95 animate-card-deal"
                            >
                                {cardInner}
                            </Link>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default GroupSelection;
