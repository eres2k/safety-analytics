import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface FileUploadProps {
  onDataLoaded: (data: any[]) => void;
  type: 'injury' | 'nearmiss';
}

export default function FileUpload({ onDataLoaded, type }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        onDataLoaded(results.data);
        toast.success(`Loaded ${results.data.length} ${type} records successfully!`);
      },
      error: (error) => {
        toast.error(`Failed to parse CSV: ${error.message}`);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={clsx(
        'border-2 border-dashed rounded-xl p-8 text-center transition-all',
        isDragging
          ? 'border-amazon-orange bg-amazon-orange/10'
          : 'border-gray-300 dark:border-gray-600 hover:border-amazon-orange'
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        📁 Drag and drop your {type} CSV file here
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-8 py-3 bg-amazon-orange text-white rounded-lg hover:bg-amazon-orange/90 transition-colors font-medium"
      >
        Choose File
      </button>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        {type === 'injury'
          ? 'Supports CSV files with injury/illness tracking data'
          : 'Supports CSV files with near miss tracking data'}
      </p>
    </div>
  );
}
