import React, { useState, useRef, useLayoutEffect, forwardRef } from 'react';

interface AutosizeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value: string;
}

export const AutosizeInput = forwardRef<HTMLInputElement, AutosizeInputProps>(
    ({ value, ...props }, ref) => {
        const [inputWidth, setInputWidth] = useState('auto');
        const spanRef = useRef<HTMLSpanElement>(null);

        useLayoutEffect(() => {
            if (spanRef.current) {
                const newWidth = spanRef.current.offsetWidth + 1;
                setInputWidth(`${newWidth}px`);
            }
        }, [value]);

        return (
            <div className="relative inline-block">
                <input
                    ref={ref}
                    type="text"
                    value={value}
                    style={{ width: inputWidth }}
                    {...props}
                />
                
                <span
                    ref={spanRef}
                    className={`${props.className} absolute top-0 left-0 invisible whitespace-pre`}
                >
                    {value}
                </span>
            </div>
        );
    }
);