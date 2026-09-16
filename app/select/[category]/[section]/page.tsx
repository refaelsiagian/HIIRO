"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KANA_METADATA } from '../../../utils/kanaData';

const GroupSelection: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const category = params.category as 'hiragana' | 'katakana';
    const section = params.section as string;

    const currentData = KANA_METADATA[category];

    if (!currentData || !currentData[section]) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Bagian tidak ditemukan...</div>;
    }

    const groups = currentData[section];

    const formatSectionName = (key: string) => {
        switch (key) {
            case 'basic': return 'Bagian Dasar';
            case 'dakuten': return 'Dakuten & Handakuten';
            case 'yoon': return 'Yoon (Kombinasi)';
            case 'special': return 'Kombinasi Spesial';
            default: return key;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800 flex flex-col">
            {/* HEADER NAVIGASI */}
            <div className="max-w-4xl mx-auto w-full mb-8 flex items-center justify-between">
                <button
                    onClick={() => router.push(`/select/${category}`)}
                    className="group flex items-center space-x-2 font-bold text-slate-400 hover:text-blue-600 transition-colors"
                >
                    <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                    <span>Kembali</span>
                </button>
            </div>

            {/* HEADER */}
            <header className="max-w-4xl mx-auto text-center mb-12">
                <div className="flex justify-center space-x-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-200 px-3 py-1 rounded-full">
                        {category}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-100 px-3 py-1 rounded-full">
                        {formatSectionName(section)}
                    </span>
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight capitalize">
                    Pilih Grup
                </h1>
            </header>

            {/* MAIN CONTENT */}
            <main className="max-w-4xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 flex-1">
                {groups.map((group) => (
                    <button
                        key={group.id}
                        onClick={() => router.push(`/stage/${category}/${group.id}`)}
                        className="bg-white border-2 border-slate-100 p-6 rounded-3xl hover:border-blue-300 hover:shadow-xl transition-all group relative overflow-hidden text-left active:scale-95 flex flex-col"
                    >
                        <div className="flex justify-between items-start mb-4 w-full">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 bg-slate-50 px-2 py-1 rounded">
                                {group.id}
                            </span>
                            <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                        </div>

                        {/* Preview Huruf */}
                        <div className="flex justify-center w-full space-x-3 mb-6">
                            {group.chars.slice(0, 5).map((char, idx) => (
                                <span key={idx} className="text-2xl font-bold text-slate-300 group-hover:text-blue-400 transition-colors">
                                    {char.k}
                                </span>
                            ))}
                        </div>

                        <h3 className="text-center w-full font-bold text-slate-800 text-lg">{group.title}</h3>
                    </button>
                ))}
            </main>

            <footer className="text-center py-12 text-slate-300 text-xs font-bold tracking-widest uppercase mt-auto">
                © 2026 KanaDrill Studio
            </footer>
        </div>
    );
};

export default GroupSelection;
