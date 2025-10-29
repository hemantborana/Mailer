import React, { useState } from 'react';

interface AppScriptURLInputProps {
    value: string;
    onChange: (url: string) => void;
}

export const AppScriptURLInput: React.FC<AppScriptURLInputProps> = ({ value, onChange }) => {
    const [isEditing, setIsEditing] = useState(!value);

    if (!isEditing) {
        return (
            <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Apps Script URL is set.</span>
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-amber-400 hover:text-amber-300 text-sm font-semibold"
                >
                    Edit
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-2">
            <input
                type="url"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Enter Google Apps Script URL"
                className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-sm w-72 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
            />
            <button
                onClick={() => setIsEditing(false)}
                disabled={!value}
                className="bg-amber-500 text-gray-900 font-bold px-3 py-1.5 rounded-md text-sm hover:bg-amber-400 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
            >
                Save
            </button>
        </div>
    );
};
