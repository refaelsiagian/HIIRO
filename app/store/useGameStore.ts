import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { saveStageProgressToCloud } from '../../lib/supabase/syncProgress';

interface StageScore {
    stars: number; // 0-3
    score: number; // For extra precision if needed
}

interface GameState {
    // category -> section -> group -> stage -> score
    progress: Record<string, Record<string, Record<string, Record<string, StageScore>>>>;
    
    // category -> section -> group -> stage -> petals (active continuous streak)
    petals: Record<string, Record<string, Record<string, Record<string, number>>>>;

    // category -> section -> group -> stage -> highest petals ever reached (peak mastery, never resets)
    highestPetals: Record<string, Record<string, Record<string, Record<string, number>>>>;
    
    // Active quiz/drill state for ambient UI adjustments
    isQuizActive: boolean;
    setIsQuizActive: (active: boolean) => void;

    // Actions
    completeStage: (category: string, section: string, group: string, stage: string, stars: number, score: number) => void;
    failStage: (category: string, section: string, group: string, stage: string) => void; // Resets active streak, preserves highest
    getGroupStars: (category: string, section: string, group: string) => number;
    getGroupHighestPetals: (category: string, section: string, group: string) => number;
    getSectionStars: (category: string, section: string) => number;
    getSectionHighestPetals: (category: string, section: string) => number;
    resetProgress: () => void;
}

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            progress: {},
            petals: {},
            highestPetals: {},
            isQuizActive: false,
            setIsQuizActive: (isQuizActive: boolean) => set({ isQuizActive }),
            
            completeStage: (category, section, group, stage, stars, score) => set((state) => {
                const newProgress = { ...state.progress };
                newProgress[category] = { ...(newProgress[category] || {}) };
                newProgress[category][section] = { ...(newProgress[category][section] || {}) };
                newProgress[category][section][group] = { ...(newProgress[category][section][group] || {}) };
                
                // Only save if it's a new high score for stars
                const currentStars = newProgress[category][section][group][stage]?.stars || 0;
                let finalStars = currentStars;
                let finalScore = newProgress[category][section][group][stage]?.score || score;
                
                if (stars > currentStars) {
                    newProgress[category][section][group][stage] = { stars, score };
                    finalStars = stars;
                    finalScore = score;
                }

                const newPetals = { ...state.petals };
                newPetals[category] = { ...(newPetals[category] || {}) };
                newPetals[category][section] = { ...(typeof newPetals[category][section] === 'object' ? newPetals[category][section] : {}) };
                newPetals[category][section][group] = { ...(newPetals[category][section][group] || {}) };

                const newHighestPetals = { ...(state.highestPetals || {}) };
                newHighestPetals[category] = { ...(newHighestPetals[category] || {}) };
                newHighestPetals[category][section] = { ...(typeof newHighestPetals[category][section] === 'object' ? newHighestPetals[category][section] : {}) };
                newHighestPetals[category][section][group] = { ...(newHighestPetals[category][section][group] || {}) };

                const prevHighest = newHighestPetals[category][section][group][stage] || newPetals[category][section][group][stage] || 0;
                
                let nextPetals = 0;
                let nextHighest = prevHighest;

                // If it's a perfect 3-star finish, increment active petals streak (max 5)
                if (stars === 3) {
                    const currentPetals = newPetals[category][section][group][stage] || 0;
                    nextPetals = Math.min(5, currentPetals + 1);
                    nextHighest = Math.max(prevHighest, nextPetals);
                    newPetals[category][section][group][stage] = nextPetals;
                    newHighestPetals[category][section][group][stage] = nextHighest;
                } else {
                    // "if you fail getting 3 star... petals streak resets, but highest is kept"
                    newPetals[category][section][group][stage] = 0;
                    newHighestPetals[category][section][group][stage] = prevHighest;
                }

                // Asynchronously save to cloud with both current active petals and highest petals
                saveStageProgressToCloud(category, section, group, stage, finalStars, finalScore, nextPetals, nextHighest);

                return { progress: newProgress, petals: newPetals, highestPetals: newHighestPetals };
            }),
            
            failStage: (category, section, group, stage) => set((state) => {
                const newPetals = { ...state.petals };
                newPetals[category] = { ...(newPetals[category] || {}) };
                newPetals[category][section] = { ...(typeof newPetals[category][section] === 'object' ? newPetals[category][section] : {}) };
                newPetals[category][section][group] = { ...(newPetals[category][section][group] || {}) };
                newPetals[category][section][group][stage] = 0; // Reset active streak

                const newHighestPetals = { ...(state.highestPetals || {}) };
                newHighestPetals[category] = { ...(newHighestPetals[category] || {}) };
                newHighestPetals[category][section] = { ...(typeof newHighestPetals[category][section] === 'object' ? newHighestPetals[category][section] : {}) };
                newHighestPetals[category][section][group] = { ...(newHighestPetals[category][section][group] || {}) };
                const currentHighest = newHighestPetals[category][section][group][stage] || 0;

                const currentStars = state.progress[category]?.[section]?.[group]?.[stage]?.stars || 0;
                const currentScore = state.progress[category]?.[section]?.[group]?.[stage]?.score || 0;
                // Cloud updates petals to 0 (reset active streak) and preserves the peak highest petals!
                saveStageProgressToCloud(category, section, group, stage, currentStars, currentScore, 0, currentHighest);

                return { petals: newPetals, highestPetals: newHighestPetals };
            }),

            getGroupStars: (category, section, group) => {
                const state = get();
                const groupData = state.progress[category]?.[section]?.[group];
                if (!groupData) return 0;
                
                let total = 0;
                for (const stage in groupData) {
                    total += groupData[stage].stars;
                }
                return total;
            },

            getGroupHighestPetals: (category, section, group) => {
                const state = get();
                const groupData = state.highestPetals?.[category]?.[section]?.[group] || state.petals?.[category]?.[section]?.[group];
                if (!groupData) return 0;
                
                let total = 0;
                for (const stage in groupData) {
                    total += Math.min(5, groupData[stage] || 0);
                }
                return total;
            },

            getSectionStars: (category, section) => {
                const state = get();
                const secData = state.progress[category]?.[section];
                if (!secData) return 0;
                
                let total = 0;
                for (const grp in secData) {
                    for (const stg in secData[grp]) {
                        total += secData[grp][stg].stars;
                    }
                }
                return total;
            },

            getSectionHighestPetals: (category, section) => {
                const state = get();
                const secData = state.highestPetals?.[category]?.[section] || state.petals?.[category]?.[section];
                if (!secData) return 0;
                
                let total = 0;
                for (const grp in secData) {
                    for (const stg in secData[grp]) {
                        total += Math.min(5, secData[grp][stg] || 0);
                    }
                }
                return total;
            },

            resetProgress: () => set({ progress: {}, petals: {}, highestPetals: {} })
        }),
        {
            name: 'kanadrill-storage',
            partialize: (state) => ({ 
                progress: state.progress, 
                petals: state.petals,
                highestPetals: state.highestPetals || state.petals
            }),
        }
    )
);
