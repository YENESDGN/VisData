import { ArrowLeft, BarChart3, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

interface LibraryPageProps {
  onBack: () => void;
  onVisualizationSelect: (fileId: string, fileName: string) => void;
}

type SavedViz = {
  id: string;
  fileId: string;
  fileName: string;
  title: string;
  chartType: string;
  selectedColumns: { x: string; y: string };
  aggregation: string;
  timeUnit: string;
  filter: { filterCol: string; filterVal: string };
  createdAt: string;
};

export const LibraryPage = ({ onBack, onVisualizationSelect }: LibraryPageProps) => {
  const { user } = useAuth();
  const [items, setItems] = useState<SavedViz[]>([]);

  useEffect(() => {
    if (!user) return setItems([]);
    const key = 'visdata_library';
    const data: SavedViz[] = JSON.parse(localStorage.getItem(key) || '[]');
    setItems(data);
    const onChange = () => {
      const refreshed: SavedViz[] = JSON.parse(localStorage.getItem(key) || '[]');
      setItems(refreshed);
    };
    window.addEventListener('storage', onChange);
    window.addEventListener('visdata-library-changed', onChange as EventListener);
    return () => {
      window.removeEventListener('storage', onChange);
      window.removeEventListener('visdata-library-changed', onChange as EventListener);
    };
  }, [user]);

  const remove = (id: string) => {
    const key = 'visdata_library';
    const data: SavedViz[] = JSON.parse(localStorage.getItem(key) || '[]');
    const next = data.filter(x => x.id !== id);
    localStorage.setItem(key, JSON.stringify(next));
    setItems(next);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="group flex items-center space-x-2 text-neutral-200 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </button>

        <div className="glass-dark border border-white/10 rounded-3xl p-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-neutral-300 to-neutral-500 bg-clip-text text-transparent mb-10">Your Library</h1>
          {(!user || items.length === 0) && (
            <div className="text-center py-20">
              <div className="relative inline-block mb-6">
                <BarChart3 size={80} className="text-neutral-300 mx-auto" />
                <div className="absolute inset-0 blur-2xl bg-white opacity-20"></div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {user ? 'No visualizations saved yet' : 'Please sign in to view your library'}
              </h3>
              <p className="text-gray-400 text-lg">
                Save a visualization from the Visualize page to see it here.
              </p>
            </div>
          )}

          {user && items.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((it) => (
                <div key={it.id} className="glass-effect border border-white/10 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="text-white font-semibold truncate mb-1">{it.title}</div>
                    <div className="text-xs text-gray-400 truncate mb-4">{it.fileName} • {new Date(it.createdAt).toLocaleString()}</div>
                    <div className="text-xs text-gray-300">
                      <div>Type: <span className="font-medium">{it.chartType}</span></div>
                      <div>X: <span className="font-medium">{it.selectedColumns.x}</span> • Y: <span className="font-medium">{it.selectedColumns.y}</span></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-5">
                    <button
                      onClick={() => onVisualizationSelect(it.fileId, it.fileName)}
                      className="flex items-center space-x-2 px-3 py-2 glass-effect rounded-lg hover:bg-white/10 border border-white/10 text-white"
                    >
                      <Eye size={16} />
                      <span className="text-sm">Open</span>
                    </button>
                    <button
                      onClick={() => remove(it.id)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200"
                    >
                      <Trash2 size={16} />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
