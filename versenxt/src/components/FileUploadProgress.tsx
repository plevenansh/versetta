// components/FileUploadProgress.tsx
import React from 'react';
import { Progress } from './ui/progress';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { formatFileSize } from '../lib/utils';

interface FileUploadProgressProps {
  fileName: string;
  progress: number;
  size: number;
  error?: string;
  onCancel?: () => void;
  status: 'uploading' | 'completed' | 'error';
}

export function FileUploadProgress({
  fileName,
  progress,
  size,
  error,
  onCancel,
  status
}: FileUploadProgressProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center space-x-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium truncate">{fileName}</p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {formatFileSize(size)}
              </span>
              {status === 'uploading' && onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center space-x-2">
              {status === 'uploading' && (
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              )}
              {status === 'completed' && (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completed
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-center text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error || 'Upload failed'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}