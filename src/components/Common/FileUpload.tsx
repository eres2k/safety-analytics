import { useState, useRef } from 'react';
import { ArrowUpTrayIcon, DocumentIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  type?: 'injury' | 'nearmiss';
}

export default function FileUpload({ 
  onFileSelect, 
  accept = '.csv', 
  label = 'Upload CSV File',
  type 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      if (files[0].type === 'text/csv' || files[0].name.endsWith('.csv')) {
        onFileSelect(files[0]);
        toast.success(`File ${files[0].name} uploaded successfully`);
      } else {
        toast.error('Please upload a CSV file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
      toast.success(`File ${files[0].name} uploaded successfully`);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
        isDragging 
          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-orange-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="flex flex-col items-center gap-4">
        {type === 'injury' ? (
          <div className="text-6xl">🏥</div>
        ) : type === 'nearmiss' ? (
          <div className="text-6xl">⚠️</div>
        ) : (
          <DocumentIcon className="w-16 h-16 text-gray-400" />
        )}
        
        <div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {label}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Drag and drop or click to browse
          </p>
        </div>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <ArrowUpTrayIcon className="w-5 h-5" />
          Choose File
        </button>
        
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Supported format: CSV
        </p>
      </div>
    </div>
  );
}
