import { createContext, useContext, useState, ReactNode } from 'react';
import { Toast } from '../components/Toast';

interface ToastContextType {
  showToast: (message: string, timeout?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<{ message: string; timeout: number } | null>(null);

  const showToast = (message: string, timeout: number = 5000) => {
    setToast({ message, timeout });
  };

  const closeToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          onClose={closeToast}
          timeout={toast.timeout}
        />
      )}
    </ToastContext.Provider>
  );
};

