"use client";

import React, { useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import SequenceDrill from './SequenceDrill';
import { GroupData, KanaMetadata } from '../../types/kana';
import KANA_METADATA_RAW from '../../data/kana_metadata.json';

const KANA_METADATA = KANA_METADATA_RAW as unknown as KanaMetadata;

export default function DrillPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const category = (searchParams.get('cat') as 'hiragana' | 'katakana') || 'hiragana';
    const groupId = params.id as string;

    // --- SOLUSI: Gunakan useMemo daripada useEffect ---
    // Ini akan menghitung 'groupData' langsung saat render pertama
    // Gunakan useMemo dengan logika yang lebih linear
    const groupData = useMemo(() => {
        const sections = KANA_METADATA[category];
        if (!sections) return null;

        // 1. Ambil semua array (basic, dakuten, yoon) dan gabung jadi satu array besar
        // Object.values(sections) -> [ [GroupA, GroupB], [GroupC], ... ]
        // .flat() -> [ GroupA, GroupB, GroupC, ... ]
        const allGroups = Object.values(sections).flat() as GroupData[];

        // 2. Cari grup yang ID-nya cocok
        const found = allGroups.find(g => g.id === groupId);

        // 3. Kembalikan hasilnya (kalau gak ketemu kasih null)
        return found || null;
    }, [groupId, category]);

    // --- TYPE GUARD ---
    // Pastikan blok ini ada SEBELUM kamu memanggil {groupData.title}
    if (!groupData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="font-bold text-slate-400">Grup tidak ditemukan...</p>
            </div>
        );
    }

    // Di bawah sini, TypeScript sudah 100% yakin groupData ADALAH GroupData (bukan null/never)

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            {/* HEADER NAVIGASI */}
            <div className="max-w-md mx-auto flex justify-between items-center mb-12">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center space-x-2 font-bold text-slate-400 hover:text-blue-600 transition-colors"
                >
                    <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                    <span>Menu</span>
                </button>

                <div className="text-right">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1">
                        Latihan {category}
                    </p>
                    <h1 className="text-xl font-black text-slate-800 leading-none">{groupData.title}</h1>
                </div>
            </div>

            <div className="max-w-md mx-auto">
                {/* Gunakan key agar SequenceDrill reset saat pindah grup */}
                <SequenceDrill key={groupData.id} groupChars={groupData.chars} />
            </div>
        </div>
    );
}