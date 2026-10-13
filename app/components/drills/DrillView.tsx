"use client";

import React, { useMemo } from 'react';
import SequenceDrill from './SequenceDrill';
import DrillEngine from './DrillEngine';
import TrueFalseDrill from './TrueFalseDrill';
import FindFillDrill from './FindFillDrill';
import CheckTruthDrill from './CheckTruthDrill';
import FillTraceDrill from './FillTraceDrill';
import FlipItDrill from './FlipItDrill';
import QuickGlanceDrill from './QuickGlanceDrill';
import { getResolvedLevelById } from '../../utils/levelResolver';
import { SECTIONS_CONFIG } from '../../data/levels/index';

interface DrillViewProps {
    category: 'hiragana' | 'katakana';
    groupId: string;
    stageId: string;
    mode: string;
    onClose: (data?: any) => void;
    isSansSerif: boolean;
    onToggleSansSerif: () => void;
}

const DRILL_REGISTRY: Record<string, React.ComponentType<any>> = {
    'true-false': TrueFalseDrill,
    'true-false-multi': TrueFalseDrill,
    'sequence': SequenceDrill,
    'sequence-2': SequenceDrill,
    'find-fill': FindFillDrill,
    'check-truth': CheckTruthDrill,
    'fill-trace': FillTraceDrill,
    'flip-it': FlipItDrill,
    'quick-glance': QuickGlanceDrill,
};

export default function DrillView({ category, groupId, stageId, mode, onClose, isSansSerif, onToggleSansSerif }: DrillViewProps) {
    const level = useMemo(() => {
        return getResolvedLevelById(groupId, category);
    }, [groupId, category]);

    const stageConfig = useMemo(() => {
        return level?.gameModes.find(s => s.id === stageId);
    }, [level, stageId]);

    const section = useMemo(() => {
        for (const [secKey, secDef] of Object.entries(SECTIONS_CONFIG)) {
            if (secDef.groups.some(g => g.id === groupId)) return secKey;
        }
        return 'gojuon';
    }, [groupId]);

    if (!level) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDF0EB]">
                <p className="font-bold text-[#5C3A21]">Grup tidak ditemukan...</p>
            </div>
        );
    }

    const GameComponent = DRILL_REGISTRY[mode] || SequenceDrill;
    const targetScore = stageConfig?.scoreGoal ?? (mode === 'quick-glance' ? 20 : 10);
    const maxTime = stageConfig?.timer ?? 60;
    const drillOptions = stageConfig?.options || {};
    const isMulti = drillOptions.isMulti || mode === 'true-false-multi';

    return (
        <DrillEngine
            category={category}
            section={section}
            groupId={groupId}
            stageId={stageId}
            mode={mode}
            maxTime={maxTime}
            maxLives={3}
            targetScore={targetScore}
            onClose={onClose}
            isSansSerif={isSansSerif}
            onToggleSansSerif={onToggleSansSerif}
        >
            {({ onCorrect, onWrong, isSansSerif, onToggleSansSerif, isActive }) => (
                <GameComponent 
                    groupChars={level.chars} 
                    onCorrect={onCorrect} 
                    onWrong={onWrong} 
                    isSansSerif={isSansSerif}
                    onToggleSansSerif={onToggleSansSerif}
                    isMulti={isMulti}
                    isActive={isActive}
                    {...drillOptions}
                />
            )}
        </DrillEngine>
    );
}
