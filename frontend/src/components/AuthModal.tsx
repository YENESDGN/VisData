import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthModal = ({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setError('');
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onClose();
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="glass-dark border border-white/10 rounded-3xl p-10 w-full max-w-md relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
        >
          <X size={24} />
        </button>

        <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-neutral-300 to-neutral-500 bg-clip-text text-transparent mb-8">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-neutral-200 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-5 py-4 glass-effect border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neutral-300 transition-colors"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-4 glass-effect border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neutral-300 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-4 glass-effect border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neutral-300 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="glass-effect border border-red-500/50 bg-red-500/10 text-red-300 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full py-4 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 mt-6"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white via-neutral-400 to-neutral-700 group-hover:from-white group-hover:via-neutral-300 group-hover:to-neutral-600"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity shimmer"></div>
            <span className="relative text-white font-bold text-lg">
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
            </span>
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-neutral-300 font-semibold hover:text-neutral-200 transition-colors"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-neutral-300 font-semibold hover:text-neutral-200 transition-colors"
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
