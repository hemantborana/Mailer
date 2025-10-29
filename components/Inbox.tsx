import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { EmailData } from '../types';
import { fetchInboxEmails } from '../services/emailService';

interface InboxProps {
    onSmartReply: (email: EmailData) => void;
    onContactsLoaded: (contacts: string[]) => void;
}

// Custom hook for debouncing a value
const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

interface DetailModalProps {
    email: EmailData;
    onClose: () => void;
    onSmartReply: (email: EmailData) => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ email, onClose, onSmartReply }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="font-display text-xl font-bold text-amber-400 truncate pr-4">{email.subject}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </header>
                <div className="p-4 bg-gray-900/50 text-sm border-b border-gray-700">
                    <p><strong className="text-gray-400 w-16 inline-block">From:</strong> {email.from}</p>
                    <p><strong className="text-gray-400 w-16 inline-block">Date:</strong> {new Date(email.date).toLocaleString()}</p>
                </div>
                <div className="flex-grow p-6 overflow-y-auto text-gray-300 whitespace-pre-wrap font-mono text-sm">
                    {email.body}
                </div>
                <footer className="p-4 border-t border-gray-700 text-right">
                    <button 
                        onClick={() => onSmartReply(email)}
                        className="bg-amber-500 text-gray-900 font-bold px-4 py-2 rounded-md hover:bg-amber-400 transition"
                    >
                        Smart Reply
                    </button>
                </footer>
            </div>
        </div>
    )
}

export const Inbox: React.FC<InboxProps> = ({ onSmartReply, onContactsLoaded }) => {
    const [emails, setEmails] = useState<EmailData[]>([]);
    const [initialSenders, setInitialSenders] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState<'from' | 'subject'>('subject');
    const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const initialLoadDone = useRef(false);
    
    // Debounce search term to prevent excessive API calls while typing
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Main function to fetch emails from the backend
    const loadEmails = useCallback(async (term: string, type: 'from' | 'subject') => {
        setLoading(true);
        setError('');
        try {
            const response = await fetchInboxEmails(term, type);
            if (response.result === 'success') {
                const fetchedEmails = response.emails || [];
                setEmails(fetchedEmails);
                
                if (!term && !initialLoadDone.current) {
                    const senders = new Set<string>();
                    fetchedEmails.forEach((email: EmailData) => {
                        if (email && email.from) senders.add(email.from);
                    });
                    const senderArray = Array.from(senders);
                    setInitialSenders(senderArray);
                    onContactsLoaded(senderArray);
                    initialLoadDone.current = true;
                }
            } else {
                throw new Error(response.message || 'Failed to fetch emails.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [onContactsLoaded]);

    // Effect for fetching emails when debounced search term or type changes
    useEffect(() => {
        loadEmails(debouncedSearchTerm, searchType);
    }, [debouncedSearchTerm, searchType, loadEmails]);


    // Effect for handling clicks outside the search suggestion box
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setSuggestions([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    // Handler for search input changes to update suggestions
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (searchType === 'from' && value) {
            setSuggestions(
                initialSenders.filter(sender =>
                    sender.toLowerCase().includes(value.toLowerCase())
                )
            );
        } else {
            setSuggestions([]);
        }
    };

    const renderContent = () => {
        if (loading) {
            return <div className="text-center p-8 text-gray-400">Loading Inbox...</div>;
        }
        if (error) {
            return <div className="text-center p-8 text-red-400">{error}</div>;
        }
        if (emails.length === 0) {
            return <p className="p-8 text-center text-gray-500">No emails found.</p>;
        }
        return emails.map(email => (
            <div key={email.id} onClick={() => setSelectedEmail(email)} className="p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50 cursor-pointer transition-colors">
                <div className="flex justify-between items-baseline">
                    <p className="font-semibold text-white truncate pr-4">{email.from}</p>
                    <p className="text-xs text-gray-400 flex-shrink-0">{new Date(email.date).toLocaleDateString()}</p>
                </div>
                <p className="text-gray-300 truncate">{email.subject}</p>
            </div>
        ));
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-grow" ref={searchContainerRef}>
                    <input
                        type="text"
                        placeholder={`Search by ${searchType}...`}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={handleSearchChange} // Show suggestions on focus as well
                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
                    />
                    {suggestions.length > 0 && searchType === 'from' && (
                        <ul className="absolute z-10 w-full bg-gray-600 border border-gray-500 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                            {suggestions.map((sender, index) => (
                                <li
                                    key={index}
                                    className="px-4 py-2 hover:bg-amber-500/20 cursor-pointer"
                                    onMouseDown={() => { // use onMouseDown to prevent input blur before click registers
                                        setSearchTerm(sender);
                                        setSuggestions([]);
                                    }}
                                >
                                    {sender}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <select 
                    value={searchType} 
                    onChange={e => {
                        setSearchTerm(''); // Reset search term when changing type
                        setSearchType(e.target.value as 'from' | 'subject');
                        setSuggestions([]);
                    }}
                    className="bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition"
                >
                    <option value="subject">Subject</option>
                    <option value="from">From</option>
                </select>
            </div>
            <div className="border rounded-lg border-gray-700 overflow-hidden min-h-[200px]">
                {renderContent()}
            </div>
            {selectedEmail && <DetailModal email={selectedEmail} onClose={() => setSelectedEmail(null)} onSmartReply={onSmartReply} />}
        </div>
    );
};