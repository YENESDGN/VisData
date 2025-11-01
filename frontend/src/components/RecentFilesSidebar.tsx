import { FileSpreadsheet, Clock, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiListFiles, BackendFile, apiDeleteFile } from '../lib/api';

interface RecentFile {
  id: string;
  file_name: string;
  file_type?: string;
  created_at: string;
}

interface RecentFilesSidebarProps {
  onFileSelect: (fileId: string) => void;
}

export const RecentFilesSidebar = ({ onFileSelect }: RecentFilesSidebarProps) => {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadRecentFiles();
    }
  }, [user]);

  const loadRecentFiles = async () => {
    try {
      const files: BackendFile[] = await apiListFiles();
      const mapped: RecentFile[] = files
        .sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime())
        .slice(0, 10)
        .map((f) => ({
          id: String(f.id),
          file_name: f.filename,
          file_type: f.filename.endsWith('.csv') ? 'csv' : f.filename.endsWith('.xlsx') ? 'xlsx' : 'file',
          created_at: f.upload_date,
        }));
      setRecentFiles(mapped);
    } catch {
      // istekte sorun olsa da mevcut listeyi koru
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // iyimser güncelleme
      setRecentFiles((prev) => prev.filter((f) => f.id !== id));
      await apiDeleteFile(Number(id));
      // sunucu doğrulaması ardından senkronize et
      await loadRecentFiles();
      // Library'deki kayıtları da temizle
      const key = 'visdata_library';
      const items = JSON.parse(localStorage.getItem(key) || '[]');
      const next = items.filter((it: any) => String(it.fileId) !== String(id));
      localStorage.setItem(key, JSON.stringify(next));
      // Bilgilendirme için event yayınla (LibraryPage dinleyebilir)
      window.dispatchEvent(new Event('visdata-library-changed'));
    } catch {
      // hata durumunda listeyi yeniden yükle (geri al)
      await loadRecentFiles();
    }
  };

  if (!user) {
    return (
      <aside className="w-72 glass-dark border border-white/10 p-6 rounded-3xl">
        <h2 className="text-transparent bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-xl font-bold mb-4">Recent Files</h2>
        <div className="text-gray-400 text-sm">Sign in to see your recent files</div>
      </aside>
    );
  }

  return (
    <aside className="w-72 glass-dark border border-white/10 p-6 rounded-3xl">
      <h2 className="text-transparent bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-xl font-bold mb-6">Recent Files</h2>
      <div className="space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar">
        {recentFiles.length === 0 ? (
          <div className="text-gray-400 text-sm">No files uploaded yet</div>
        ) : (
          recentFiles.map((file, index) => (
            <div
              key={file.id}
              className="w-full glass-effect hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left transition-all duration-300 hover:scale-105 hover:border-white/30 group cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onFileSelect(file.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-violet-500/50 transition-shadow">
                    <FileSpreadsheet size={22} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm truncate">
                    {file.file_name}
                  </div>
                  <div className="text-gray-400 text-xs flex items-center space-x-1 mt-1">
                    <Clock size={12} />
                    <span>{new Date(file.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file.id);
                  }}
                  className="px-3 py-2 rounded-lg border border-white/10 text-red-300 bg-transparent opacity-0 group-hover:opacity-100 transition-colors duration-200 hover:bg-red-500/20 hover:border-red-400 hover:text-red-200"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
