import React, { useState } from 'react';

interface RecipientInputProps {
    to: string[]; setTo: (emails: string[]) => void;
    cc: string[]; setCc: (emails: string[]) => void;
    bcc: string[]; setBcc: (emails: string[]) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EmailPill: React.FC<{ email: string; onRemove: () => void }> = ({ email, onRemove }) => (
    <div className="flex items-center bg-gray-600 text-gray-200 rounded-full py-1 px-3 text-sm font-medium">
        <span>{email}</span>
        <button onClick={onRemove} className="ml-2 text-gray-400 hover:text-white">
            &times;
        </button>
    </div>
);

const EmailInput: React.FC<{ label: string; emails: string[]; setEmails: (emails: string[]) => void }> = ({ label, emails, setEmails }) => {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const addEmails = (emailsToAdd: string[]) => {
        const validEmails = emailsToAdd
            .map(e => e.trim())
            .filter(e => EMAIL_REGEX.test(e) && !emails.includes(e));
        if (validEmails.length > 0) {
            setEmails([...emails, ...validEmails]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (['Enter', 'Tab', ','].includes(e.key)) {
            e.preventDefault();
            addEmails([inputValue]);
            setInputValue('');
        } else if (e.key === 'Backspace' && inputValue === '') {
            setEmails(emails.slice(0, -1));
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        const pastedEmails = pastedText.split(/[\s,;]+/);
        addEmails(pastedEmails);
    };
    
    const removeEmail = (index: number) => {
        setEmails(emails.filter((_, i) => i !== index));
    };

    return (
        <div className="flex items-start">
            <label className="w-12 pt-2 text-right pr-4 font-semibold text-gray-400">{label}</label>
            <div className={`flex-1 flex flex-wrap items-center gap-2 p-2 border rounded-md transition-all ${isFocused ? 'border-amber-400 ring-1 ring-amber-400' : 'border-gray-600'} bg-gray-700`}>
                {emails.map((email, index) => (
                    <EmailPill key={index} email={email} onRemove={() => removeEmail(index)} />
                ))}
                <input
                    type="email"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                        setIsFocused(false);
                        if(inputValue) {
                            addEmails([inputValue]);
                            setInputValue('');
                        }
                    }}
                    className="flex-grow bg-transparent outline-none p-1 min-w-[150px]"
                />
            </div>
        </div>
    );
};

export const RecipientInput: React.FC<RecipientInputProps> = ({ to, setTo, cc, setCc, bcc, setBcc }) => {
    return (
        <div className="space-y-3">
            <EmailInput label="To" emails={to} setEmails={setTo} />
            <EmailInput label="Cc" emails={cc} setEmails={setCc} />
            <EmailInput label="Bcc" emails={bcc} setEmails={setBcc} />
        </div>
    );
};
