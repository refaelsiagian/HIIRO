"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KANA_METADATA } from '../../../utils/kanaData';
import { ArrowLeft } from 'lucide-react';
import { useGameStore } from '../../../store/useGameStore';
import { Star, Lock } from 'lucide-react';
import { SubKatakanaPaperSVG } from '../../../components/SubKatakanaPaperSVG';
import { SubHiraganaPaperSVG } from '../../../components/SubHiraganaPaperSVG';
const SECTION_DATA: Record<string, { title: string, sub: string }> = {
    'basic': { title: 'Gojūon', sub: 'ごじゅうおん' },
    'dakuten': { title: 'Dakuon\nHandakuon', sub: 'だくおん\nはんだくおん' },
    'yoon': { title: 'Yōon', sub: 'ようおん' },
    'special': { title: 'Tokushuon', sub: 'とくしゅおん' },
    'daishiken': { title: 'Daishiken', sub: 'だいしけん' },
};

const GroupSelection: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const category = params.category as 'hiragana' | 'katakana';
    const section = params.section as string;

    const currentData = KANA_METADATA[category];
    const { getGroupStars } = useGameStore();

    if (!currentData || !currentData[section]) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Bagian tidak ditemukan...</div>;
    }

    const groups = currentData[section];
    const sectionInfo = SECTION_DATA[section] || { title: section, sub: '' };

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
                    {sectionInfo.title}
                </h1>
                <p className="text-[#5C3A21]/70 mt-2 text-2xl font-akaya">
                    {sectionInfo.sub}
                </p>
            </header>

            {/* HORIZONTAL CAROUSEL */}
            <main className="flex-1 w-full flex items-center overflow-x-auto pb-12 snap-x snap-mandatory hide-scrollbar">
                <div className="flex space-x-12 px-12 md:px-32 w-max mx-auto h-[480px] items-center">
                    {groups.map((group, index) => {
                        // LOGIC UNTUK SHOTESTO & DAISHIKEN
                        const isShotesto = group.id.includes('shotesto');
                        const isDaishiken = group.id.includes('daishiken');
                        
                        let isUnlocked = true;
                        if (index > 0) {
                            const prevGroup = groups[index - 1];
                            const prevStars = getGroupStars(category, section, prevGroup.id);
                            if (prevStars < 1) {
                                isUnlocked = false;
                            }
                        }

                        const earnedStars = getGroupStars(category, section, group.id);
                        
                        let displayTitle = group.title;
                        let displaySubTitle = group.id === 'n-final' ? group.chars[0]?.k : `${group.chars[0]?.k}行`;
                        let displayChars = group.chars.map(c => c.k).join('');
                        
                        if (isShotesto) {
                            displayTitle = 'Shōtesuto';
                            displaySubTitle = '小テスト';
                            displayChars = '小テスト';
                        }
                        if (isDaishiken) {
                            displayTitle = 'Daishiken';
                            displaySubTitle = '大試験';
                            displayChars = '大試験';
                        }

                        // COLORS LOGIC based on layout desc.txt
                        let bgColor = "";
                        let borderColor = "";
                        let fontColor = "";
                        let starColor = "";
                        let letterOpacity = "opacity-40";

                        if (category === 'katakana') {
                            if (isDaishiken) {
                                bgColor = "bg-[#F5E0FF]";
                                borderColor = "bg-[#8656AC]"; // We use bg for mask-color
                                fontColor = "text-[#4F286F]";
                                starColor = "fill-[#8656AC] text-[#8656AC]";
                            } else if (isShotesto) {
                                bgColor = "bg-[#FFD4D4]";
                                borderColor = "bg-[#CE6262]";
                                fontColor = "text-[#6F3E28]";
                                starColor = "fill-[#CE6262] text-[#CE6262]";
                            } else {
                                bgColor = "bg-[#FFE8E0]";
                                borderColor = "bg-[#CC6E34]";
                                fontColor = "text-[#6F3E28]";
                                starColor = "fill-[#CC6E34] text-[#CC6E34]";
                            }
                        } else {
                            if (isDaishiken) {
                                bgColor = "bg-[#B576E7]";
                                borderColor = "bg-[#794D9B]";
                                fontColor = "text-[#4F286F]";
                                starColor = "fill-[#794D9B] text-[#794D9B]";
                            } else if (isShotesto) {
                                bgColor = "bg-[#EC8080]";
                                borderColor = "bg-[#B84444]";
                                fontColor = "text-[#6F3E28]";
                                starColor = "fill-[#B84444] text-[#B84444]";
                            } else {
                                bgColor = "bg-[#E89A81]";
                                borderColor = "bg-[#915946]";
                                fontColor = "text-[#6F3E28]";
                                starColor = "fill-[#CC6E34] text-[#CC6E34]";
                            }
                        }

                        const hexBg = bgColor.match(/\[(.*?)\]/)?.[1] || "transparent";
                        const hexBorder = borderColor.match(/\[(.*?)\]/)?.[1] || "transparent";

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
                                        <SubKatakanaPaperSVG bgColor={hexBg} borderColor={hexBorder} className="w-full h-full drop-shadow-sm" />
                                    ) : (
                                        <SubHiraganaPaperSVG bgColor={hexBg} borderColor={hexBorder} className="w-full h-full drop-shadow-sm" />
                                    )}
                                </div>

                                {/* INNER CARD CONTENT (transparent) */}
                                <div className={`absolute inset-0 z-10 ${fontColor}`}>
                                    {!isUnlocked && (
                                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10">
                                            <div className="bg-white/80 p-4 rounded-full shadow-lg">
                                                <Lock className="w-8 h-8 text-[#5C3A21]" />
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div 
                                        className={`absolute top-[36px] left-[30px] ${letterOpacity} text-[48px] font-serif leading-[60px] font-normal tracking-[12px]`}
                                        style={{ writingMode: 'vertical-rl' }}
                                    >
                                        {isDaishiken || isShotesto 
                                            ? displayChars 
                                            : displayChars.replace(/\s/g, '').substring(0, 6)}
                                    </div>
                                    
                                    <div className="absolute top-[92px] left-[152px] right-0 pr-[42px] flex flex-col items-start z-10">
                                        <h2 className="text-[36px] font-arbutus font-normal whitespace-pre-line leading-none mb-2 text-left">
                                            {displayTitle}
                                        </h2>
                                        
                                        <p className="text-[20px] font-serif font-normal opacity-80 mb-3 text-left">
                                            {displaySubTitle}
                                        </p>
                                        <div className="flex items-center text-[16px] font-outfit font-normal opacity-90 text-left">
                                            <Star className={`w-[20px] h-[20px] mr-2 ${starColor}`} />
                                            {isShotesto || isDaishiken ? `${earnedStars}/3` : `${earnedStars}/15`}
                                        </div>
                                    </div>

                                    <div className={`absolute bottom-[42px] right-[42px] z-10 text-right ${fontColor}`}>
                                        {isDaishiken ? (
                                            <p className="text-[16px] font-outfit font-normal">Ujian akhir</p>
                                        ) : isShotesto ? (
                                            <p className="text-[16px] font-outfit font-normal">Ujian antara</p>
                                        ) : (
                                            <p className="text-[16px] font-outfit font-normal">{group.chars.length} huruf</p>
                                        )}
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
