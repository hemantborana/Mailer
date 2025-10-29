import type { AttachmentFile } from '../types';

const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzL6MDckkuK17S5vzIJHVs1_O5FgkVzxOsMBg69v3RRKUPvCN7zMP_kp_CGT_Pckqet/exec';

interface BasePayload {
    action: 'sendEmail' | 'fetchInbox' | 'getPreview';
}

interface EmailPayload extends BasePayload {
    action: 'sendEmail';
    firmKey: string;
    to: string;
    cc: string;
    bcc: string;
    subject: string;
    body: string; // Now HTML
    attachments: AttachmentFile[];
}

interface InboxPayload extends BasePayload {
    action: 'fetchInbox';
    searchTerm: string;
    searchType: 'from' | 'subject';
}

interface PreviewPayload extends BasePayload {
    action: 'getPreview';
    firmKey: string;
    body: string; // HTML
    attachments: AttachmentFile[];
}

const postToAction = async (payload: { action: string, [key: string]: any }) => {
    if (!APP_SCRIPT_URL) {
        throw new Error("Google Apps Script URL is not set.");
    }
    
    const response = await fetch(APP_SCRIPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok && response.status !== 200) {
        throw new Error(`Network response was not ok. Status: ${response.status}`);
    }

    try {
        return await response.json();
    } catch (e) {
        console.error("Could not parse JSON response from Apps Script.", e);
        const text = await response.text();
        console.error("Response Text:", text);
        throw new Error("Invalid or unreadable response from Apps Script. Ensure it is deployed correctly and returns JSON.");
    }
};

export const sendEmail = async (payload: Omit<EmailPayload, 'action'>) => {
    return postToAction({ ...payload, action: 'sendEmail' });
};

export const fetchInboxEmails = async (searchTerm: string, searchType: 'from' | 'subject') => {
    const payload: Omit<InboxPayload, 'action'> & { action: 'fetchInbox' } = {
        action: 'fetchInbox',
        searchTerm,
        searchType
    };
    return postToAction(payload);
};


export const getPreviewHtml = async (payload: Omit<PreviewPayload, 'action'>) => {
    return postToAction({ ...payload, action: 'getPreview' });
};