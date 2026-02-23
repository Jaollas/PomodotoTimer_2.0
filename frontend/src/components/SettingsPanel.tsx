import React, { useState } from 'react';
import { Durations } from '../hooks/useTimer';

interface SettingsPanelProps {
    durations: Durations;
    updateDurations: (durations: Partial<Durations>) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ durations, updateDurations }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localDurations, setLocalDurations] = useState<Durations>(durations);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
            setLocalDurations(prev => ({ ...prev, [name]: numValue }));
        }
    };

    const handleSave = () => {
        const validated = { ...localDurations };
        let hasError = false;
        (Object.keys(validated) as Array<keyof Durations>).forEach(key => {
            if (validated[key] < 1 || validated[key] > 120) {
                hasError = true;
            }
        });

        if (hasError) {
            alert("Por favor, insira valores entre 1 e 120 minutos.");
            return;
        }

        updateDurations(validated);
        setIsOpen(false);
    };

    return (
        <div className={`settings-panel ${isOpen ? 'open' : ''}`}>
            <button className="settings-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? 'Fechar Configurações' : 'Configurações'}
            </button>

            {isOpen && (
                <div className="settings-content">
                    <div className="setting-group">
                        <label>Foco (min):</label>
                        <input
                            type="number"
                            name="focus"
                            value={localDurations.focus}
                            onChange={handleChange}
                            min="1"
                            max="120"
                        />
                    </div>
                    <div className="setting-group">
                        <label>Intervalo Curto (min):</label>
                        <input
                            type="number"
                            name="shortBreak"
                            value={localDurations.shortBreak}
                            onChange={handleChange}
                            min="1"
                            max="120"
                        />
                    </div>
                    <div className="setting-group">
                        <label>Intervalo Longo (min):</label>
                        <input
                            type="number"
                            name="longBreak"
                            value={localDurations.longBreak}
                            onChange={handleChange}
                            min="1"
                            max="120"
                        />
                    </div>
                    <button className="btn btn-save" onClick={handleSave}>Salvar</button>
                </div>
            )}
        </div>
    );
};

export default SettingsPanel;
