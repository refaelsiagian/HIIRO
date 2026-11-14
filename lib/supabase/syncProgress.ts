import { createClient } from './client';
import { useGameStore } from '../../app/store/useGameStore';
import recoveredData from './recoveredGuestData.json';

export const GUEST_STORAGE_KEY = 'kanadrill-guest-data';

// Helper to count completed stages in a progress object
function countStages(progress: Record<string, any> = {}): number {
    let count = 0;
    for (const c in progress) {
        for (const s in progress[c]) {
            for (const g in progress[c][s]) {
                for (const st in progress[c][s][g]) {
                    if (progress[c][s][g][st]?.stars > 0) count++;
                }
            }
        }
    }
    return count;
}

// Retrieve guest data: checks localStorage, fallback to the recovered 106 stages
export function getGuestData() {
    if (typeof window === 'undefined') {
        return (recoveredData as any).state;
    }
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.progress && countStages(parsed.progress) > 0) {
                // If saved data has at least as many stages as recovered, use it
                const savedCount = countStages(parsed.progress);
                const recoveredCount = countStages((recoveredData as any).state.progress);
                if (savedCount >= recoveredCount) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error('Failed to parse guest data from localStorage:', e);
        }
    }
    return (recoveredData as any).state;
}

export function saveGuestData(data?: { progress: any; petals: any; highestPetals?: any }) {
    if (typeof window === 'undefined') return;
    const toSave = data || {
        progress: useGameStore.getState().progress,
        petals: useGameStore.getState().petals,
        highestPetals: useGameStore.getState().highestPetals || useGameStore.getState().petals,
    };
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(toSave));
}

// Restores guest data into the active Zustand store
export function restoreGuestData() {
    const data = getGuestData();
    useGameStore.setState({
        progress: data.progress || {},
        petals: data.petals || {},
        highestPetals: data.highestPetals || data.petals || {},
    });
    saveGuestData(data);
}

// Backward compatibility alias
export const backupGuestProgress = saveGuestData;
export const restoreGuestProgress = () => {
    restoreGuestData();
    return true;
};
export const clearGuestBackup = () => {};

export function hasLocalProgress(): boolean {
    const guest = getGuestData();
    return countStages(guest.progress) > 0;
}

export async function checkAccountSyncStatus(): Promise<'existing' | 'new_with_local_data' | 'new_empty'> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return 'new_empty';

    // If user has already initialized/decided their account, treat as existing
    if (user.user_metadata?.initialized === true) {
        return 'existing';
    }

    try {
        const { data: cloudRows, error } = await supabase
            .from('user_progress')
            .select('id')
            .limit(1);

        if (error) {
            console.error('Error checking cloud progress:', error);
            return 'new_empty';
        }

        const hasCloudData = cloudRows && cloudRows.length > 0;

        if (hasCloudData) {
            return 'existing';
        }

        if (hasLocalProgress()) {
            return 'new_with_local_data';
        }

        return 'new_empty';
    } catch (err) {
        console.error('Failed to check sync status:', err);
        return 'new_empty';
    }
}

export async function loadCloudProgressIntoStore() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    try {
        const { data: cloudRows, error } = await supabase
            .from('user_progress')
            .select('*');

        if (error || !cloudRows) {
            console.error('Error loading cloud progress:', error);
            return;
        }

        const newProgress: Record<string, Record<string, Record<string, Record<string, { stars: number; score: number }>>>> = {};
        const newPetals: Record<string, Record<string, Record<string, Record<string, number>>>> = {};
        const newHighestPetals: Record<string, Record<string, Record<string, Record<string, number>>>> = {};

        for (const row of cloudRows) {
            const parts = row.stage_key.split('/');
            if (parts.length !== 4) continue;
            const [cat, sec, grp, stg] = parts;

            newProgress[cat] = { ...(newProgress[cat] || {}) };
            newProgress[cat][sec] = { ...(newProgress[cat][sec] || {}) };
            newProgress[cat][sec][grp] = { ...(newProgress[cat][sec][grp] || {}) };
            newProgress[cat][sec][grp][stg] = { stars: row.stars, score: row.score };

            newPetals[cat] = { ...(newPetals[cat] || {}) };
            newPetals[cat][sec] = { ...(newPetals[cat][sec] || {}) };
            newPetals[cat][sec][grp] = { ...(newPetals[cat][sec][grp] || {}) };
            newPetals[cat][sec][grp][stg] = row.petals || 0;

            newHighestPetals[cat] = { ...(newHighestPetals[cat] || {}) };
            newHighestPetals[cat][sec] = { ...(newHighestPetals[cat][sec] || {}) };
            newHighestPetals[cat][sec][grp] = { ...(newHighestPetals[cat][sec][grp] || {}) };
            newHighestPetals[cat][sec][grp][stg] = row.highest_petals ?? row.petals ?? 0;
        }

        useGameStore.setState({
            progress: newProgress,
            petals: newPetals,
            highestPetals: newHighestPetals,
        });
    } catch (err) {
        console.error('Failed to load cloud progress:', err);
    }
}

export async function transferLocalProgressToCloud() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    try {
        const guest = getGuestData();
        const upserts: Array<{
            user_id: string;
            stage_key: string;
            stars: number;
            score: number;
            petals: number;
            highest_petals: number;
            updated_at: string;
        }> = [];

        // Always include __init__ marker so cloudRows > 0
        upserts.push({
            user_id: user.id,
            stage_key: '__init__',
            stars: 0,
            score: 0,
            petals: 0,
            highest_petals: 0,
            updated_at: new Date().toISOString(),
        });

        for (const cat in guest.progress) {
            for (const sec in guest.progress[cat]) {
                for (const grp in guest.progress[cat][sec]) {
                    for (const stg in guest.progress[cat][sec][grp]) {
                        const item = guest.progress[cat][sec][grp][stg];
                        if (item && item.stars > 0) {
                            const currentPetals = guest.petals?.[cat]?.[sec]?.[grp]?.[stg] || 0;
                            const highestCount = guest.highestPetals?.[cat]?.[sec]?.[grp]?.[stg] || currentPetals;
                            upserts.push({
                                user_id: user.id,
                                stage_key: `${cat}/${sec}/${grp}/${stg}`,
                                stars: item.stars,
                                score: item.score,
                                petals: currentPetals,
                                highest_petals: highestCount,
                                updated_at: new Date().toISOString(),
                            });
                        }
                    }
                }
            }
        }

        if (upserts.length > 0) {
            await supabase.from('user_progress').upsert(upserts, {
                onConflict: 'user_id,stage_key',
            });
        }

        await supabase.auth.updateUser({
            data: { initialized: true }
        });

        // Set store to guest data since user chose to migrate it to this account
        useGameStore.setState({
            progress: guest.progress,
            petals: guest.petals,
            highestPetals: guest.highestPetals || guest.petals,
        });
    } catch (err) {
        console.error('Failed to transfer local progress to cloud:', err);
    }
}

export async function startAnewFresh() {
    // 1. Ensure guest data is securely preserved
    saveGuestData();

    // 2. Reset active store for this account
    useGameStore.getState().resetProgress();

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    try {
        await supabase.from('user_progress').upsert({
            user_id: user.id,
            stage_key: '__init__',
            stars: 0,
            score: 0,
            petals: 0,
            highest_petals: 0,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,stage_key',
        });

        await supabase.auth.updateUser({
            data: { initialized: true }
        });
    } catch (err) {
        console.error('Failed to record account initialization:', err);
    }
}

export async function saveStageProgressToCloud(
    category: string,
    section: string,
    group: string,
    stage: string,
    stars: number,
    score: number,
    petals: number,
    highestPetals?: number
) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Playing as guest: persist directly to guest storage!
        saveGuestData();
        return;
    }

    const stageKey = `${category}/${section}/${group}/${stage}`;

    try {
        const { error } = await supabase.from('user_progress').upsert({
            user_id: user.id,
            stage_key: stageKey,
            stars,
            score,
            petals,
            highest_petals: highestPetals ?? petals,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,stage_key',
        });
        if (error) {
            console.error('Failed to save stage to cloud (supabase error):', error);
        }
    } catch (err) {
        console.error('Failed to save stage to cloud:', err);
    }
}
