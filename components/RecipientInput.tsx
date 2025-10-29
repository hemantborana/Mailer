import React, { useState, useRef, useEffect } from 'react';

interface RecipientInputProps {
    to: string[]; setTo: (emails: string[]) => void;
    cc: string[]; setCc: (emails: string[]) => void;
    bcc: string[]; setBcc: (emails: string[]) => void;
    knownContacts?: string[];
    isReply?: boolean;
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

interface EmailInputProps {
    label: string;
    emails: string[];
    setEmails: (emails: string[]) => void;
    knownContacts?: string[];
    isReply?: boolean;
}

const extractEmail = (from: string): string => {
    if (typeof from !== 'string') return '';
    const match = from.match(/<(.+)>/);
    return match ? match[1].trim() : from.trim();
};


const EmailInput: React.FC<EmailInputProps> = ({ label, emails, setEmails, knownContacts = [], isReply }) => {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setSuggestions([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const addEmails = (emailsToAdd: string[]) => {
        const validEmails = emailsToAdd
            .map(e => extractEmail(e))
            .filter(e => EMAIL_REGEX.test(e) && !emails.includes(e));
        if (validEmails.length > 0) {
            setEmails([...emails, ...validEmails]);
        }
        setInputValue('');
        setSuggestions([]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        if (value) {
            const filtered = knownContacts.filter(contact => 
                contact.toLowerCase().includes(value.toLowerCase()) && !emails.includes(extractEmail(contact))
            );
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (['Enter', 'Tab', ','].includes(e.key)) {
            if (inputValue) {
                e.preventDefault();
                addEmails([inputValue]);
            }
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

    if (isReply && label !== 'To') {
        return null;
    }

    return (
        <div className="flex items-start" ref={containerRef}>
            <label className="w-12 pt-2 text-right pr-4 font-semibold text-gray-400">{label}</label>
            <div className="relative flex-1">
                <div className={`flex flex-wrap items-center gap-2 p-2 border rounded-md transition-all ${isFocused ? 'border-amber-400 ring-1 ring-amber-400' : 'border-gray-600'} bg-gray-700`}>
                    {emails.map((email, index) => (
                        <EmailPill key={index} email={email} onRemove={() => removeEmail(index)} />
                    ))}
                    <input
                        type="email"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => {
                            setIsFocused(false);
                            if (inputValue) {
                                // A small delay to allow suggestion click to register
                                setTimeout(() => addEmails([inputValue]), 150);
                            }
                        }}
                        className="flex-grow bg-transparent outline-none p-1 min-w-[150px]"
                    />
                </div>
                {suggestions.length > 0 && (
                    <ul className="absolute z-20 w-full bg-gray-600 border border-gray-500 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                        {suggestions.map((contact, index) => (
                            <li
                                key={index}
                                className="px-4 py-2 hover:bg-amber-500/20 cursor-pointer"
                                onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent input blur
                                    addEmails([contact]);
                                }}
                            >
                                {contact}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};


export const RecipientInput: React.FC<RecipientInputProps> = ({ to, setTo, cc, setCc, bcc, setBcc, knownContacts, isReply }) => {
    return (
        <div className="space-y-3">
            <EmailInput label="To" emails={to} setEmails={setTo} knownContacts={knownContacts} isReply={isReply} />
            {!isReply && (
                <>
                    <EmailInput label="Cc" emails={cc} setEmails={setCc} knownContacts={knownContacts} />
                    <EmailInput label="Bcc" emails={bcc} setEmails={setBcc} knownContacts={knownContacts} />
                </>
            )}
        </div>
    );
};