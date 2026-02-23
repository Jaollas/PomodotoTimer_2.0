import React from 'react';
import { TimerMode } from '../hooks/useTimer';

interface ModeSelectorProps {
    currentMode: TimerMode;
    setMode: (mode: TimerMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, setMode }) => {
    return (
        <div className="mode-selector">
            <button
                className={`mode-btn ${currentMode === 'focus' ? 'active' : ''}`}
                onClick={() => setMode('focus')}
            >
                Foco
            </button>
            <button
                className={`mode-btn ${currentMode === 'shortBreak' ? 'active' : ''}`}
                onClick={() => setMode('shortBreak')}
            >
                Intervalo Curto
            </button>
            <button
                className={`mode-btn ${currentMode === 'longBreak' ? 'active' : ''}`}
                onClick={() => setMode('longBreak')}
            >
                Intervalo Longo
            </button>
        </div>
    );
};

export default ModeSelector;
