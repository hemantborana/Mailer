import React from 'react';
import type { Firm } from '../types';

interface EmailPreviewModalProps {
    htmlContent: string;
    onClose: () => void;
    firm: Firm;
    subject: string;
    to: string[];
    cc: string[];
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({ htmlContent, onClose, firm, subject, to, cc }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="font-display text-2xl font-bold text-amber-400">Email Preview</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </header>
                <div className="p-4 bg-gray-900/50 text-sm space-y-2">
                    <p><strong className="text-gray-400 w-20 inline-block">From:</strong> {firm.name}</p>
                    <p><strong className="text-gray-400 w-20 inline-block">To:</strong> {to.join(', ')}</p>
                    {cc.length > 0 && <p><strong className="text-gray-400 w-20 inline-block">Cc:</strong> {cc.join(', ')}</p>}
                    <p><strong className="text-gray-400 w-20 inline-block">Subject:</strong> {subject}</p>
                </div>
                <div className="flex-grow bg-white overflow-y-auto">
                    {htmlContent ? (
                        <iframe
                            srcDoc={htmlContent}
                            title="Email Preview"
                            className="w-full h-full border-0"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <p>Could not load email preview.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};