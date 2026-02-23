import { useReducer, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface Durations {
    focus: number;
    shortBreak: number;
    longBreak: number;
}

interface TimerState {
    mode: TimerMode;
    isRunning: boolean;
    isPaused: boolean;
    isComplete: boolean;
    durations: Durations;
    timeRemaining: number;
}

type Action =
    | { type: 'tick' }
    | { type: 'start' }
    | { type: 'pause' }
    | { type: 'reset' }
    | { type: 'set_mode'; payload: TimerMode }
    | { type: 'update_durations'; payload: Partial<Durations> };

const ACTIONS = {
    TICK: 'tick' as const,
    START: 'start' as const,
    PAUSE: 'pause' as const,
    RESET: 'reset' as const,
    SET_MODE: 'set_mode' as const,
    UPDATE_DURATIONS: 'update_durations' as const,
};

const reducer = (state: TimerState, action: Action): TimerState => {
    switch (action.type) {
        case ACTIONS.SET_MODE:
            return {
                ...state,
                mode: action.payload,
                timeRemaining: state.durations[action.payload] * 60,
                isRunning: false,
                isPaused: false,
                isComplete: false,
            };
        case ACTIONS.START:
            return { ...state, isRunning: true, isPaused: false, isComplete: false };
        case ACTIONS.PAUSE:
            return { ...state, isRunning: false, isPaused: true };
        case ACTIONS.TICK:
            if (state.timeRemaining <= 1) {
                return { ...state, isRunning: false, isPaused: false, timeRemaining: 0, isComplete: true };
            }
            return { ...state, timeRemaining: state.timeRemaining - 1 };
        case ACTIONS.RESET:
            return {
                ...state,
                isRunning: false,
                isPaused: false,
                isComplete: false,
                timeRemaining: state.durations[state.mode] * 60,
            };
        case ACTIONS.UPDATE_DURATIONS:
            const newDurations = { ...state.durations, ...action.payload };
            return {
                ...state,
                durations: newDurations,
                timeRemaining: state.isRunning ? state.timeRemaining : newDurations[state.mode] * 60,
            };
        default:
            return state;
    }
};

export const useTimer = (initialDurations: Durations) => {
    const { user } = useAuth();
    const [state, dispatch] = useReducer(reducer, {
        mode: 'focus',
        isRunning: false,
        isPaused: false,
        isComplete: false,
        durations: initialDurations,
        timeRemaining: initialDurations.focus * 60,
    });

    const timerRef = useRef<number | null>(null);
    const audioRef = useRef(new Audio('/sounds/stop.mp3'));

    const tick = useCallback(() => {
        dispatch({ type: ACTIONS.TICK });
    }, []);

    const setMode = useCallback((mode: TimerMode) => dispatch({ type: ACTIONS.SET_MODE, payload: mode }), []);

    useEffect(() => {
        if (state.isRunning && state.timeRemaining > 0) {
            timerRef.current = window.setInterval(tick, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [state.isRunning, state.timeRemaining, tick]);

    useEffect(() => {
        if (state.isComplete) {
            let plays = 0;
            const audio = audioRef.current;
            const playSound = () => {
                if (plays < 3) {
                    audio.currentTime = 0;
                    audio.play().catch(e => console.log("Audio play blocked", e));
                    plays++;
                    setTimeout(playSound, 100);
                }
            };
            playSound();

            // Log session to Supabase if it was a focus session
            if (state.mode === 'focus' && user) {
                const saveSession = async () => {
                    const { error } = await supabase.from('sessions').insert([
                        {
                            user_id: user.id,
                            mode: 'focus',
                            duration: state.durations.focus,
                        },
                    ]);
                    if (error) console.error('Error saving session:', error);
                };
                saveSession();
            }

            if (state.mode === 'focus') {
                setMode('shortBreak');
            } else {
                setMode('focus');
            }
        }
    }, [state.isComplete, state.mode, state.durations.focus, user, setMode]);

    const start = () => {
        const whistle = new Audio('sounds/start.mp3');
        whistle.play().catch(e => console.log("Whistle sound failed to play:", e));
        dispatch({ type: ACTIONS.START });
    };

    const pause = () => dispatch({ type: ACTIONS.PAUSE });
    const reset = () => dispatch({ type: ACTIONS.RESET });
    const updateDurations = (durations: Partial<Durations>) => dispatch({ type: ACTIONS.UPDATE_DURATIONS, payload: durations });

    return {
        ...state,
        start,
        pause,
        reset,
        setMode,
        updateDurations,
    };
};
