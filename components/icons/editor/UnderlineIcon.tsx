import React from 'react';

export const UnderlineIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 4.5v9a6 6 0 0012 0v-9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5h15" />
    </svg>
);
