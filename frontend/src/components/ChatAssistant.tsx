import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiChat } from '../lib/api';

export interface Message {
  id: string;
  text: string;
  type: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatAssistantProps {
  onFileUploadRequest?: () => void;
  externalMessages?: Message[];
  onMessageAdded?: (message: Message) => void;
}

export const ChatAssistant = ({ onFileUploadRequest, externalMessages, onMessageAdded }: ChatAssistantProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: user 
        ? 'Hello! I can help you visualize your data. Ask me about your uploaded files, and I\'ll analyze them to recommend the best chart types and axis selections. For example, you can say "analyze my files" or "what\'s the best chart for file X".'
        : 'Hello! I can help you visualize your data. Please sign in to access your files and get AI-powered recommendations.',
      type: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastExternalMessageId = useRef<string>('');
  
  // Dışarıdan gelen mesajları dinle
  useEffect(() => {
    if (externalMessages && externalMessages.length > 0) {
      const latestMessage = externalMessages[externalMessages.length - 1];
      if (latestMessage.id !== lastExternalMessageId.current) {
        setMessages((prev) => [...prev, latestMessage]);
        lastExternalMessageId.current = latestMessage.id;
      }
    }
  }, [externalMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessageText = inputValue.trim();
    const loadingMessageId = `loading-${Date.now()}`;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      type: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    // Loading mesajı ekle
    const loadingMessage: Message = {
      id: loadingMessageId,
      text: 'Thinking...',
      type: 'assistant',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      if (user) {
        // Backend API ile konuş
        const response = await apiChat(userMessageText);
        
        let responseText = response.response;
        
        // Eğer analiz sonucu varsa, detayları ekle
        if (response.analysis && !response.analysis.error) {
          const chartTypeNames: Record<string, string> = {
            'bar': 'Bar Chart',
            'line': 'Line Chart',
            'pie': 'Pie Chart',
            'scatter': 'Scatter Plot',
            'area': 'Area Chart',
            'table': 'Table'
          };
          
          responseText += `\n\n📊 Analysis Details:\n` +
            `• Chart Type: ${chartTypeNames[response.analysis.chartType] || response.analysis.chartType}\n` +
            `• X-Axis: ${response.analysis.xColumn}\n` +
            `• Y-Axis: ${response.analysis.yColumn}\n` +
            `• Reasoning: ${response.analysis.reason}`;
        }
        
        // Loading mesajını kaldır ve gerçek cevabı ekle
        setMessages((prev) => {
          const filtered = prev.filter(msg => msg.id !== loadingMessageId);
          const assistantResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: responseText,
            type: 'assistant',
            timestamp: new Date(),
          };
          return [...filtered, assistantResponse];
        });
      } else {
        // Kullanıcı giriş yapmamış
        setMessages((prev) => {
          const filtered = prev.filter(msg => msg.id !== loadingMessageId);
          const assistantResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: 'Please sign in to use the AI assistant with file analysis features.',
            type: 'assistant',
            timestamp: new Date(),
          };
          return [...filtered, assistantResponse];
        });
      }
    } catch (error: any) {
      setMessages((prev) => {
        const filtered = prev.filter(msg => msg.id !== loadingMessageId);
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: `Sorry, I encountered an error: ${error.message || 'Unknown error'}. Please try again.`,
          type: 'assistant',
          timestamp: new Date(),
        };
        return [...filtered, errorResponse];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass-dark border border-white/10 rounded-3xl overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-neutral-500/10 to-neutral-700/10 pointer-events-none"></div>

      <div className="relative flex items-center justify-between p-5 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Sparkles className="text-cyan-400 w-6 h-6" />
            <div className="absolute inset-0 blur-lg bg-cyan-500 opacity-50"></div>
          </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">AI Assistant</h3>
        </div>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 relative">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 animate-fade-in ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {message.type === 'assistant' && (
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-neutral-400 to-neutral-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-neutral-700/50">
                  <Bot size={20} className="text-white" />
                </div>
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-5 py-3 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
                message.type === 'user'
                  ? 'bg-gradient-to-br from-white to-neutral-600 text-white shadow-lg shadow-neutral-700/30'
                  : 'glass-effect border border-white/10 text-gray-100'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
            </div>
            {message.type === 'user' && (
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/50">
                  <User size={20} className="text-white" />
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="relative p-6 border-t border-white/10 bg-black/20">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about your data..."
            className="flex-1 glass-effect border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-neutral-300 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="group relative w-14 h-14 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
          >
        <div className="absolute inset-0 bg-gradient-to-br from-white to-neutral-600 group-hover:from-white group-hover:to-neutral-500"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity shimmer"></div>
            {isLoading ? (
              <Loader2 size={22} className="relative text-white mx-auto animate-spin" />
            ) : (
              <Send size={22} className="relative text-white mx-auto" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
