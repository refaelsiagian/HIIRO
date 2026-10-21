"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import typesDataRaw from '../../data/types.json';
import { SECTIONS_CONFIG } from '../../data/levels/index';
import { resolveSection } from '../../utils/levelResolver';

const SectionSelection: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const category = params.category as 'hiragana' | 'katakana';
    const { getGroupStars } = useGameStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const catTypes = useMemo(() => {
        const types = (typesDataRaw as any[]).filter(t => t.category === category);
        return [
            ...types,
            {
                id: 'daishiken',
                display_name: 'Daishiken',
                subtitle_hiragana: 'だいしけん',
                subtitle_katakana: 'ダイシケン',
                subtitle_kanji: '大試験',
            }
        ];
    }, [category]);

    if (!catTypes || catTypes.length === 0) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Kategori tidak ditemukan...</div>;
    }

    return (
        <div className="min-h-screen p-6 flex flex-col overflow-hidden">
            {/* HEADER NAVIGASI */}
            <div className="absolute top-6 left-6 z-10">
                <button
                    onClick={() => router.push('/')}
                    className="p-3 text-[#5C3A21] hover:text-[#DF7956] transition-colors"
                >
                    <ArrowLeft size={40} strokeWidth={2} />
                </button>
            </div>

            {/* HEADER */}
            <header className="text-center mt-12 mb-16">
                <h1 className="text-6xl text-[#5C3A21] tracking-tight capitalize font-akaya">
                    {category}
                </h1>
                <p className="text-[#5C3A21]/70 mt-2 text-3xl font-serif">
                    {category === 'hiragana' ? 'ひらがな' : 'カタカナ'}
                </p>
            </header>

            {/* HORIZONTAL CAROUSEL */}
            <main className="flex-1 w-full flex items-center overflow-x-auto pb-12 snap-x snap-mandatory hide-scrollbar">
                <div className="flex space-x-[64px] px-12 md:px-32 w-max mx-auto h-[520px]">
                    {catTypes.map((typeData) => {
                        const sectionKey = typeData.id;
                        const displaySub = category === 'katakana' ? typeData.subtitle_katakana : typeData.subtitle_hiragana;
                        
                        const sectionDef = SECTIONS_CONFIG[sectionKey];
                        const resolvedSection = sectionDef ? resolveSection(sectionDef, category) : null;

                        let earned = 0;
                        let total = 0;
                        let totalHuruf = 0;

                        if (resolvedSection) {
                            resolvedSection.groups.forEach(group => {
                                earned += isMounted ? getGroupStars(category, sectionKey, group.id) : 0;
                                total += group.gameModes.length * 3;
                                if (group.tier === 'regular') {
                                    totalHuruf += group.chars.length;
                                }
                            });
                        }

                        const stars = { earned, total };
                        const isDaishiken = sectionKey === 'daishiken';

                        // COLOR LOGIC based on layout desc.txt
                        let cardStyle = "";
                        let fontColor = "";
                        let starColor = "";
                        let kanjiOpacity = "";

                        if (category === 'katakana') {
                            kanjiOpacity = "opacity-40";
                            if (isDaishiken) {
                                cardStyle = "bg-gradient-to-br from-[#753391] to-[#F5E0FF]";
                                fontColor = "text-[#4F286F]";
                                starColor = "fill-[#4F286F] text-[#4F286F]";
                            } else {
                                cardStyle = "bg-gradient-to-br from-[#F07B55] to-[#FFE8E0]";
                                fontColor = "text-[#6F3E28]";
                                starColor = "fill-[#CC6E34] text-[#CC6E34]";
                            }
                        } else {
                            // Hiragana
                            kanjiOpacity = "opacity-80";
                            if (isDaishiken) {
                                cardStyle = "bg-[#7D4E94]";
                                fontColor = "text-[#FCEEFF]";
                                starColor = "fill-[#FCEEFF] text-[#FCEEFF]";
                            } else {
                                cardStyle = "bg-[#DF7956]";
                                fontColor = "text-[#FFEFE8]";
                                starColor = "fill-[#FFEFE8] text-[#FFEFE8]";
                            }
                        }

                        return (
                            <button
                                key={sectionKey}
                                onClick={() => router.push(`/select/${category}/${sectionKey}`)}
                                className={`w-[358px] h-[520px] shrink-0 snap-center ${cardStyle} shadow-2xl p-8 flex flex-col justify-between ${fontColor} hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden text-left`}
                            >
                                <div 
                                    className={`absolute top-[36px] left-[30px] ${kanjiOpacity} text-[48px] font-serif leading-[60px] font-normal tracking-[12px]`}
                                    style={{ writingMode: 'vertical-rl' }}
                                >
                                    {typeData.subtitle_kanji.replace(/\s/g, '').substring(0, 6)}
                                </div>
                                
                                <div className="absolute top-[56px] right-[28px] flex flex-col items-end z-10 text-right">
                                    <h2 className="text-[36px] font-arbutus font-normal whitespace-pre-line leading-[1.2] mb-2">
                                        {typeData.display_name}
                                    </h2>
                                    <p className="text-[20px] font-serif font-normal opacity-80 mb-3 whitespace-pre-line">
                                        {displaySub}
                                    </p>
                                    <div className="flex items-center justify-end text-[16px] font-outfit font-normal opacity-90">
                                        <Star className={`w-[20px] h-[20px] mr-2 ${starColor}`} />
                                        <span>{stars.earned}/{stars.total}</span>
                                    </div>
                                </div>

                                <div className={`absolute bottom-[42px] right-[42px] z-10 text-right ${fontColor}`}>
                                    {isDaishiken ? (
                                        <p className="text-[16px] font-outfit font-normal">Ujian akhir</p>
                                    ) : (
                                        <p className="text-[16px] font-outfit font-normal">{totalHuruf} huruf</p>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default SectionSelection;
