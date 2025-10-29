import React, { useState, useCallback, useEffect } from 'react';
import { FirmSelector } from './components/FirmSelector';
import { RecipientInput } from './components/RecipientInput';
import { Composer } from './components/Composer';
import { AttachmentHandler } from './components/AttachmentHandler';
import { SendButton } from './components/SendButton';
import { AppScriptURLInput } from './components/AppScriptURLInput';
import { FIRMS } from './constants';
import type { Firm, AttachmentFile } from './types';
import { sendEmail } from './services/emailService';
import { LogoIcon } from './components/icons/LogoIcon';

const App: React.FC = () => {
    const [appScriptUrl, setAppScriptUrl] = useState<string>(localStorage.getItem('appScriptUrl') || 'https://script.google.com/macros/s/AKfycbzL6MDckkuK17S5vzIJHVs1_O5FgkVzxOsMBg69v3RRKUPvCN7zMP_kp_CGT_Pckqet/exec');
    const [selectedFirm, setSelectedFirm] = useState<Firm>(FIRMS.HC);
    const [to, setTo] = useState<string[]>([]);
    const [cc, setCc] = useState<string[]>([]);
    const [bcc, setBcc] = useState<string[]>([]);
    const [subject, setSubject] = useState<string>('');
    const [body, setBody] = useState<string>('');
    const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        if (appScriptUrl) {
            localStorage.setItem('appScriptUrl', appScriptUrl);
        }
    }, [appScriptUrl]);

    const handleSend = useCallback(async () => {
        if (!appScriptUrl) {
            setErrorMessage('Please provide the Google Apps Script URL.');
            setStatus('error');
            return;
        }
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
            const response = await sendEmail(appScriptUrl, {
                firmKey: Object.keys(FIRMS).find(key => FIRMS[key as keyof typeof FIRMS].name === selectedFirm.name) || 'HC',
                to: to.join(','),
                cc: cc.join(','),
                bcc: bcc.join(','),
                subject,
                body,
                attachments,
            });

            if (response.result === 'success') {
                setStatus('success');
                // Reset form
                setTo([]);
                setCc([]);
                setBcc([]);
                setSubject('');
                setBody('');
                setAttachments([]);
                setTimeout(() => setStatus('idle'), 5000); // Reset status after 5s
            } else {
                throw new Error(response.message || 'An unknown error occurred from Apps Script.');
            }
        } catch (error: any) {
            console.error('Send Error:', error);
            setErrorMessage(error.message || 'Failed to send email. Check console for details.');
            setStatus('error');
        }
    }, [appScriptUrl, selectedFirm, to, cc, bcc, subject, body, attachments]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-8 font-sans">
            <header className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between mb-8">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <LogoIcon className="w-12 h-12 text-amber-400" />
                    <h1 className="font-display text-4xl font-bold text-white tracking-wider">AuraMail</h1>
                </div>
                <AppScriptURLInput value={appScriptUrl} onChange={setAppScriptUrl} />
            </header>

            <main className="w-full max-w-5xl mx-auto bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-6 sm:p-8 space-y-8">
                <FirmSelector firms={Object.values(FIRMS)} selectedFirm={selectedFirm} onSelectFirm={setSelectedFirm} />
                <div className="border-b border-gray-700"></div>
                <RecipientInput to={to} setTo={setTo} cc={cc} setCc={setCc} bcc={bcc} setBcc={setBcc} />
                <div className="border-b border-gray-700"></div>
                <Composer subject={subject} setSubject={setSubject} body={body} setBody={setBody} />
                <AttachmentHandler attachments={attachments} setAttachments={setAttachments} />
                <div className="border-b border-gray-700"></div>
                <SendButton status={status} errorMessage={errorMessage} onSend={handleSend} />
            </main>

            <footer className="w-full max-w-5xl mx-auto text-center text-gray-500 mt-8 text-sm">
                <p>Professional Email System</p>
                <p>Developed by <span className="font-semibold text-gray-400">Hemant Borana</span></p>
            </footer>
        </div>
    );
};

export default App;