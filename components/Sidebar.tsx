import React from 'react';
import { Plus, MessageSquare, Trash2, Github, Settings, X, LogOut } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 h-full w-[260px] bg-[#202123] flex flex-col transition-transform duration-300 z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-3 flex-none">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-md border border-gray-700 hover:bg-gray-800 transition-colors text-white text-sm text-left"
          >
            <Plus size={16} />
            New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-700">
          <div className="text-xs font-medium text-gray-500 px-3 py-2 mb-1">Recent</div>
          {sessions.length === 0 && (
             <div className="px-3 text-sm text-gray-500 italic">No history yet.</div>
          )}
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => {
                onSelectSession(session.id);
                if (window.innerWidth < 768) onClose();
              }}
              className={`group relative flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer text-sm transition-colors ${
                currentSessionId === session.id
                  ? 'bg-[#343541] text-white'
                  : 'text-gray-100 hover:bg-[#2A2B32]'
              }`}
            >
              <MessageSquare size={16} className="text-gray-400 flex-shrink-0" />
              <div className="flex-1 truncate pr-6 text-sm">
                {session.title || 'New Chat'}
              </div>
              
              {/* Delete button only visible on hover or active */}
              {(currentSessionId === session.id) && (
                 <button 
                    onClick={(e) => onDeleteSession(session.id, e)}
                    className="absolute right-2 text-gray-400 hover:text-red-400 opacity-60 hover:opacity-100 transition-opacity"
                 >
                    <Trash2 size={14} />
                 </button>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-700 flex-none space-y-1">
          <button className="flex items-center gap-3 px-3 py-3 w-full rounded-md hover:bg-gray-800 text-gray-100 text-sm transition-colors">
            <Settings size={16} />
            Settings
          </button>
          <div className="flex items-center gap-3 px-3 py-3 w-full rounded-md text-gray-100 text-sm">
             <div className="h-8 w-8 rounded-sm bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                U
             </div>
             <div className="flex-1 font-medium">User</div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;