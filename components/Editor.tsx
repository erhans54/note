import React, { useState, useEffect, useRef } from 'react';
import { Note, AIActionType } from '../types';
import { processTextWithAI } from '../services/geminiService';
import { Sparkles, Wand2, ChevronDown, Check, Copy } from 'lucide-react';
import { Button } from './Button';

interface EditorProps {
  note: Note;
  onUpdate: (updatedNote: Note) => void;
  onBack?: () => void;
}

export const Editor: React.FC<EditorProps> = ({ note, onUpdate, onBack }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Update local state when prop changes (switching notes)
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setAiError(null);
  }, [note.id]);

  // Handle outside click to close AI menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAIMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = (newTitle: string, newContent: string) => {
    onUpdate({
      ...note,
      title: newTitle,
      content: newContent,
      lastModified: Date.now(),
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    handleSave(newTitle, content);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    handleSave(title, newContent);
  };

  const handleAIAction = async (action: AIActionType) => {
    setShowAIMenu(false);
    setIsProcessing(true);
    setAiError(null);

    try {
      const selectionStart = textareaRef.current?.selectionStart;
      const selectionEnd = textareaRef.current?.selectionEnd;
      
      const hasSelection = selectionStart !== undefined && selectionEnd !== undefined && selectionStart !== selectionEnd;
      const textToProcess = hasSelection 
        ? content.substring(selectionStart, selectionEnd) 
        : content;

      if (!textToProcess.trim()) {
        throw new Error("Please write or select some text first.");
      }

      const result = await processTextWithAI(textToProcess, action);

      let newContent = content;
      if (action === AIActionType.CONTINUE_WRITING) {
        // Append
        newContent = hasSelection 
          ? content.substring(0, selectionEnd) + " " + result + content.substring(selectionEnd)
          : content + (content.endsWith(' ') ? '' : ' ') + result;
      } else {
        // Replace
        newContent = hasSelection 
          ? content.substring(0, selectionStart) + result + content.substring(selectionEnd)
          : result;
      }

      setContent(newContent);
      handleSave(title, newContent);
    } catch (err: any) {
      setAiError(err.message || "Something went wrong with AI.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-1">
          {onBack && (
            <button onClick={onBack} className="md:hidden mr-2 text-slate-400 hover:text-slate-600">
              <ChevronDown className="rotate-90" />
            </button>
          )}
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Note"
            className="text-2xl font-bold text-slate-800 placeholder:text-slate-300 border-none focus:ring-0 w-full bg-transparent p-0"
          />
        </div>
        
        <div className="relative" ref={menuRef}>
          <Button 
            variant="secondary" 
            onClick={() => setShowAIMenu(!showAIMenu)}
            disabled={isProcessing}
            icon={<Sparkles size={16} className={isProcessing ? "text-indigo-400" : "text-indigo-600"} />}
          >
            AI Tools
            <ChevronDown size={14} className={`ml-1 transition-transform ${showAIMenu ? 'rotate-180' : ''}`} />
          </Button>

          {showAIMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden ring-1 ring-black ring-opacity-5">
              <div className="p-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
                  Edit & Review
                </div>
                <button 
                  onClick={() => handleAIAction(AIActionType.FIX_GRAMMAR)}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Check size={14} /> Fix Grammar
                </button>
                <button 
                  onClick={() => handleAIAction(AIActionType.SUMMARIZE)}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Copy size={14} /> Summarize
                </button>
                
                <div className="h-px bg-slate-100 my-1"></div>
                
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
                  Generate
                </div>
                <button 
                  onClick={() => handleAIAction(AIActionType.CONTINUE_WRITING)}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Wand2 size={14} /> Continue Writing
                </button>
                <button 
                  onClick={() => handleAIAction(AIActionType.MAKE_LONGER)}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <span className="font-bold text-xs border border-current rounded px-1">+</span> Expand
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Start typing your thoughts... (Tip: Select text and use AI Tools)"
          className="w-full h-full resize-none p-6 md:p-10 text-lg leading-relaxed text-slate-700 focus:outline-none placeholder:text-slate-300 font-serif md:font-sans"
          spellCheck={false}
        />
        
        {/* Loading Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-white px-6 py-4 rounded-xl shadow-2xl border border-indigo-100 flex items-center gap-3 animate-pulse">
              <Sparkles className="text-indigo-600 animate-spin-slow" size={20} />
              <span className="text-indigo-900 font-medium">Gemini is thinking...</span>
            </div>
          </div>
        )}

        {/* Error Toast */}
        {aiError && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 px-4 py-3 rounded-lg shadow-lg border border-red-100 text-sm flex items-center gap-2 max-w-sm">
             <span className="font-bold">Error:</span> {aiError}
             <button onClick={() => setAiError(null)} className="ml-2 hover:bg-red-100 rounded-full p-1">✕</button>
          </div>
        )}
      </div>
      
      <div className="px-6 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
        <span>{content.length} characters</span>
        <span>{content.trim().split(/\s+/).filter(w => w.length > 0).length} words</span>
      </div>
    </div>
  );
};