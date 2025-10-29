import React, { useState, useCallback, useEffect } from 'react';
import { FirmSelector } from './components/FirmSelector';
import { RecipientInput } from './components/RecipientInput';
import { Composer } from './components/Composer';
import { AttachmentHandler } from './components/AttachmentHandler';
import { SendButton } from './components/SendButton';
import { Inbox } from './components/Inbox';
import { EmailPreviewModal } from './components/EmailPreviewModal';
import { FIRMS } from './constants';
import type { Firm, AttachmentFile, EmailData } from './types';
import { sendEmail, getPreviewHtml } from './services/emailService';
import { LogoIcon } from './components/icons/LogoIcon';
import { ComposerIcon } from './components/icons/ComposerIcon';
import { InboxIcon } from './components/icons/InboxIcon';
import { GoogleGenAI, Type } from "@google/genai";


const App: React.FC = () => {
    const [view, setView] = useState<'composer' | 'inbox'>('composer');
    const [selectedFirm, setSelectedFirm] = useState<Firm>(FIRMS.HC);
    const [to, setTo] = useState<string[]>([]);
    const [cc, setCc] = useState<string[]>([]);
    const [bcc, setBcc] = useState<string[]>([]);
    const [subject, setSubject] = useState<string>('');
    const [body, setBody] = useState<string>('');
    const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewHtml, setPreviewHtml] = useState('');
    
    const resetForm = useCallback(() => {
        setTo([]);
        setCc([]);
        setBcc([]);
        setSubject('');
        setBody('');
        setAttachments([]);
    }, []);

    const handleSend = useCallback(async () => {
        if (to.length === 0) {
            setErrorMessage('Please add at least one recipient in "To".');
            setStatus('error');
            return;
        }
        if (!subject) {
            setErrorMessage('Subject cannot be empty.');
            setStatus('error');
            return;
        }
        if (!body) {
            setErrorMessage('Email body cannot be empty.');
            setStatus('error');
            return;
        }

        setStatus('sending');
        setErrorMessage('');

        try {
            const payload = {
                action: 'sendEmail',
                firmKey: Object.keys(FIRMS).find(key => FIRMS[key as keyof typeof FIRMS].name === selectedFirm.name) || 'HC',
                to: to.join(','),
                cc: cc.join(','),
                bcc: bcc.join(','),
                subject,
                body,
                attachments,
            };
            const response = await sendEmail(payload);

            if (response.result === 'success') {
                setStatus('success');
                resetForm();
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                throw new Error(response.message || 'An unknown error occurred from Apps Script.');
            }
        } catch (error: any) {
            console.error('Send Error:', error);
            setErrorMessage(error.message || 'Failed to send email. Check console for details.');
            setStatus('error');
        }
    }, [selectedFirm, to, cc, bcc, subject, body, attachments, resetForm]);

    const handlePreview = async () => {
        setStatus('sending');
        setErrorMessage('');
        try {
            const payload = {
                firmKey: Object.keys(FIRMS).find(key => FIRMS[key as keyof typeof FIRMS].name === selectedFirm.name) || 'HC',
                body,
                attachments,
            };
            const response = await getPreviewHtml(payload);
            if (response.result === 'success' && response.html) {
                setPreviewHtml(response.html);
                setIsPreviewOpen(true);
            } else {
                throw new Error(response.message || 'Could not generate preview.');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to generate preview.');
            setStatus('error');
        } finally {
            setStatus('idle');
        }
    };
    
    const handleSmartReply = useCallback(async (email: EmailData) => {
        setStatus('sending');
        setView('composer'); // Switch to composer view
        setBody('<p>Generating smart reply...</p>'); // Placeholder
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Read the following email and generate a professional and helpful reply. The original email subject was "${email.subject}". The body was: "${email.body}".`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            subject: {
                                type: Type.STRING,
                                description: 'A concise and professional reply subject line, often starting with "Re:".'
                            },
                            body: {
                                type: Type.STRING,
                                description: 'The full body of the reply email, written in a professional and clear tone. Use HTML paragraphs for line breaks.'
                            },
                        },
                        required: ["subject", "body"]
                    },
                },
            });
            const text = response.text.trim();
            const generated = JSON.parse(text);
            
            // Safely extract email address from "From" field
            const extractEmail = (from: string): string => {
                // Guard against undefined or non-string inputs
                if (typeof from !== 'string') return '';
                const match = from.match(/<(.+)>/);
                return match ? match[1] : from;
            };

            // Populate composer
            setSubject(generated.subject);
            setBody(generated.body);
            setTo([extractEmail(email.from)]);
            setCc([]);
            setBcc([]);
            setAttachments([]);

        } catch (e: any) {
            console.error("Smart Reply Error:", e);
            setErrorMessage("Failed to generate smart reply.");
            setStatus('error');
            setBody(''); // Clear placeholder on error
        } finally {
            setStatus('idle');
        }
    }, []);


    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-8 font-sans">
            <header className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between mb-8">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <LogoIcon className="w-12 h-12 text-amber-400" />
                    <h1 className="font-display text-4xl font-bold text-white tracking-wider">HB Mailing System</h1>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm text-gray-400">System Connected</span>
                </div>
            </header>

            <main className="w-full max-w-5xl mx-auto bg-gray-800 border border-gray-700 rounded-lg shadow-2xl">
                <div className="flex border-b border-gray-700">
                    <button
                        onClick={() => setView('composer')}
                        className={`flex-1 flex items-center justify-center gap-2 p-4 font-semibold transition-colors ${view === 'composer' ? 'bg-gray-700 text-amber-400' : 'text-gray-400 hover:bg-gray-700/50'}`}
                    >
                        <ComposerIcon className="w-5 h-5" />
                        Composer
                    </button>
                    <button
                        onClick={() => setView('inbox')}
                        className={`flex-1 flex items-center justify-center gap-2 p-4 font-semibold transition-colors ${view === 'inbox' ? 'bg-gray-700 text-amber-400' : 'text-gray-400 hover:bg-gray-700/50'}`}
                    >
                        <InboxIcon className="w-5 h-5" />
                        Inbox
                    </button>
                </div>
                
                <div className="p-6 sm:p-8 space-y-8">
                    {view === 'composer' ? (
                        <>
                            <FirmSelector firms={Object.values(FIRMS)} selectedFirm={selectedFirm} onSelectFirm={setSelectedFirm} />
                            <div className="border-b border-gray-700"></div>
                            <RecipientInput to={to} setTo={setTo} cc={cc} setCc={setCc} bcc={bcc} setBcc={setBcc} />
                            <div className="border-b border-gray-700"></div>
                            <Composer subject={subject} setSubject={setSubject} body={body} setBody={setBody} />
                            <AttachmentHandler attachments={attachments} setAttachments={setAttachments} />
                            <div className="border-b border-gray-700"></div>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <SendButton status={status} errorMessage={errorMessage} onSend={handleSend} />
                                <button 
                                    onClick={handlePreview}
                                    className="text-amber-400 hover:text-amber-300 font-semibold"
                                    disabled={status === 'sending'}
                                >
                                    Preview Email
                                </button>
                            </div>
                        </>
                    ) : (
                       <Inbox onSmartReply={handleSmartReply} />
                    )}
                </div>
            </main>

            <footer className="w-full max-w-5xl mx-auto text-center text-gray-500 mt-8 text-sm">
                <p>Professional Email System</p>
                <p>Developed by <span className="font-semibold text-gray-400">Hemant Borana</span></p>
            </footer>

            {isPreviewOpen && (
                <EmailPreviewModal
                    htmlContent={previewHtml}
                    onClose={() => setIsPreviewOpen(false)}
                    firm={selectedFirm}
                    subject={subject}
                    to={to}
                    cc={cc}
                />
            )}
        </div>
    );
};

export default App;