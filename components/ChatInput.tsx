import React, { useRef, useEffect } from 'react';
import { Send, StopCircle } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onStop?: () => void; // Not fully implemented in this version, but good for UI
}

const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, onSubmit, isLoading }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="relative flex items-end p-3 bg-[#40414f] border border-gray-600/50 rounded-xl shadow-xl focus-within:border-gray-500 transition-colors">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message NovaChat..."
          rows={1}
          className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none max-h-[200px] py-3 pl-3 pr-10 text-base overflow-y-auto"
          disabled={isLoading}
        />
        <button
          onClick={onSubmit}
          disabled={!input.trim() || isLoading}
          className={`absolute right-3 bottom-3 p-2 rounded-md transition-colors ${
            input.trim() && !isLoading
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-transparent text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
             <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>
      <div className="text-center mt-2 text-xs text-gray-500">
        NovaChat can make mistakes. Consider checking important information.
      </div>
    </div>
  );
};

export default ChatInput;