// src/components/FileViewer.tsx
import React, { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';

interface FileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  contentType: string;
}

export function FileViewer({ isOpen, onClose, fileUrl, fileName, contentType }: FileViewerProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const dialogClass = isFullScreen ? 'fixed inset-0 z-50 !max-w-none !w-screen !h-screen' : 'max-w-4xl w-full';
  const contentClass = isFullScreen ? 'h-full' : 'max-h-[80vh]';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
     <DialogContent 
        className={`${dialogClass} ${isFullScreen ? 'p-0' : ''}`}
        >
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            {fileName}
            <Button onClick={toggleFullScreen} variant="ghost" size="sm">
              {isFullScreen ? <Minimize2 /> : <Maximize2 />}
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className={`${contentClass} overflow-auto ${isFullScreen ? 'w-full h-full' : ''}`}>
          {contentType.startsWith('image/') ? (
            <div className={`relative ${isFullScreen ? 'w-full h-full' : 'w-full max-h-[80vh]'}`}>
            <Image  
                src={fileUrl} 
                alt={fileName} 
                layout="responsive"
                width={1000}
                height={1000}
                objectFit="contain"
                unoptimized={true}
              />
            </div>
          ) : contentType.startsWith('video/') ? (
            <video src={fileUrl} controls className="max-w-full h-full">
              Your browser does not support the video tag.
            </video>
          ) : contentType === 'application/pdf' ? (
            <iframe src={fileUrl} className="w-full h-full" />
          ) : (
            <div className="text-center py-4">
              <p>Preview not available for this file type.</p>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Download file
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}