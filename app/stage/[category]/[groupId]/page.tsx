"use client";

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KANA_METADATA } from '../../../utils/kanaData';
import { GroupData } from '../../../types/kana';

const StageSelection: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const category = params.category as 'hiragana' | 'katakana';
    const groupId = params.groupId as string;

    const groupData = useMemo(() => {
        const sections = KANA_METADATA[category];
        if (!sections) return null;

        const allGroups = Object.values(sections).flat() as GroupData[];
        return allGroups.find(g => g.id === groupId) || null;
    }, [groupId, category]);

    if (!groupData) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Grup tidak ditemukan...</div>;
    }

    // Cari tahu section dari group ini untuk tombol kembali
    const section = useMemo(() => {
        const sections = KANA_METADATA[category];
        if (!sections) return 'basic';
        for (const sec in sections) {
            if (sections[sec].find(g => g.id === groupId)) return sec;
        }
        return 'basic';
    }, [groupId, category]);

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800 flex flex-col">
            {/* HEADER NAVIGASI */}
            <div className="max-w-4xl mx-auto w-full mb-8 flex items-center justify-between">
                <button
                    onClick={() => router.push(`/select/${category}/${section}`)}
                    className="group flex items-center space-x-2 font-bold text-slate-400 hover:text-blue-600 transition-colors"
                >
                    <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                    <span>Pilih Grup</span>
                </button>
            </div>

            <main className="max-w-md mx-auto w-full flex-1 flex flex-col">
                {/* PREVIEW HURUF (MENGGANTIKAN MODAL) */}
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border-2 border-slate-100 p-8 mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-3">
                        {category} • {groupData.id}
                    </span>
                    <h2 className="text-3xl font-black text-slate-800 mb-8">{groupData.title}</h2>
                    
                    <div className="grid grid-cols-5 gap-3">
                        {groupData.chars.map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <span className="text-3xl font-black text-slate-800 mb-1">{item.k}</span>
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">{item.r}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* STAGE SELECTION */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-400 ml-4 mb-2">Pilih Stage</h3>
                    
                    {/* Stage 1 */}
                    <button
                        onClick={() => router.push(`/drill/${groupId}?cat=${category}`)}
                        className="w-full bg-blue-600 text-white p-6 rounded-3xl font-bold flex items-center justify-between hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-300 active:scale-95 group"
                    >
                        <div className="text-left">
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 block mb-1">Stage 1</span>
                            <span className="text-xl font-black">Sequence Drill</span>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-2xl">▶</span>
                        </div>
                    </button>

                    {/* Locked Stage Example */}
                    <div className="w-full bg-slate-200 text-slate-400 p-6 rounded-3xl font-bold flex items-center justify-between border-2 border-slate-100">
                        <div className="text-left opacity-60">
                            <span className="text-[10px] font-black uppercase tracking-widest block mb-1">Stage 2</span>
                            <span className="text-xl font-black">Random Drill</span>
                        </div>
                        <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center opacity-60">
                            <span className="text-xl">🔒</span>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="text-center py-12 text-slate-300 text-xs font-bold tracking-widest uppercase mt-auto">
                © 2026 KanaDrill Studio
            </footer>
        </div>
    );
};

export default StageSelection;
