import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { SparklesIcon } from './icons/SparklesIcon';

interface ComposerProps {
    subject: string;
    setSubject: (subject: string) => void;
    body: string;
    setBody: (body: string) => void;
}

const INPUT_CLASS = "w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition";

export const Composer: React.FC<ComposerProps> = ({ subject, setSubject, body, setBody }) => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt) {
            setError('Please enter a prompt for the email content.');
            return;
        }
        setIsGenerating(true);
        setError('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Based on the following prompt, generate a professional email. \n\nPROMPT: "${prompt}"`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            subject: {
                                type: Type.STRING,
                                description: 'A concise and professional subject line for the email.'
                            },
                            body: {
                                type: Type.STRING,
                                description: 'The full body of the email, written in a professional and clear tone. Use line breaks for paragraphs.'
                            },
                        },
                        required: ["subject", "body"]
                    },
                },
            });
            const text = response.text.trim();
            const generated = JSON.parse(text);
            setSubject(generated.subject);
            setBody(generated.body);

        } catch (e: any) {
            console.error("AI Generation Error:", e);
            setError("Failed to generate content. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="prompt" className="block font-display text-lg font-semibold text-amber-400 mb-2">
                    AI Composer
                </label>
                <div className="flex space-x-2">
                    <input
                        id="prompt"
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., 'Draft a follow-up email for the project proposal sent yesterday'"
                        className={INPUT_CLASS}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex items-center space-x-2 bg-amber-500 text-gray-900 font-bold px-4 py-2 rounded-md hover:bg-amber-400 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
                    >
                        <SparklesIcon className="w-5 h-5"/>
                        <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
                    </button>
                </div>
                 {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>

            <div className="border-b border-gray-700 my-4"></div>

            <div>
                <label htmlFor="subject" className="block font-display text-lg font-semibold text-amber-400 mb-2">Subject</label>
                <input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject"
                    className={INPUT_CLASS}
                />
            </div>
            <div>
                <label htmlFor="body" className="block font-display text-lg font-semibold text-amber-400 mb-2">Body</label>
                <textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Enter email body"
                    rows={10}
                    className={INPUT_CLASS}
                />
            </div>
        </div>
    );
};
