import React from 'react';

export const ItalicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 4.5l-4.5 15" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 4.5h9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 19.5h9" />
    </svg>
);
