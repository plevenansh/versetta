// components/FileViewer.tsx
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { 
  Maximize2, 
  Minimize2, 
  Download, 
  Share2, 
  Rotate3D,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatFileSize, formatDate } from '../lib/utils';

interface FileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  contentType: string;
  fileSize?: number;
  createdAt?: string;
  onDownload?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export function FileViewer({ 
  isOpen, 
  onClose, 
  fileUrl, 
  fileName, 
  contentType, 
  fileSize,
  createdAt,
  onDownload,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: FileViewerProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setZoom(1);
    setRotation(0);
  }, [fileUrl]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const renderContent = () => {
    if (contentType.startsWith('image/')) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {isLoading && <Skeleton className="absolute inset-0" />}
          <Image
            src={fileUrl}
            alt={fileName}
            layout="responsive"
            width={1000}
            height={1000}
            objectFit="contain"
            className="transition-transform duration-200 ease-in-out"
            style={{ 
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              opacity: isLoading ? 0 : 1
            }}
            onLoadingComplete={() => setIsLoading(false)}
            unoptimized={true}
          />
        </div>
      );
    }

    if (contentType.startsWith('video/')) {
      return (
        <video 
          src={fileUrl} 
          controls 
          className="max-w-full h-full"
          onLoadedData={() => setIsLoading(false)}
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    if (contentType === 'application/pdf') {
      return (
        <iframe 
          src={fileUrl} 
          className="w-full h-full"
          onLoad={() => setIsLoading(false)}
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-lg mb-4">Preview not available for this file type</p>
        <Button onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download File
        </Button>
      </div>
    );
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={onClose}
      className={isFullScreen ? 'fixed inset-0 z-50' : undefined}
    >
      <DialogContent className={`
        ${isFullScreen ? '!max-w-none !w-screen !h-screen !p-0' : 'max-w-4xl'}
        overflow-hidden
      `}>
        <DialogHeader className="flex justify-between items-center p-4">
          <div className="flex-1">
            <DialogTitle className="text-xl">{fileName}</DialogTitle>
            {(fileSize || createdAt) && (
              <div className="text-sm text-muted-foreground mt-1">
                {fileSize && <span className="mr-4">{formatFileSize(fileSize)}</span>}
                {createdAt && <span>{formatDate(createdAt)}</span>}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {contentType.startsWith('image/') && (
              <>
                <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleRotate}>
                  <Rotate3D className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsFullScreen(!isFullScreen)}>
              {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className={`
          ${isFullScreen ? 'h-[calc(100vh-8rem)]' : 'h-[60vh]'}
          relative
        `}>
          {renderContent()}
        </ScrollArea>

        <DialogFooter className="p-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center space-x-2">
              {onDownload && (
                <Button variant="outline" onClick={onDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              )}
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
            {(onPrevious || onNext) && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  disabled={!hasPrevious}
                  onClick={onPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  disabled={!hasNext}
                  onClick={onNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// // src/components/FileViewer.tsx
// import React, { useState } from 'react';
// import Image from 'next/image';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
// import { Button } from './ui/button';
// import { Maximize2, Minimize2 } from 'lucide-react';

// interface FileViewerProps {
//   isOpen: boolean;
//   onClose: () => void;
//   fileUrl: string;
//   fileName: string;
//   contentType: string;
// }

// export function FileViewer({ isOpen, onClose, fileUrl, fileName, contentType }: FileViewerProps) {
//   const [isFullScreen, setIsFullScreen] = useState(false);

//   const toggleFullScreen = () => {
//     setIsFullScreen(!isFullScreen);
//   };

//   const dialogClass = isFullScreen ? 'fixed inset-0 z-50 !max-w-none !w-screen !h-screen' : 'max-w-4xl w-full';
//   const contentClass = isFullScreen ? 'h-full' : 'max-h-[80vh]';

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//      <DialogContent 
//         className={`${dialogClass} ${isFullScreen ? 'p-0' : ''}`}
//         >
//         <DialogHeader>
//           <DialogTitle className="flex justify-between items-center">
//             {fileName}
//             <Button onClick={toggleFullScreen} variant="ghost" size="sm">
//               {isFullScreen ? <Minimize2 /> : <Maximize2 />}
//             </Button>
//           </DialogTitle>
//         </DialogHeader>
//         <div className={`${contentClass} overflow-auto ${isFullScreen ? 'w-full h-full' : ''}`}>
//           {contentType.startsWith('image/') ? (
//             <div className={`relative ${isFullScreen ? 'w-full h-full' : 'w-full max-h-[80vh]'}`}>
//             <Image  
//                 src={fileUrl} 
//                 alt={fileName} 
//                 layout="responsive"
//                 width={1000}
//                 height={1000}
//                 objectFit="contain"
//                 unoptimized={true}
//               />
//             </div>
//           ) : contentType.startsWith('video/') ? (
//             <video src={fileUrl} controls className="max-w-full h-full">
//               Your browser does not support the video tag.
//             </video>
//           ) : contentType === 'application/pdf' ? (
//             <iframe src={fileUrl} className="w-full h-full" />
//           ) : (
//             <div className="text-center py-4">
//               <p>Preview not available for this file type.</p>
//               <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
//                 Download file
//               </a>
//             </div>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }