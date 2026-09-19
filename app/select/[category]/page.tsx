"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KANA_METADATA } from '../../utils/kanaData';
import { ArrowLeft } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { Star } from 'lucide-react';

const SECTION_DATA: Record<string, { title: string, subHiragana: string, subKatakana: string, kanji: string }> = {
    'basic': { title: 'Gojūon', subHiragana: 'ごじゅうおん', subKatakana: 'ゴジュウオン', kanji: '五十音' },
    'dakuten': { title: 'Dakuon\nHandakuon', subHiragana: 'だくおん\nはんだくおん', subKatakana: 'ダクオン\nハンダクオン', kanji: '濁音\n・\n半濁音' },
    'yoon': { title: 'Yōon', subHiragana: 'ようおん', subKatakana: 'ヨウオン', kanji: '拗音' },
    'special': { title: 'Tokushuon', subHiragana: 'とくしゅおん', subKatakana: 'トクシュオン', kanji: '特殊音' },
    'daishiken': { title: 'Daishiken', subHiragana: 'だいしけん', subKatakana: 'ダイシケン', kanji: '大試験' },
};

const SectionSelection: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const category = params.category as 'hiragana' | 'katakana';

    const currentData = KANA_METADATA[category];
    const { getGroupStars } = useGameStore();

    if (!currentData) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Kategori tidak ditemukan...</div>;
    }

    const sections = Object.keys(currentData);

    const getSectionStars = (section: string) => {
        let earned = 0;
        let total = 0;
        currentData[section].forEach(group => {
            const isShotesto = group.id.startsWith('shotesto');
            const isDaishiken = group.id.startsWith('daishiken');
            const stgs = (isShotesto || isDaishiken) ? 1 : 5;
            total += stgs * 3;
            earned += getGroupStars(category, section, group.id);
        });
        return { earned, total };
    };

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
                    {sections.map((sectionKey) => {
                        const sData = SECTION_DATA[sectionKey] || { title: sectionKey, subHiragana: '', subKatakana: '', kanji: '' };
                        const displaySub = category === 'katakana' ? sData.subKatakana : sData.subHiragana;
                        const stars = getSectionStars(sectionKey);
                        const totalHuruf = currentData[sectionKey].reduce((acc, curr) => acc + curr.chars.length, 0);

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
                                    {sData.kanji.replace(/\s/g, '').substring(0, 6)}
                                </div>
                                
                                <div className="absolute top-[56px] right-[28px] flex flex-col items-end z-10 text-right">
                                    <h2 className="text-[36px] font-arbutus font-normal whitespace-pre-line leading-[1.2] mb-2">
                                        {sData.title}
                                    </h2>
                                    <p className="text-[20px] font-serif font-normal opacity-80 mb-3 whitespace-pre-line">
                                        {displaySub}
                                    </p>
                                    <div className="flex items-center justify-end text-[16px] font-outfit font-normal opacity-90">
                                        <Star className={`w-[20px] h-[20px] mr-2 ${starColor}`} />
                                        {stars.earned}/{stars.total}
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
