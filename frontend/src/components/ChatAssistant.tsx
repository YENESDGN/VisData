import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  type: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatAssistantProps {
  onFileUploadRequest?: () => void;
}

export const ChatAssistant = ({ onFileUploadRequest }: ChatAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I can help you visualize your data. Upload a CSV or Excel file to get started, or ask me any questions about data visualization.',
      type: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      type: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    setTimeout(() => {
      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAssistantResponse(inputValue),
        type: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantResponse]);
    }, 500);
  };

  const getAssistantResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes('upload') || input.includes('file')) {
      return 'Great! Click the "ADD YOUR FILE" button below to upload your CSV or Excel file. I\'ll help you create beautiful visualizations once your file is uploaded.';
    }

    if (input.includes('chart') || input.includes('graph') || input.includes('visualiz')) {
      return 'I can help you create various types of charts: bar charts, line graphs, pie charts, scatter plots, and more. First, upload your data file, and I\'ll suggest the best visualization options based on your data.';
    }

    if (input.includes('help') || input.includes('how')) {
      return 'Here\'s how to get started:\n1. Upload a CSV or Excel file using the button below\n2. I\'ll analyze your data automatically\n3. Choose from suggested chart types\n4. Customize your visualization\n5. Save it to your library for future access';
    }

    return 'I\'m here to help you visualize your data! Upload a file to get started, or ask me about chart types, data formats, or anything else related to data visualization.';
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
            disabled={!inputValue.trim()}
            className="group relative w-14 h-14 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
          >
        <div className="absolute inset-0 bg-gradient-to-br from-white to-neutral-600 group-hover:from-white group-hover:to-neutral-500"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity shimmer"></div>
            <Send size={22} className="relative text-white mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
};
