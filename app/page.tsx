"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// Pastikan path JSON sudah benar
import KANA_METADATA_RAW from './data/kana_metadata.json';
import { GroupData, KanaMetadata } from './types/kana';

// Cast JSON ke tipe yang sudah kita buat
const KANA_METADATA = KANA_METADATA_RAW as unknown as KanaMetadata;

const MainMenu: React.FC = () => {
    const router = useRouter();

    // State dengan tipe eksplisit
    const [category, setCategory] = useState<'hiragana' | 'katakana'>('hiragana');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);

    const currentData = KANA_METADATA[category];

    const openStudyModal = (group: GroupData) => {
        setSelectedGroup(group);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">

            {/* HEADER & TOGGLE */}
            <header className="max-w-4xl mx-auto text-center mb-10">
                <h1 className="text-4xl font-extrabold mb-6 text-slate-900 tracking-tight">
                    Kana<span className="text-blue-600">Drill</span>
                </h1>

                <div className="inline-flex bg-slate-200 p-1 rounded-xl shadow-inner">
                    {(['hiragana', 'katakana'] as const).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-8 py-2 rounded-lg font-bold transition-all duration-200 capitalize ${category === cat
                                    ? 'bg-white shadow-md text-blue-600'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="max-w-4xl mx-auto space-y-12">
                {Object.entries(currentData).map(([sectionKey, groups]) => (
                    <section key={sectionKey}>
                        <h2 className="text-xl font-bold mb-4 ml-2 text-slate-600 border-l-4 border-blue-500 pl-3 capitalize">
                            {sectionKey === 'basic' ? 'Bagian Dasar' :
                                sectionKey === 'dakuten' ? 'Dakuten & Handakuten' :
                                    'Kombinasi & Spesial'}
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {groups.map((group) => (
                                <div
                                    key={group.id}
                                    className="bg-white border-2 border-slate-100 p-6 rounded-3xl hover:border-blue-300 hover:shadow-xl transition-all group relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 bg-slate-50 px-2 py-1 rounded">
                                            {group.id}
                                        </span>
                                        <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                                    </div>

                                    {/* Preview Huruf */}
                                    <div className="flex justify-center space-x-3 mb-6">
                                        {group.chars.slice(0, 5).map((char, idx) => (
                                            <span key={idx} className="text-2xl font-bold text-slate-300 group-hover:text-blue-200 transition-colors">
                                                {char.k}
                                            </span>
                                        ))}
                                    </div>

                                    <h3 className="text-center font-bold text-slate-800 text-lg mb-4">{group.title}</h3>

                                    {/* Tombol Belajar */}
                                    <button
                                        onClick={() => openStudyModal(group)}
                                        className="w-full bg-slate-50 text-blue-600 py-3 rounded-2xl font-bold hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 active:scale-95"
                                    >
                                        Belajar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </main>

            {/* MODAL BELAJAR */}
            {showModal && selectedGroup && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

                        <div className="p-8 text-center border-b border-slate-50">
                            <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                {category}
                            </span>
                            <h2 className="text-3xl font-black text-slate-800 mt-3">{selectedGroup.title}</h2>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-5 gap-3">
                                {selectedGroup.chars.map((item, idx) => (
                                    <div key={idx} className="flex flex-col items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 group">
                                        <span className="text-3xl font-black text-slate-800 mb-1">{item.k}</span>
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">{item.r}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50/50 flex flex-col space-y-3">
                            <button
                                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95"
                                onClick={() => router.push(`/drill/${selectedGroup.id}?cat=${category}`)}
                            >
                                MULAI TES
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="text-center py-12 text-slate-300 text-xs font-bold tracking-widest uppercase">
                © 2026 KanaDrill Studio
            </footer>
        </div>
    );
};

export default MainMenu;