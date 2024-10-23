// components/TagInput.tsx
import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Badge } from './badge';
import { Input } from './input';
import { cn } from '../../lib/utils';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Add tags...",
  className,
  maxTags = 10
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const tag = inputValue.trim().toLowerCase();
    if (tag && !value.includes(tag) && value.length < maxTags) {
      onChange([...value, tag]);
      setInputValue('');
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("flex flex-wrap gap-2 p-2 border rounded-md", className)}>
      {value.map((tag, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="flex items-center gap-1"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="hover:bg-secondary rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={value.length < maxTags ? placeholder : `Maximum ${maxTags} tags`}
        className="border-0 w-[200px] p-0 focus-visible:ring-0"
        disabled={value.length >= maxTags}
      />
    </div>
  );
}