import React from 'react';
import { Note } from '../types';
import { Plus, Search, Trash2, FileText } from 'lucide-react';

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onNoteSelect: (id: string) => void;
  onNoteAdd: () => void;
  onNoteDelete: (id: string, e: React.MouseEvent) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  activeNoteId,
  onNoteSelect,
  onNoteAdd,
  onNoteDelete,
  searchQuery,
  onSearchChange,
  isOpen
}) => {
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => b.lastModified - a.lastModified);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-20 w-80 bg-slate-50 border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:relative md:translate-x-0
    `}>
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <FileText size={18} />
            </span>
            MindPad
          </h1>
          <button 
            onClick={onNoteAdd}
            className="p-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
            aria-label="Create new note"
          >
            <Plus size={20} />
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p className="text-sm">No notes found.</p>
            {notes.length === 0 && (
              <p className="text-xs mt-1">Click + to create one.</p>
            )}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div 
              key={note.id}
              onClick={() => onNoteSelect(note.id)}
              className={`
                group relative p-3 rounded-xl cursor-pointer transition-all duration-200 border
                ${activeNoteId === note.id 
                  ? 'bg-white border-indigo-200 shadow-md ring-1 ring-indigo-100' 
                  : 'bg-transparent border-transparent hover:bg-slate-100 hover:border-slate-200'}
              `}
            >
              <h3 className={`font-semibold text-sm mb-1 truncate ${activeNoteId === note.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                {note.title || 'Untitled Note'}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 h-8 leading-relaxed">
                {note.content || 'No content'}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-slate-400 font-medium">
                  {formatDate(note.lastModified)}
                </span>
                <button
                  onClick={(e) => onNoteDelete(note.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                  aria-label="Delete note"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <span>API Key Active</span>
        </div>
      </div>
    </div>
  );
};