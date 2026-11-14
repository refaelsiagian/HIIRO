"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { 
    checkAccountSyncStatus, 
    loadCloudProgressIntoStore, 
    transferLocalProgressToCloud, 
    startAnewFresh,
    restoreGuestData 
} from '../../lib/supabase/syncProgress';
import { SyncConfirmModal } from '../components/SyncConfirmModal';
import { useGameStore } from '../store/useGameStore';
import type { User } from '@supabase/supabase-js';

const HomePage: React.FC = () => {
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSyncModal, setShowSyncModal] = useState(false);

    const progress = useGameStore(state => state.progress);
    const petals = useGameStore(state => state.petals);

    const handleSyncStatus = async () => {
        const status = await checkAccountSyncStatus();
        if (status === 'existing') {
            await loadCloudProgressIntoStore();
        } else if (status === 'new_with_local_data') {
            setShowSyncModal(true);
        }
    };

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
            if (user) {
                await handleSyncStatus();
            } else {
                restoreGuestData();
            }
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            setLoading(false);
            if (currentUser) {
                await handleSyncStatus();
            } else {
                restoreGuestData();
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=/home`,
            },
        });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        restoreGuestData();
        setUser(null);
        router.replace('/');
    };

    const handleModalSync = async () => {
        await transferLocalProgressToCloud();
        setShowSyncModal(false);
    };

    const handleModalStartAnew = async () => {
        await startAnewFresh();
        setShowSyncModal(false);
    };

    // Calculate integrated category progress for Concept B
    const getStats = useMemo(() => {
        return (category: 'hiragana' | 'katakana') => {
            const catProgress = progress?.[category] || {};
            const catPetals = petals?.[category] || {};

            let totalStars = 0;
            let completedStages = 0;
            let totalPetals = 0;
            let lastGroup = '';

            for (const sec in catProgress) {
                for (const grp in catProgress[sec]) {
                    for (const stg in catProgress[sec][grp]) {
                        const item = catProgress[sec][grp][stg];
                        if (item?.stars > 0) {
                            completedStages++;
                            totalStars += item.stars;
                            lastGroup = grp;
                        }
                    }
                }
            }

            for (const sec in catPetals) {
                for (const grp in catPetals[sec]) {
                    for (const stg in catPetals[sec][grp]) {
                        totalPetals += catPetals[sec][grp][stg] || 0;
                    }
                }
            }

            let activeGroupName = '';
            if (lastGroup) {
                activeGroupName = lastGroup
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join('-');
            }

            // Exact totals defined in the curriculum:
            // Hiragana: Gojuon (61) + Dakuon (33) + Yoon (71) + Daishiken (4) = 169 stages
            // Katakana: Gojuon (61) + Dakuon (33) + Yoon (71) + Gairaion (23) + Daishiken (4) = 192 stages
            // Each stage has a max of 3 stars and 5 petals
            const totalStages = category === 'hiragana' ? 169 : 192;
            const maxStars = totalStages * 3;
            const maxPetals = totalStages * 5;

            const percentStages = totalStages > 0 ? Math.min(100, Math.round((completedStages / totalStages) * 100)) : 0;
            const percentStars = maxStars > 0 ? Math.min(100, Math.round((totalStars / maxStars) * 100)) : 0;
            const percentPetals = maxPetals > 0 ? Math.min(100, Math.round((totalPetals / maxPetals) * 100)) : 0;

            return {
                totalStages,
                maxStars,
                maxPetals,
                totalStars,
                completedStages,
                totalPetals,
                percentStages,
                percentStars,
                percentPetals,
                activeGroupName,
            };
        };
    }, [progress, petals]);

    const hiraganaStats = getStats('hiragana');
    const katakanaStats = getStats('katakana');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center font-outfit text-[#5C3A21]/50 text-base">
                Memuat Hiiro...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent p-6 font-sans text-slate-800 flex flex-col overflow-hidden relative">
            <SyncConfirmModal 
                isOpen={showSyncModal}
                onSync={handleModalSync}
                onStartAnew={handleModalStartAnew}
            />

            <div className="flex-1 flex flex-col justify-between max-w-4xl w-full mx-auto animate-fadein">
                {/* TOP BAR / USER PROFILE ON TOP CORNER */}
                <div className="w-full flex justify-between items-center pt-2 sm:pt-4 px-2 z-20">
                    {/* BRAND LOGO */}
                    <Link 
                        href="/home"
                        className="font-arbutus text-2xl tracking-tight text-[#5C3A21] select-none hover:opacity-80 transition-opacity"
                    >
                        
                    </Link>

                    {/* PROFILE BADGE */}
                    {user ? (
                        <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm border border-[#DF7956]/30 px-4 py-2 rounded-full shadow-sm">
                            <span className="text-sm font-medium font-outfit text-[#5C3A21]">
                                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                            </span>
                            <span className="text-[#5C3A21]/30">|</span>
                            <button
                                onClick={handleLogout}
                                className="text-xs font-semibold text-[#DF7956] hover:text-[#C15A3D] transition-colors font-outfit uppercase tracking-wider cursor-pointer"
                            >
                                Keluar
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2.5 bg-white/70 backdrop-blur-sm border border-[#DF7956]/30 px-3.5 py-1.5 rounded-full shadow-sm">
                            <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 bg-[#DF7956]/15 text-[#DF7956] rounded-full font-outfit">
                                Tamu
                            </span>
                            <button
                                onClick={handleLogin}
                                className="text-xs font-medium text-[#5C3A21] hover:text-[#DF7956] transition-colors font-outfit cursor-pointer flex items-center space-x-1"
                            >
                                <span>Hubungkan Akun</span>
                            </button>
                            <span className="text-[#5C3A21]/30">|</span>
                            <button
                                onClick={() => router.push('/')}
                                className="text-xs font-semibold text-[#DF7956]/70 hover:text-[#DF7956] transition-colors font-outfit cursor-pointer"
                                title="Kembali ke halaman utama"
                            >
                                Keluar
                            </button>
                        </div>
                    )}
                </div>

                {/* MAIN CONTENT / CONCEPT B INTEGRATED PROGRESS CARDS */}
                <main className="w-full flex flex-col items-center sm:items-stretch sm:flex-row justify-center space-y-8 sm:space-y-0 sm:space-x-10 lg:space-x-12 my-auto py-4">
                    
                    {/* ================= HIRAGANA CARD ================= */}
                    <Link
                        href="/select/hiragana"
                        className="flex-1 w-full max-w-sm sm:max-w-md bg-[#DF7956] text-[#FFEFE8] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl hover:scale-105 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden active:scale-95 min-h-[540px] sm:min-h-[580px]"
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-8xl sm:text-9xl font-black mb-3 group-hover:scale-110 transition-transform duration-300 font-serif select-none leading-none">
                                あ
                            </span>
                            <h2 className="text-3xl sm:text-4xl tracking-tight font-arbutus select-none">
                                Hiragana
                            </h2>
                            <p className="mt-1.5 font-medium opacity-85 font-outfit text-sm sm:text-base select-none">
                                Huruf Jepang dasar
                            </p>
                        </div>

                        {/* HIERARCHICAL PROGRESS BLOCK */}
                        <div className="w-full mt-7 pt-5 flex flex-col">
                            {/* PRIMARY HIGHLIGHT: TAHAP SELESAI */}
                            <div className="flex flex-col">
                                <span className="text-sm sm:text-base font-medium opacity-90 font-outfit">
                                    Tahap Selesai
                                </span>
                                <span className="text-4xl sm:text-5xl font-black font-outfit tracking-tight my-1">
                                    {hiraganaStats.percentStages}%
                                </span>
                                <div className="w-full bg-black/20 h-2.5 sm:h-3 rounded-full overflow-hidden shadow-inner mt-1">
                                    <div 
                                        className="bg-white h-full rounded-full transition-all duration-500 shadow-sm"
                                        style={{ width: `${hiraganaStats.percentStages}%` }}
                                    />
                                </div>
                                <div className="text-right text-xs sm:text-sm font-semibold font-outfit opacity-80 mt-1.5">
                                    {hiraganaStats.completedStages} / {hiraganaStats.totalStages} Tahap
                                </div>
                            </div>

                            {/* SECONDARY HIERARCHY: BINTANG & KELOPAK (2 COLUMNS) */}
                            <div className="mt-8 grid grid-cols-2 gap-4 pb-6">
                                {/* Bintang */}
                                <div className="flex flex-col">
                                    <span className="text-xs sm:text-sm font-medium opacity-85 font-outfit flex items-center space-x-1">
                                        <span className="text-[#FFD166] text-sm leading-none">★</span>
                                        <span>Bintang</span>
                                    </span>
                                    <span className="text-2xl sm:text-3xl font-extrabold font-outfit my-0.5">
                                        {hiraganaStats.percentStars}%
                                    </span>
                                    <span className="text-[11px] sm:text-xs font-medium font-outfit opacity-75">
                                        {hiraganaStats.totalStars} / {hiraganaStats.maxStars}
                                    </span>
                                </div>

                                {/* Kelopak */}
                                <div className="flex flex-col">
                                    <span className="text-xs sm:text-sm font-medium opacity-85 font-outfit flex items-center space-x-1">
                                        <span className="text-sm leading-none">🌸</span>
                                        <span>Kelopak</span>
                                    </span>
                                    <span className="text-2xl sm:text-3xl font-extrabold font-outfit my-0.5">
                                        {hiraganaStats.percentPetals}%
                                    </span>
                                    <span className="text-[11px] sm:text-xs font-medium font-outfit opacity-75">
                                        {hiraganaStats.totalPetals} / {hiraganaStats.maxPetals}
                                    </span>
                                </div>
                            </div>

                            {hiraganaStats.activeGroupName && (
                                <div className="text-[11px] sm:text-sm font-outfit opacity-75 text-center truncate mt-3 pt-2">
                                    Terakhir: <span className="font-semibold">{hiraganaStats.activeGroupName}</span>
                                </div>
                            )}
                        </div>
                    </Link>

                    {/* ================= KATAKANA CARD ================= */}
                    <Link
                        href="/select/katakana"
                        className="flex-1 w-full max-w-sm sm:max-w-md bg-gradient-to-br from-[#F07B55] to-[#FFE8E0] text-[#6F3E28] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl hover:scale-105 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden active:scale-95 min-h-[540px] sm:min-h-[580px]"
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-8xl sm:text-9xl font-black mb-3 group-hover:scale-110 transition-transform duration-300 font-serif select-none leading-none">
                                ア
                            </span>
                            <h2 className="text-3xl sm:text-4xl tracking-tight font-arbutus select-none">
                                Katakana
                            </h2>
                            <p className="mt-1.5 font-medium opacity-85 font-outfit text-sm sm:text-base select-none">
                                Untuk kata serapan asing
                            </p>
                        </div>

                        {/* HIERARCHICAL PROGRESS BLOCK */}
                        <div className="w-full mt-7 pt-5 flex flex-col">
                            {/* PRIMARY HIGHLIGHT: TAHAP SELESAI */}
                            <div className="flex flex-col">
                                <span className="text-sm sm:text-base font-medium opacity-90 font-outfit text-[#6F3E28]">
                                    Tahap Selesai
                                </span>
                                <span className="text-4xl sm:text-5xl font-black font-outfit tracking-tight my-1 text-[#6F3E28]">
                                    {katakanaStats.percentStages}%
                                </span>
                                <div className="w-full bg-[#6F3E28]/15 h-2.5 sm:h-3 rounded-full overflow-hidden shadow-inner mt-1">
                                    <div 
                                        className="bg-[#DF7956] h-full rounded-full transition-all duration-500 shadow-sm"
                                        style={{ width: `${katakanaStats.percentStages}%` }}
                                    />
                                </div>
                                <div className="text-right text-xs sm:text-sm font-semibold font-outfit opacity-80 mt-1.5 text-[#6F3E28]">
                                    {katakanaStats.completedStages} / {katakanaStats.totalStages} Tahap
                                </div>
                            </div>

                            {/* SECONDARY HIERARCHY: BINTANG & KELOPAK (2 COLUMNS) */}
                            <div className="mt-8 grid grid-cols-2 gap-4 pb-6 text-[#6F3E28]">
                                {/* Bintang */}
                                <div className="flex flex-col">
                                    <span className="text-xs sm:text-sm font-medium opacity-85 font-outfit flex items-center space-x-1">
                                        <span className="text-[#D97706] text-sm leading-none">★</span>
                                        <span>Bintang</span>
                                    </span>
                                    <span className="text-2xl sm:text-3xl font-extrabold font-outfit my-0.5">
                                        {katakanaStats.percentStars}%
                                    </span>
                                    <span className="text-[11px] sm:text-xs font-medium font-outfit opacity-75">
                                        {katakanaStats.totalStars} / {katakanaStats.maxStars}
                                    </span>
                                </div>

                                {/* Kelopak */}
                                <div className="flex flex-col">
                                    <span className="text-xs sm:text-sm font-medium opacity-85 font-outfit flex items-center space-x-1">
                                        <span className="text-sm leading-none">🌸</span>
                                        <span>Kelopak</span>
                                    </span>
                                    <span className="text-2xl sm:text-3xl font-extrabold font-outfit my-0.5">
                                        {katakanaStats.percentPetals}%
                                    </span>
                                    <span className="text-[11px] sm:text-xs font-medium font-outfit opacity-75">
                                        {katakanaStats.totalPetals} / {katakanaStats.maxPetals}
                                    </span>
                                </div>
                            </div>

                            {katakanaStats.activeGroupName && (
                                <div className="text-[11px] sm:text-sm font-outfit opacity-75 text-center truncate mt-3 pt-2">
                                    Terakhir: <span className="font-semibold">{katakanaStats.activeGroupName}</span>
                                </div>
                            )}
                        </div>
                    </Link>
                </main>

                <footer className="text-center py-8 text-[#5C3A21]/50 text-xs font-bold tracking-widest uppercase font-outfit select-none">
                    © 2026 Hiiro Studio
                </footer>
            </div>
        </div>
    );
};

export default HomePage;

