import { useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  timeout?: number;
}

export const Toast = ({ message, onClose, timeout = 5000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, timeout);

    return () => clearTimeout(timer);
  }, [onClose, timeout]);

  return (
    <div className="fixed top-20 right-8 z-50 animate-slide-in-right">
      <div className="glass-dark border border-white/20 rounded-xl p-4 shadow-2xl flex items-center space-x-3 min-w-[300px] max-w-md">
        <CheckCircle2 size={24} className="text-green-400 flex-shrink-0" />
        <p className="text-white font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors flex-shrink-0 p-1 hover:bg-white/10 rounded"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

