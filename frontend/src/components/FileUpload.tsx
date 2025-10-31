import { Upload, FileCheck } from 'lucide-react';
import { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiUploadFile } from '../lib/api';

interface FileUploadProps {
  onFileUploaded: (fileId: string, fileName: string) => void;
  onAuthRequired: () => void;
}

export const FileUpload = ({ onFileUploaded, onAuthRequired }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleClick = () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      setError('Please upload a CSV or Excel file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const created = await apiUploadFile(file);
      onFileUploaded(String(created.id), created.filename);
    } catch (err: any) {
      setError(err.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="text-center relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-neutral-300 to-neutral-500 bg-clip-text text-transparent mb-3">
          Upload Your Data
        </h2>
        <p className="text-neutral-200 text-lg">
          Transform your raw data into stunning visualizations
        </p>
      </div>

      <button
        onClick={handleClick}
        disabled={uploading}
        className="group relative px-12 py-6 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mx-auto flex items-center space-x-4"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-700 via-neutral-500 to-neutral-300 group-hover:from-neutral-600 group-hover:via-neutral-500 group-hover:to-neutral-200"></div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity shimmer"></div>
        <div className="relative flex items-center space-x-4">
          {uploading ? (
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <div className="relative">
              <Upload size={28} className="text-white" />
              <div className="absolute inset-0 blur-lg bg-white opacity-50"></div>
            </div>
          )}
          <span className="text-white font-bold text-xl">
            {uploading ? 'Processing Your File...' : 'ADD YOUR FILE'}
          </span>
        </div>
      </button>

      {error && (
        <div className="mt-6 glass-effect border border-red-500/50 bg-red-500/10 text-red-300 px-6 py-4 rounded-xl text-sm animate-shake">
          {error}
        </div>
      )}

      <div className="mt-8 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2 text-gray-400">
          <FileCheck size={18} className="text-neutral-300" />
          <span>CSV Files</span>
        </div>
        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
        <div className="flex items-center space-x-2 text-gray-400">
          <FileCheck size={18} className="text-neutral-300" />
          <span>Excel Files</span>
        </div>
      </div>
    </div>
  );
};
