import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2, MessageSquare } from 'lucide-react';
import { sendChatMessage, ChatMessage } from '../services/aiService';
import ReactMarkdown from 'react-markdown';

export const AIAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '¡Hola! Soy tu asistente de estudio de NovusPrep. Cuéntame, ¿qué estás estudiando, qué nivel tienes o qué temas buscas repasar? Te ayudaré a encontrar la carpeta perfecta.' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userMessage = inputText.trim();
    setInputText('');
    
    // Add user message to UI
    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: userMessage }];
    setMessages(newMessages);
    setIsAnalyzing(true);
    
    try {
      // Send to AI
      const responseText = await sendChatMessage(userMessage, messages);
      
      // Add AI response to UI
      setMessages([...newMessages, { role: 'model', text: responseText }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'model', text: 'Hubo un error al procesar tu mensaje. Por favor intenta de nuevo.' }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.6)] transition-all hover:scale-105"
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">Descubre qué estudiar con IA</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-500/30 rounded-2xl shadow-[0_10px_40px_-10px_rgba(147,51,234,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(147,51,234,0.2)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-purple-600 p-4 flex items-center justify-between text-white shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold">Asistente de Estudio IA</h3>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-purple-500 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-purple-50/30 dark:bg-slate-900/50 space-y-4">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-purple-600 text-white rounded-tr-sm' 
                  : 'bg-white dark:bg-slate-800 border border-purple-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'
              }`}
            >
              {msg.role === 'model' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-100 dark:prose-pre:bg-slate-900">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        
        {isAnalyzing && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 border border-purple-100 dark:border-slate-700 p-3.5 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span className="text-sm text-slate-500 dark:text-slate-400">Escribiendo...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-purple-100 dark:border-slate-800 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ej: Soy de ingeniería y busco prácticas..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition-colors placeholder-slate-400 dark:placeholder-slate-500"
            disabled={isAnalyzing}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isAnalyzing}
            className="p-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-400 disabled:dark:bg-purple-800 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex-shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
