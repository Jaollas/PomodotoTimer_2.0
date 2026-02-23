import React from 'react';
import { formatTime } from '../utils/timeFormatter';
import { TimerMode } from '../hooks/useTimer';

interface TimerDisplayProps {
    timeRemaining: number;
    mode: TimerMode;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeRemaining, mode }) => {
    return (
        <div className={`timer-display ${mode}`}>
            <h1>{formatTime(timeRemaining)}</h1>
        </div>
    );
};

export default TimerDisplay;
