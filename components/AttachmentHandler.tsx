import React, { useCallback, useState } from 'react';
import type { AttachmentFile } from '../types';
import { FileIcon } from './icons/FileIcon';
import { TrashIcon } from './icons/TrashIcon';

interface AttachmentHandlerProps {
    attachments: AttachmentFile[];
    setAttachments: (attachments: AttachmentFile[]) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
};

export const AttachmentHandler: React.FC<AttachmentHandlerProps> = ({ attachments, setAttachments }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = useCallback(async (files: FileList | null) => {
        if (!files) return;
        const newAttachments: AttachmentFile[] = [];
        for (const file of Array.from(files)) {
            const data = await fileToBase64(file);
            newAttachments.push({
                filename: file.name,
                mimeType: file.type,
                data,
            });
        }
        setAttachments([...attachments, ...newAttachments]);
    }, [attachments, setAttachments]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    }, [handleFileChange]);
    
    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    };
    
    const removeAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    return (
        <div>
             <label className="block font-display text-lg font-semibold text-amber-400 mb-2">Attachments</label>
             <div
                onDrop={handleDrop}
                onDragOver={handleDragEvents}
                onDragEnter={handleDragEvents}
                onDragLeave={handleDragEvents}
                className={`flex justify-center items-center w-full px-6 py-10 border-2 border-dashed rounded-lg transition-colors ${
                    isDragging ? 'border-amber-400 bg-gray-700/50' : 'border-gray-600 hover:border-gray-500'
                }`}
            >
                <div className="text-center">
                    <p className="text-gray-400">Drag & drop files here, or</p>
                    <input
                        type="file"
                        id="file-upload"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileChange(e.target.files)}
                    />
                    <label
                        htmlFor="file-upload"
                        className="font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
                    >
                        click to browse
                    </label>
                </div>
            </div>
            {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                            <div className="flex items-center space-x-3">
                                <FileIcon className="w-5 h-5 text-gray-400"/>
                                <span className="text-sm font-medium">{file.filename}</span>
                            </div>
                            <button onClick={() => removeAttachment(index)} className="text-gray-500 hover:text-red-400">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
