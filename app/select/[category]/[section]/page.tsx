"use client";

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
    const router = useRouter();
    const category = params.category as 'hiragana' | 'katakana';
    const section = params.section as string;
    const { getGroupStars } = useGameStore();

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
        <div className="min-h-screen p-6 flex flex-col overflow-hidden">
            {/* HEADER NAVIGASI */}
            <div className="absolute top-6 left-6 z-10">
                <button
                    onClick={() => router.push(`/select/${category}`)}
                    className="p-3 text-slate-800 hover:text-blue-600 transition-colors"
                >
                    <ArrowLeft size={40} strokeWidth={2} />
                </button>
            </div>

            {/* HEADER */}
            <header className="text-center mt-12 mb-16">
                <h1 className="text-5xl text-[#5C3A21] tracking-tight font-arbutus">
                    {headerTitle}
                </h1>
                <p className="text-[#5C3A21]/70 mt-2 text-2xl font-akaya">
                    {headerSub}
                </p>
            </header>

            {/* HORIZONTAL CAROUSEL */}
            <main className="flex-1 w-full flex items-center overflow-x-auto pb-12 snap-x snap-mandatory hide-scrollbar">
                <div className="flex space-x-12 px-12 md:px-32 w-max mx-auto h-[480px] items-center">
                    {groups.map((group, index) => {
                        const tier = group.tier;
                        const isExam = tier !== 'regular';
                        
                        let isUnlocked = true;
                        if (index > 0) {
                            const prevGroup = groups[index - 1];
                            const prevStars = getGroupStars(category, section, prevGroup.id);
                            if (prevStars < 1) {
                                isUnlocked = false;
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

                        return (
                            <button
                                key={group.id}
                                disabled={!isUnlocked}
                                onClick={() => isUnlocked && router.push(`/stage/${category}/${group.id}`)}
                                className={`w-[360px] h-[480px] shrink-0 snap-center transition-all duration-300 relative text-left group ${!isUnlocked ? 'opacity-60 cursor-not-allowed grayscale' : 'hover:scale-105 active:scale-95'}`}
                            >
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
                                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10">
                                            <div className="bg-white/80 p-4 rounded-full shadow-lg">
                                                <Lock className="w-8 h-8 text-[#5C3A21]" />
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div 
                                        className={`absolute top-[36px] left-[30px] ${paper.letterOpacity} text-[48px] font-serif leading-[60px] font-normal tracking-[12px]`}
                                        style={{ writingMode: 'vertical-rl' }}
                                    >
                                        {displayChars}
                                    </div>
                                    
                                    <div className="absolute top-[92px] left-[152px] right-0 pr-[42px] flex flex-col items-start z-10">
                                        <h2 className="text-[36px] font-arbutus font-normal whitespace-pre-line leading-none mb-2 text-left">
                                            {displayTitle}
                                        </h2>
                                        
                                        <p className="text-[20px] font-serif font-normal opacity-80 mb-3 text-left">
                                            {displaySubTitle}
                                        </p>
                                        <div className="flex items-center text-[16px] font-outfit font-normal opacity-90 text-left">
                                            <Star 
                                                className="w-[20px] h-[20px] mr-2" 
                                                style={{ fill: paper.starColor, color: paper.starColor }}
                                            />
                                            {`${earnedStars}/${maxStars}`}
                                        </div>
                                    </div>

                                    <div className="absolute bottom-[42px] right-[42px] z-10 text-right" style={{ color: paper.fontColor }}>
                                        <p className="text-[16px] font-outfit font-normal">
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
                            </button>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default GroupSelection;
