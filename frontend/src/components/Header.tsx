import { Library, LogOut, User, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onLibraryClick: () => void;
  onSignInClick: () => void;
  onSignUpClick: () => void;
}

export const Header = ({ onLibraryClick, onSignInClick, onSignUpClick }: HeaderProps) => {
  const { user, signOut } = useAuth();

  return (
    <header className="glass-effect border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Sparkles className="text-neutral-300 w-8 h-8 animate-pulse" />
              <div className="absolute inset-0 blur-xl bg-white opacity-20"></div>
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-neutral-300 to-neutral-500 bg-clip-text text-transparent glow-text">
              VisData
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <button
                onClick={onLibraryClick}
                className="group relative px-6 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-300 to-neutral-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity shimmer"></div>
                <div className="relative flex items-center space-x-2 text-white font-semibold">
                  <Library size={20} />
                  <span>Library</span>
                </div>
              </button>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neutral-400 to-neutral-700 flex items-center justify-center glow">
                    <User size={24} className="text-white" />
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 px-6 py-3 glass-effect rounded-xl hover:bg-white/10 transition-all border border-white/10 text-white"
                >
                  <LogOut size={18} />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={onSignInClick}
                  className="group relative px-8 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
                >
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-700 via-neutral-500 to-neutral-300 opacity-90 group-hover:from-neutral-600 group-hover:via-neutral-500 group-hover:to-neutral-200 group-hover:opacity-100"></div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity shimmer"></div>
                  <span className="relative text-white font-bold">Sign In</span>
                </button>
                <button
                  onClick={onSignUpClick}
                  className="group relative px-8 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-neutral-700 via-neutral-500 to-neutral-300 opacity-90 group-hover:from-neutral-600 group-hover:via-neutral-500 group-hover:to-neutral-200 group-hover:opacity-100"></div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity shimmer"></div>
                  <span className="relative text-white font-bold">Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
