import React from 'react';
import { SendIcon } from './icons/SendIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon';

interface SendButtonProps {
    status: 'idle' | 'sending' | 'success' | 'error';
    errorMessage: string;
    onSend: () => void;
}

export const SendButton: React.FC<SendButtonProps> = ({ status, errorMessage, onSend }) => {
    const isSending = status === 'sending';

    const getButtonContent = () => {
        switch (status) {
            case 'sending':
                return (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                    </>
                );
            case 'success':
                return <><CheckCircleIcon className="w-5 h-5 mr-2"/> Email Sent Successfully!</>;
            case 'error':
                 return <><ExclamationCircleIcon className="w-5 h-5 mr-2"/> Try Again</>;
            default:
                return <><SendIcon className="w-5 h-5 mr-2"/> Send Email</>;
        }
    };
    
    const getButtonClass = () => {
        switch (status) {
            case 'success':
                return 'bg-green-600 hover:bg-green-500';
            case 'error':
                return 'bg-red-600 hover:bg-red-500';
            default:
                return 'bg-amber-500 hover:bg-amber-400';
        }
    };

    return (
        <div className="flex flex-col items-center">
            <button
                onClick={onSend}
                disabled={isSending}
                className={`flex items-center justify-center w-full sm:w-auto text-gray-900 font-bold px-8 py-3 rounded-md transition text-lg ${getButtonClass()} disabled:bg-gray-600 disabled:cursor-not-allowed`}
            >
                {getButtonContent()}
            </button>
            {status === 'error' && errorMessage && (
                <p className="text-red-400 mt-3 text-center">{errorMessage}</p>
            )}
        </div>
    );
};
