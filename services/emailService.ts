import type { AttachmentFile } from '../types';

interface EmailPayload {
  firmKey: string;
  to: string;
  cc: string;
  bcc:string;
  subject: string;
  body: string;
  attachments: AttachmentFile[];
}

export const sendEmail = async (url: string, payload: EmailPayload) => {
    // Google Apps Script Web Apps handle POST requests differently.
    // We send the data as a stringified JSON in the body.
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            // Use 'text/plain' to ensure Apps Script can read it via e.postData.contents
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
        // redirect: 'follow' is the default, which is needed for Apps Script
    });

    if (!response.ok && response.status !== 200) {
        // App Script redirects on success, which can sometimes be flagged by fetch
        // But if we get a real error code, we should throw.
        throw new Error(`Network response was not ok. Status: ${response.status}`);
    }

    try {
        return await response.json();
    } catch (e) {
        // This might happen if the App Script doesn't return valid JSON on error
        // or if there's a CORS issue preventing reading the response.
        console.error("Could not parse JSON response from Apps Script.", e);
        throw new Error("Invalid or unreadable response from Apps Script. Ensure it is deployed correctly and returns JSON.");
    }
};
