import React from 'react';
import type { Firm } from '../types';

interface FirmSelectorProps {
    firms: Firm[];
    selectedFirm: Firm;
    onSelectFirm: (firm: Firm) => void;
}

export const FirmSelector: React.FC<FirmSelectorProps> = ({ firms, selectedFirm, onSelectFirm }) => {
    return (
        <div>
            <label className="block font-display text-lg font-semibold text-amber-400 mb-3">
                Select Sending Firm
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
                {firms.map((firm) => (
                    <div
                        key={firm.name}
                        onClick={() => onSelectFirm(firm)}
                        className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedFirm.name === firm.name
                                ? 'bg-amber-400/10 border-amber-400 ring-2 ring-amber-400'
                                : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                        }`}
                    >
                        <h3 className="font-bold text-white text-lg">{firm.name}</h3>
                        <p className="text-sm text-gray-400">{firm.address}</p>
                        <p className="text-sm text-gray-400 mt-1">Mobile: {firm.mobile}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
