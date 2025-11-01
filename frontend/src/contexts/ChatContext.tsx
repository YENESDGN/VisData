import { createContext, useContext, ReactNode, useRef } from 'react';
import { Message } from '../components/ChatAssistant';

interface ChatContextType {
  addMessage: (text: string, type?: 'user' | 'assistant') => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
  onExternalMessage?: (message: Message) => void;
}

export const ChatProvider = ({ children, onExternalMessage }: ChatProviderProps) => {
  const messageIdCounter = useRef(0);

  const addMessage = (text: string, type: 'user' | 'assistant' = 'assistant') => {
    messageIdCounter.current += 1;
    const message: Message = {
      id: `external-${Date.now()}-${messageIdCounter.current}`,
      text,
      type,
      timestamp: new Date(),
    };
    if (onExternalMessage) {
      onExternalMessage(message);
    }
  };

  return (
    <ChatContext.Provider value={{ addMessage }}>
      {children}
    </ChatContext.Provider>
  );
};

