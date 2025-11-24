/**
 * File Upload Component
 * Drag-and-drop file upload with progress
 */

import React, { useCallback, useState } from 'react';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './Card';

export interface FileUploadProps {
  accept?: string;
  onFileSelect: (file: File) => Promise<{ success: boolean; recordCount?: number; error?: string }>;
  title: string;
  description?: string;
  isUploading?: boolean;
  uploadProgress?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = '.csv',
  onFileSelect,
  title,
  description,
  isUploading = false,
  uploadProgress = 0,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await processFile(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        await processFile(files[0]);
      }
    },
    [onFileSelect]
  );

  const processFile = async (file: File) => {
    setUploadResult(null);

    try {
      const result = await onFileSelect(file);

      if (result.success) {
        setUploadResult({
          success: true,
          message: `Successfully uploaded ${result.recordCount} records`,
        });
      } else {
        setUploadResult({
          success: false,
          message: result.error || 'Upload failed',
        });
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed',
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>

          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              isDragging ? 'border-primary bg-primary/5' : 'border-border',
              isUploading && 'opacity-50 pointer-events-none'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id={`file-upload-${title}`}
              className="hidden"
              accept={accept}
              onChange={handleFileChange}
              disabled={isUploading}
            />

            <label
              htmlFor={`file-upload-${title}`}
              className="flex flex-col items-center cursor-pointer"
            >
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-base font-medium mb-1">
                {isDragging ? 'Drop file here' : 'Drag and drop or click to upload'}
              </p>
              <p className="text-sm text-muted-foreground">CSV files only</p>
            </label>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {uploadResult && (
            <div
              className={cn(
                'flex items-start gap-3 p-4 rounded-lg',
                uploadResult.success ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              )}
            >
              {uploadResult.success ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm font-medium">{uploadResult.message}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
