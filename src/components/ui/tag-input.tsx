'use client';

import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from './input';

interface TagInputProps {
    placeholder?: string;
    tags: string[];
    setTags: (tags: string[]) => void;
}

export function TagInput({ placeholder, tags, setTags }: TagInputProps) {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
            e.preventDefault();
            removeTag(tags.length - 1);
        }
    };

    const addTag = () => {
        const value = inputValue.trim();
        if (value && !tags.includes(value)) {
            setTags([...tags, value]);
        }
        setInputValue('');
    };

    const removeTag = (indexToRemove: number) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2 mb-1">
                {tags.map((tag, index) => (
                    <span 
                        key={index} 
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-zinc-100 text-zinc-900 rounded-full border border-zinc-200"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="text-zinc-400 hover:text-zinc-600 focus:outline-none"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </span>
                ))}
            </div>
            <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={addTag}
                placeholder={placeholder}
                className="w-full"
            />
            <p className="text-xs text-zinc-400 mt-1">
                👉 Type and press <kbd className="px-1.5 font-mono bg-zinc-100 rounded text-zinc-600">Enter</kbd> or <kbd className="px-1.5 font-mono bg-zinc-100 rounded text-zinc-600">,</kbd> to add.
            </p>
        </div>
    );
}
