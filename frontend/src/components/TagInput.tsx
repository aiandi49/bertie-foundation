import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
}

export function TagInput({
  value,
  onChange,
  suggestions = [],
  placeholder = "Add tags...",
  className = "",
}: Props) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filtered = suggestions.filter(
      (suggestion) =>
        suggestion.toLowerCase().includes(input.toLowerCase()) &&
        !value.includes(suggestion)
    );
    setFilteredSuggestions(filtered);
  }, [input, suggestions, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowSuggestions(true);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
      }
      setInput("");
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const addTag = (tag: string) => {
    if (!value.includes(tag)) {
      onChange([...value, tag]);
      setInput("");
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className={className}>
      <div
        className="flex flex-wrap gap-2 p-2 bg-secondary-700 rounded-lg border border-secondary-600
                 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500"
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-primary-500/20 text-primary-400
                     rounded-md text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-white transition-colors duration-200"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent text-white outline-none text-sm"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute mt-1 w-full max-h-48 overflow-y-auto bg-secondary-800 rounded-lg
                   border border-secondary-600 shadow-lg z-10"
        >
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={(e) => {
                e.preventDefault(); // Prevent form submission
                e.stopPropagation(); // Stop event propagation
                addTag(suggestion);
                return false; // Extra safety to prevent default behavior
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-secondary-700
                       transition-colors duration-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
