import React, { useRef, useCallback } from 'react';
import { BoldIcon } from './icons/editor/BoldIcon';
import { ItalicIcon } from './icons/editor/ItalicIcon';
import { UnderlineIcon } from './icons/editor/UnderlineIcon';
import { ListOrderedIcon } from './icons/editor/ListOrderedIcon';
import { ListUnorderedIcon } from './icons/editor/ListUnorderedIcon';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const ToolbarButton: React.FC<{ onClick: (e: React.MouseEvent) => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <button
        type="button"
        onMouseDown={onClick} // Use onMouseDown to prevent the editor from losing focus
        className="p-2 rounded text-gray-400 hover:bg-gray-600 hover:text-white transition-colors"
    >
        {children}
    </button>
);

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            editorRef.current.focus();
            handleInput(); // Update state after command
        }
    };

    return (
        <div className="bg-gray-700 border border-gray-600 rounded-md focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 transition-all">
            <div className="flex items-center p-1 border-b border-gray-600">
                <ToolbarButton onClick={() => execCommand('bold')}><BoldIcon className="w-5 h-5" /></ToolbarButton>
                <ToolbarButton onClick={() => execCommand('italic')}><ItalicIcon className="w-5 h-5" /></ToolbarButton>
                <ToolbarButton onClick={() => execCommand('underline')}><UnderlineIcon className="w-5 h-5" /></ToolbarButton>
                <div className="w-px h-6 bg-gray-600 mx-2"></div>
                <ToolbarButton onClick={() => execCommand('insertUnorderedList')}><ListUnorderedIcon className="w-5 h-5" /></ToolbarButton>
                <ToolbarButton onClick={() => execCommand('insertOrderedList')}><ListOrderedIcon className="w-5 h-5" /></ToolbarButton>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                dangerouslySetInnerHTML={{ __html: value }}
                className="w-full p-3 h-48 overflow-y-auto outline-none"
                style={{ minHeight: '200px' }}
            />
        </div>
    );
};
