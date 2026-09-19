const fs = require('fs');

function convert(file, name) {
    let content = fs.readFileSync(file, 'utf8');
    const pathRegex = /<path d=\"([^\"]+)\" fill=\"black\"\/>/g;
    const matches = [...content.matchAll(pathRegex)];
    
    if (matches.length >= 2) {
        const d1 = matches[0][1]; // The rectangle
        const d2 = matches[1][1]; // The jagged edge
        
        const componentCode = `import React from 'react';

export const ${name}: React.FC<{ bgColor: string; borderColor: string; className?: string }> = ({ bgColor, borderColor, className }) => (
    <svg width="100%" height="100%" viewBox="0 0 378 498" preserveAspectRatio="none" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="${d2}" fill={borderColor}/>
        <path d="${d1}" fill={bgColor}/>
    </svg>
);
`;
        fs.writeFileSync(`app/components/${name}.tsx`, componentCode);
        console.log(`Created ${name}.tsx`);
    } else {
        console.log(`Failed to parse ${file}`);
    }
}

convert('public/icons/subkatakana-paper.svg', 'SubKatakanaPaperSVG');
convert('public/icons/subhiragana-paper.svg', 'SubHiraganaPaperSVG');
