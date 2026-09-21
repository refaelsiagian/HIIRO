"use client";

import React, { useMemo } from 'react';
import SequenceDrill from './SequenceDrill';
import DrillEngine from './DrillEngine';
import TrueFalseDrill from './TrueFalseDrill';
import FindFillDrill from './FindFillDrill';
import { GroupData } from '../../types/kana';
import { KANA_METADATA } from '../../utils/kanaData';

interface DrillViewProps {
    category: 'hiragana' | 'katakana';
    groupId: string;
    stageId: string;
    mode: string;
    onClose: () => void;
    isSansSerif: boolean;
    onToggleSansSerif: () => void;
}

export default function DrillView({ category, groupId, stageId, mode, onClose, isSansSerif, onToggleSansSerif }: DrillViewProps) {
    const groupData = useMemo(() => {
        const typesData = KANA_METADATA[category];
        if (!typesData) return null;

        for (const typeData of typesData) {
            const foundGroup = typeData.groups.find(g => g.id === groupId);
            if (foundGroup) return foundGroup;
        }
        return null;
    }, [groupId, category]);

    const section = useMemo(() => {
        const typesData = KANA_METADATA[category];
        if (!typesData) return 'gojuon';
        for (const typeData of typesData) {
            if (typeData.groups.find(g => g.id === groupId)) return typeData.id;
        }
        return 'gojuon';
    }, [groupId, category]);

    if (!groupData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDF0EB]">
                <p className="font-bold text-[#5C3A21]">Grup tidak ditemukan...</p>
            </div>
        );
    }

    let GameComponent = SequenceDrill;
    let targetScore = 5; // e.g. 5 rounds for sequence
    let maxTime = 60;

    if (mode === 'true-false') {
        GameComponent = TrueFalseDrill;
        targetScore = 10;
        maxTime = 45;
    } else if (mode === 'find-fill') {
        GameComponent = FindFillDrill;
        targetScore = 5;
        maxTime = 90;
    }

    return (
        <DrillEngine
            category={category}
            section={section}
            groupId={groupId}
            stageId={stageId}
            maxTime={maxTime}
            maxLives={3}
            targetScore={targetScore}
            onClose={onClose}
            isSansSerif={isSansSerif}
            onToggleSansSerif={onToggleSansSerif}
        >
            {({ onCorrect, onWrong, isSansSerif, onToggleSansSerif }) => (
                <GameComponent 
                    groupChars={groupData.chars} 
                    onCorrect={onCorrect} 
                    onWrong={onWrong} 
                    isSansSerif={isSansSerif}
                    onToggleSansSerif={onToggleSansSerif}
                />
            )}
        </DrillEngine>
    );
}
