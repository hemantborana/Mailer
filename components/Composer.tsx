import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { SparklesIcon } from './icons/SparklesIcon';
import { RichTextEditor } from './RichTextEditor';

interface ComposerProps {
    subject: string;
    setSubject: (subject: string) => void;
    body: string;
    setBody: (body: string) => void;
}

const INPUT_CLASS = "w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition";
const TONE_BUTTON_CLASS = "px-3 py-1.5 text-sm font-semibold border rounded-md transition-colors ";

const TONE_MODIFIERS = [
    { label: 'Make Formal', prompt: 'make it more formal' },
    { label: 'Make Casual', prompt: 'make it more casual' },
    { label: 'Shorten', prompt: 'shorten it concisely' },
    { label: 'Expand', prompt: 'expand on the details' },
];

export const Composer: React.FC<ComposerProps> = ({ subject, setSubject, body, setBody }) => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [error, setError] = useState('');
    const [subjectVariations, setSubjectVariations] = useState<string[]>([]);
    const [contentGenerated, setContentGenerated] = useState(false);

    const handleGenerate = async () => {
        if (!prompt) {
            setError('Please enter a prompt for the email content.');
            return;
        }
        setIsGenerating(true);
        setError('');
        setSubjectVariations([]);
        setContentGenerated(false);
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
                            subjectVariations: {
                                type: Type.ARRAY,
                                description: 'An array of 3 to 5 concise and professional subject line variations for the email.',
                                items: { type: Type.STRING }
                            },
                            body: {
                                type: Type.STRING,
                                description: 'The full body of the email, written in a professional and clear tone. Use HTML paragraphs for line breaks.'
                            },
                        },
                        required: ["subjectVariations", "body"]
                    },
                },
            });
            const text = response.text.trim();
            const generated = JSON.parse(text);

            setSubject(generated.subjectVariations[0] || '');
            setSubjectVariations(generated.subjectVariations || []);
            setBody(generated.body);
            setContentGenerated(true);

        } catch (e: any) {
            console.error("AI Generation Error:", e);
            setError("Failed to generate content. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleRefineOrImprove = useCallback(async (baseText: string, instruction: string) => {
        setIsRefining(true);
        setError('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Take the following email body and rewrite it to ${instruction}. Keep the core message intact and return only the rewritten HTML body content. \n\nBODY: "${baseText}"`,
            });
            setBody(response.text.trim());
        } catch (e) {
            console.error("AI Refinement Error:", e);
            setError("Failed to refine content. Please try again.");
        } finally {
            setIsRefining(false);
        }
    }, [setBody]);

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
                        placeholder="e.g., 'Draft a follow-up for the project proposal sent yesterday'"
                        className={INPUT_CLASS}
                        disabled={isGenerating || isRefining}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || isRefining}
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
                 {subjectVariations.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        <span className="text-sm font-semibold text-gray-400 mr-2">Suggestions:</span>
                        {subjectVariations.map((sub, index) => (
                            <button
                                key={index}
                                onClick={() => setSubject(sub)}
                                className={`px-2 py-0.5 text-xs rounded-full transition-colors ${subject === sub ? 'bg-amber-400 text-gray-900 font-bold' : 'bg-gray-600 hover:bg-gray-500'}`}
                            >
                                {sub}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="body" className="block font-display text-lg font-semibold text-amber-400">Body</label>
                    <button 
                        onClick={() => handleRefineOrImprove(body, 'proofread and improve it for clarity, grammar, and professionalism')}
                        disabled={!body || isRefining || isGenerating}
                        className="text-sm text-amber-400 font-semibold hover:text-amber-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                        {isRefining ? 'Improving...' : 'Improve Content'}
                    </button>
                </div>
                <RichTextEditor value={body} onChange={setBody} />
                {contentGenerated && (
                    <div className="mt-3">
                        <p className="text-sm font-semibold text-gray-400 mb-2">Tone & Style Modifier:</p>
                        <div className="flex flex-wrap gap-2">
                             {TONE_MODIFIERS.map(({ label, prompt }) => (
                                <button
                                    key={label}
                                    onClick={() => handleRefineOrImprove(body, prompt)}
                                    disabled={isRefining || isGenerating}
                                    className={`${TONE_BUTTON_CLASS} ${isRefining ? 'bg-gray-600 border-gray-500 text-gray-400' : 'bg-gray-700 border-gray-500 hover:bg-gray-600 hover:border-amber-400'}`}
                                >
                                    {label}
                                </button>
                             ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};