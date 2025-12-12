import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Menu, Zap, BrainCircuit, Bot } from 'lucide-react';
import { Message, ChatSession, Role, ModelType } from './types';
import { MODELS, INITIAL_MESSAGE } from './constants';
import { sendMessageStream } from './services/geminiService';
import MarkdownRenderer from './components/MarkdownRenderer';
import ChatInput from './components/ChatInput';
import Sidebar from './components/Sidebar';

// Simple UUID generator fallback if package not available, 
// though uuid import above assumes standard env. 
// Using a simpler one here to ensure no external dep failures for this specific demo block.
const generateId = () => Math.random().toString(36).substring(2, 15);

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.FLASH);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with one empty session
  useEffect(() => {
    const initSessionId = generateId();
    const initialSession: ChatSession = {
      id: initSessionId,
      title: 'New Chat',
      messages: [],
      updatedAt: Date.now(),
    };
    setSessions([initialSession]);
    setCurrentSessionId(initSessionId);
  }, []);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleNewChat = () => {
    const newSessionId = generateId();
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      messages: [],
      updatedAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
    setSidebarOpen(false);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      const remaining = sessions.filter(s => s.id !== id);
      if (remaining.length > 0) {
        setCurrentSessionId(remaining[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !currentSessionId) return;

    const userMessage: Message = {
      id: generateId(),
      role: Role.USER,
      content: input,
      timestamp: Date.now(),
    };

    // Optimistically update UI
    const updatedMessages = [...messages, userMessage];
    updateSessionMessages(currentSessionId, updatedMessages);
    
    // Generate Title if first message
    if (messages.length === 0) {
      updateSessionTitle(currentSessionId, input.slice(0, 30) + (input.length > 30 ? '...' : ''));
    }

    setInput('');
    setIsLoading(true);

    // Create placeholder for AI response
    const aiMessageId = generateId();
    const placeholderAiMessage: Message = {
      id: aiMessageId,
      role: Role.MODEL,
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    updateSessionMessages(currentSessionId, [...updatedMessages, placeholderAiMessage]);

    try {
      let accumulatedText = '';
      const stream = sendMessageStream(userMessage.content, selectedModel);

      for await (const chunk of stream) {
        accumulatedText += chunk;
        updateSessionMessages(currentSessionId, [
          ...updatedMessages,
          { ...placeholderAiMessage, content: accumulatedText }
        ]);
      }
      
      // Finalize message
      updateSessionMessages(currentSessionId, [
        ...updatedMessages,
        { ...placeholderAiMessage, content: accumulatedText, isStreaming: false }
      ]);

    } catch (error) {
      console.error('Failed to send message:', error);
      updateSessionMessages(currentSessionId, [
        ...updatedMessages,
        { 
          ...placeholderAiMessage, 
          content: "**Error:** Failed to generate response. Please check your API key or try again.", 
          isStreaming: false 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSessionMessages = (sessionId: string, newMessages: Message[]) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, messages: newMessages, updatedAt: Date.now() } 
        : session
    ));
  };

  const updateSessionTitle = (sessionId: string, title: string) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, title } : session
    ));
  };

  return (
    <div className="flex h-screen bg-[#343541] text-gray-100 overflow-hidden font-sans">
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onSelectSession={setCurrentSessionId}
        onDeleteSession={handleDeleteSession}
      />

      <div className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <header className="flex items-center justify-between p-2 border-b border-gray-800 bg-[#343541] sm:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-300 hover:text-white">
            <Menu size={24} />
          </button>
          <span className="font-medium text-sm">NovaChat</span>
          <button onClick={handleNewChat} className="p-2 text-gray-300 hover:text-white">
            <PlusIcon />
          </button>
        </header>

        {/* Model Selector (Top Bar for Desktop) */}
        <div className="hidden md:flex items-center justify-center p-4">
           <div className="bg-[#202123] p-1 rounded-lg flex items-center space-x-1">
              <button 
                onClick={() => setSelectedModel(ModelType.FLASH)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${selectedModel === ModelType.FLASH ? 'bg-[#40414f] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
              >
                <Zap size={16} className={selectedModel === ModelType.FLASH ? "text-yellow-400" : ""} />
                Flash
              </button>
              <button 
                onClick={() => setSelectedModel(ModelType.PRO)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${selectedModel === ModelType.PRO ? 'bg-[#40414f] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
              >
                <BrainCircuit size={16} className={selectedModel === ModelType.PRO ? "text-purple-400" : ""} />
                Pro (Reasoning)
              </button>
           </div>
        </div>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto w-full">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="bg-white/10 p-4 rounded-full mb-6">
                 <Bot size={48} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-white">NovaChat AI</h2>
              <p className="max-w-md text-gray-400 mb-8">
                Experience the power of Google Gemini models. Select "Flash" for speed or "Pro" for complex reasoning and coding tasks.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                <button onClick={() => { setInput("Explain quantum computing in simple terms"); }} className="p-4 bg-[#202123] hover:bg-[#2A2B32] border border-gray-700/50 rounded-xl text-left transition-colors">
                  <h3 className="font-medium text-white mb-1">Explain quantum computing</h3>
                  <p className="text-xs text-gray-400">in simple terms for a beginner</p>
                </button>
                <button onClick={() => { setInput("Write a React component for a countdown timer"); }} className="p-4 bg-[#202123] hover:bg-[#2A2B32] border border-gray-700/50 rounded-xl text-left transition-colors">
                  <h3 className="font-medium text-white mb-1">Write code</h3>
                  <p className="text-xs text-gray-400">React component for a timer</p>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col pb-32">
              {messages.map((msg, index) => (
                <div 
                  key={msg.id} 
                  className={`w-full border-b border-black/10 dark:border-gray-900/50 ${
                    msg.role === Role.MODEL ? 'bg-[#444654]' : 'bg-[#343541]'
                  }`}
                >
                  <div className="max-w-3xl mx-auto p-4 md:p-6 flex gap-4 md:gap-6">
                    <div className="flex-shrink-0 flex flex-col relative items-end">
                      {msg.role === Role.USER ? (
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">
                          U
                        </div>
                      ) : (
                        <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-white ${selectedModel === ModelType.PRO ? 'bg-purple-600' : 'bg-emerald-600'}`}>
                           {selectedModel === ModelType.PRO ? <BrainCircuit size={18} /> : <Zap size={18} />}
                        </div>
                      )}
                    </div>
                    
                    <div className="relative flex-1 overflow-hidden">
                      <div className="text-xs text-gray-400 font-bold mb-1 opacity-90">
                        {msg.role === Role.USER ? 'You' : (selectedModel === ModelType.PRO ? 'Nova Pro' : 'Nova Flash')}
                      </div>
                      <div className="prose prose-invert max-w-none">
                         <MarkdownRenderer content={msg.content || (msg.isStreaming ? 'Thinking...' : '')} />
                         {msg.isStreaming && !msg.content && (
                           <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse"/>
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#343541] via-[#343541] to-transparent pt-10 pb-6 px-4">
           <ChatInput 
              input={input} 
              setInput={setInput} 
              onSubmit={handleSendMessage} 
              isLoading={isLoading} 
           />
        </div>
      </div>
    </div>
  );
};

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default App;