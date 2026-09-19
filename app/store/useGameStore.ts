import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StageScore {
    stars: number; // 0-3
    score: number; // For extra precision if needed
}

interface GameState {
    // category -> section -> group -> stage -> score
    progress: Record<string, Record<string, Record<string, Record<string, StageScore>>>>;
    
    // category -> section -> petals (perfect streak count)
    petals: Record<string, Record<string, number>>;
    
    // Actions
    completeStage: (category: string, section: string, group: string, stage: string, stars: number, score: number) => void;
    failStage: (category: string, section: string) => void; // Resets petals
    getGroupStars: (category: string, section: string, group: string) => number;
    resetProgress: () => void;
}

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            progress: {},
            petals: {},
            
            completeStage: (category, section, group, stage, stars, score) => set((state) => {
                const newProgress = { ...state.progress };
                if (!newProgress[category]) newProgress[category] = {};
                if (!newProgress[category][section]) newProgress[category][section] = {};
                if (!newProgress[category][section][group]) newProgress[category][section][group] = {};
                
                // Only save if it's a new high score for stars
                const currentStars = newProgress[category][section][group][stage]?.stars || 0;
                
                if (stars > currentStars) {
                    newProgress[category][section][group][stage] = { stars, score };
                }

                const newPetals = { ...state.petals };
                if (!newPetals[category]) newPetals[category] = {};
                
                // If it's a perfect 3-star finish, increment petals streak
                if (stars === 3) {
                    const currentPetals = newPetals[category][section] || 0;
                    // Max petals logic can be handled in UI, or we can cap it here. We'll let UI handle it.
                    newPetals[category][section] = currentPetals + 1;
                } else {
                    // "if you fail getting 3 star... petals reset"
                    newPetals[category][section] = 0;
                }

                return { progress: newProgress, petals: newPetals };
            }),
            
            failStage: (category, section) => set((state) => {
                const newPetals = { ...state.petals };
                if (!newPetals[category]) newPetals[category] = {};
                newPetals[category][section] = 0; // Reset streak
                return { petals: newPetals };
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

            resetProgress: () => set({ progress: {}, petals: {} })
        }),
        {
            name: 'kanadrill-storage',
        }
    )
);
