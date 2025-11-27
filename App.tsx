import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { Note } from './types';
import { Menu, FileEdit } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; // We don't have uuid lib, so I'll implement a simple generator

const simpleUUID = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('mindpad_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    // Default welcome note
    return [{
      id: 'welcome',
      title: 'Welcome to MindPad',
      content: 'Welcome! This is your new AI-powered notebook.\n\nTry selecting this text and clicking "AI Tools" to summarize or rewrite it. \n\nMindPad uses Google Gemini to help you write better and faster.',
      lastModified: Date.now()
    }];
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(
    notes.length > 0 ? notes[0].id : null
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('mindpad_notes', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = () => {
    const newNote: Note = {
      id: simpleUUID(),
      title: '',
      content: '',
      lastModified: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    // On mobile, close sidebar when creating new note to go straight to edit
    if (window.innerWidth < 768) {
        setSidebarOpen(false);
    }
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to delete this note?");
    if (!confirmed) return;

    const newNotes = notes.filter(n => n.id !== id);
    setNotes(newNotes);
    if (activeNoteId === id) {
      setActiveNoteId(newNotes.length > 0 ? newNotes[0].id : null);
    }
  };

  const handleUpdateNote = (updatedNote: Note) => {
    const updatedNotes = notes.map((note) =>
      note.id === updatedNote.id ? updatedNote : note
    );
    setNotes(updatedNotes);
  };

  const activeNote = notes.find((note) => note.id === activeNoteId);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Mobile Menu Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-sm border border-slate-200"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
      >
        <Menu size={20} className="text-slate-600" />
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <Sidebar
        notes={notes}
        activeNoteId={activeNoteId}
        onNoteSelect={(id) => {
          setActiveNoteId(id);
          setSidebarOpen(false);
        }}
        onNoteAdd={handleAddNote}
        onNoteDelete={handleDeleteNote}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isOpen={isSidebarOpen}
      />

      <main className="flex-1 h-full w-full relative z-0">
        {activeNote ? (
          <Editor 
            note={activeNote} 
            onUpdate={handleUpdateNote} 
            onBack={() => setSidebarOpen(true)}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 p-8 text-center bg-slate-50/50">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <FileEdit size={40} className="text-slate-300 ml-1" />
            </div>
            <h2 className="text-xl font-semibold text-slate-600 mb-2">Select a note to view</h2>
            <p className="max-w-xs mx-auto mb-8">Choose a note from the sidebar or create a new one to get started.</p>
            <button 
              onClick={handleAddNote}
              className="px-6 py-3 bg-indigo-600 text-white rounded-full font-medium shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5"
            >
              Create New Note
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;