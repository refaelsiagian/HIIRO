"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KANA_METADATA } from '../../utils/kanaData';

const SectionSelection: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const category = params.category as 'hiragana' | 'katakana';

    const currentData = KANA_METADATA[category];

    if (!currentData) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Kategori tidak ditemukan...</div>;
    }

    const sections = Object.keys(currentData);

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
            <div className="max-w-4xl mx-auto w-full mb-8 flex items-center">
                <button
                    onClick={() => router.push('/')}
                    className="group flex items-center space-x-2 font-bold text-slate-400 hover:text-blue-600 transition-colors"
                >
                    <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                    <span>Menu Utama</span>
                </button>
            </div>

            {/* HEADER */}
            <header className="max-w-4xl mx-auto text-center mb-12">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-200 px-3 py-1 rounded-full mb-3 inline-block">
                    Kategori
                </span>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight capitalize">
                    {category}
                </h1>
                <p className="text-slate-500 font-medium mt-2">Pilih bagian yang ingin kamu pelajari</p>
            </header>

            {/* MAIN CONTENT */}
            <main className="max-w-4xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                {sections.map((sectionKey) => (
                    <button
                        key={sectionKey}
                        onClick={() => router.push(`/select/${category}/${sectionKey}`)}
                        className="bg-white border-2 border-slate-100 p-8 rounded-3xl hover:border-blue-300 hover:shadow-xl transition-all group text-left relative overflow-hidden active:scale-95"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">{formatSectionName(sectionKey)}</h2>
                        <p className="text-slate-400 text-sm font-medium">Terdapat {currentData[sectionKey].length} grup huruf</p>
                    </button>
                ))}
            </main>

            <footer className="text-center py-12 text-slate-300 text-xs font-bold tracking-widest uppercase mt-auto">
                © 2026 KanaDrill Studio
            </footer>
        </div>
    );
};

export default SectionSelection;
