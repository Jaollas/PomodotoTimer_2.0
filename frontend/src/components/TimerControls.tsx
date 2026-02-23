import React from 'react';

interface TimerControlsProps {
    isRunning: boolean;
    isPaused: boolean;
    start: () => void;
    pause: () => void;
    reset: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({ isRunning, isPaused, start, pause, reset }) => {
    return (
        <div className="timer-controls">
            {!isRunning && !isPaused && (
                <button onClick={start} className="btn btn-start">Iniciar</button>
            )}
            {isRunning && (
                <button onClick={pause} className="btn btn-pause">Pausar</button>
            )}
            {isPaused && (
                <button onClick={start} className="btn btn-resume">Retomar</button>
            )}
            <button onClick={reset} className="btn btn-reset">Resetar</button>
        </div>
    );
};

export default TimerControls;
