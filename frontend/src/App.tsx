import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ChatProvider } from './contexts/ChatContext';
import { Header } from './components/Header';
import { RecentFilesSidebar } from './components/RecentFilesSidebar';
import { ChatAssistant, Message } from './components/ChatAssistant';
import { FileUpload } from './components/FileUpload';
import { AuthModal } from './components/AuthModal';
import { VisualizationPage } from './components/VisualizationPage';
import { LibraryPage } from './components/LibraryPage';
import { apiListFiles } from './lib/api';

type Page = 'home' | 'visualization' | 'library';

type AuthMode = 'login' | 'signup';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [selectedFile, setSelectedFile] = useState<{ id: string; name: string } | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);

  const handleFileUploaded = (fileId: string, fileName: string) => {
    setSelectedFile({ id: fileId, name: fileName });
    setCurrentPage('visualization');
  };

  const handleFileSelect = async (fileId: string) => {
    try {
      // Dosya bilgilerini al
      const files = await apiListFiles();
      const selectedFileData = files.find(f => String(f.id) === fileId);
      
      if (selectedFileData) {
        setSelectedFile({ id: fileId, name: selectedFileData.filename });
        setCurrentPage('visualization');
      }
    } catch (error) {
      console.error('Error loading file:', error);
    }
  };

  const handleExternalChatMessage = (message: Message) => {
    setChatMessages((prev) => [...prev, message]);
  };

  return (
    <AuthProvider>
      <ToastProvider>
        <ChatProvider onExternalMessage={handleExternalChatMessage}>
          <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 opacity-100"></div>

        <div className="relative z-10">
          <Header
            onLibraryClick={() => setCurrentPage('library')}
            onSignInClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}
            onSignUpClick={() => { setAuthMode('signup'); setAuthModalOpen(true); }}
          />

          {currentPage === 'home' && (
            <div className="max-w-7xl mx-auto p-8">
              <div className="flex gap-8">
                <RecentFilesSidebar onFileSelect={handleFileSelect} />

                <div className="flex-1 space-y-8">
                  <div className="h-[550px]">
                    <ChatAssistant externalMessages={chatMessages} />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 opacity-20 blur-3xl animate-pulse-slow"></div>
                    <div className="relative glass-dark rounded-3xl p-12 border border-white/10">
                      <FileUpload
                        onFileUploaded={handleFileUploaded}
                        onAuthRequired={() => { setAuthMode('login'); setAuthModalOpen(true); }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'visualization' && selectedFile && (
            <VisualizationPage
              fileId={selectedFile.id}
              fileName={selectedFile.name}
              onBack={() => setCurrentPage('home')}
            />
          )}

          {currentPage === 'library' && (
            <LibraryPage
              onBack={() => setCurrentPage('home')}
              onVisualizationSelect={(fileId, fileName) => {
                setSelectedFile({ id: fileId, name: fileName });
                setCurrentPage('visualization');
              }}
            />
          )}

          <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authMode} />
        </div>
      </div>
        </ChatProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
