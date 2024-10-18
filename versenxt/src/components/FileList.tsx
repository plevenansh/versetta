
import React, { useState } from 'react';
import { trpc } from '../utils/trpc';
import { Button } from './ui/button';
import { FileViewer } from './FileViewer';
import Image from 'next/image';

interface FileListProps {
  teamId: number;
  projectId?: number;
  subStageId?: number;
  
}


export function FileList({ teamId, projectId, subStageId }: FileListProps) {
  const { data: files, isLoading, error, refetch } = trpc.storage.listFiles.useQuery({ teamId, projectId, subStageId });
  const getViewUrlMutation = trpc.storage.getViewUrl.useMutation();
  const getDownloadUrlMutation = trpc.storage.getDownloadUrl.useMutation();
  const deleteFileMutation = trpc.storage.deleteFile.useMutation({
    onSuccess: () => refetch()
  });

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState<{ url: string; name: string; contentType: string } | null>(null);


  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleView = async (fileId: number, fileName: string, contentType: string | null) => {
    try {
      const result = await getViewUrlMutation.mutateAsync(fileId);
      if (result.sasUrl) {
        setViewerFile({ url: result.sasUrl, name: fileName, contentType: contentType || 'application/octet-stream' });
        setViewerOpen(true);
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Failed to view file. Please try again.');
    }
  };

  const handleDownload = async (fileId: number) => {
    try {
      const result = await getDownloadUrlMutation.mutateAsync(fileId);
      if (result.sasUrl) {
        window.open(result.sasUrl, '_blank');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const handleDelete = async (fileId: number) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteFileMutation.mutateAsync(fileId);
      } catch (error) {
        console.error('Error deleting file:', error);
        alert('Failed to delete file. Please try again.');
      }
    }
  };

  const isImageFile = (contentType: string | null): boolean => {
    return contentType?.startsWith('image/') || false;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files?.map((file) => (
        <div key={file.id} className="relative group">
          {isImageFile(file.contentType) ? (
            <Image 
              src={file.sasUrl} 
              alt={file.name} 
              width={200} 
              height={150} 
              layout="responsive"
              objectFit="cover"
              className="rounded"
            />
          ) : (
            <div className="w-full h-[150px] bg-gray-200 flex items-center justify-center rounded">
              <span className="text-gray-500">{file.name}</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button onClick={() => handleView(file.id, file.name, file.contentType)} variant="secondary" size="sm" className="mr-2">
              View
            </Button>
            <Button onClick={() => handleDownload(file.id)} variant="secondary" size="sm" className="mr-2">
              Download
            </Button>
            <Button onClick={() => handleDelete(file.id)} variant="destructive" size="sm">
              Delete
            </Button>
          </div>
        </div>
      ))}
      {viewerFile && (
        <FileViewer
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          fileUrl={viewerFile.url}
          fileName={viewerFile.name}
          contentType={viewerFile.contentType}
        />
      )}
    </div>
  );
}



// // src/components/FileList.tsx
// "use client";
// import React from 'react';
// import { trpc } from '../utils/trpc';
// import { Button } from './ui/button';
// import { FileViewer } from './FileViewer';
// import { useState } from 'react';
// import Image from 'next/image';

// interface FileListProps {
//   teamId: number;
//   projectId?: number;
//   subStageId?: number;
// }

// export function FileList({ teamId, projectId, subStageId }: FileListProps) {
//   const { data: files, isLoading, error, refetch } = trpc.storage.listFiles.useQuery({ teamId, projectId, subStageId });
//   const getViewUrlMutation = trpc.storage.getViewUrl.useMutation();
//   const getDownloadUrlMutation = trpc.storage.getDownloadUrl.useMutation();
//   const deleteFileMutation = trpc.storage.deleteFile.useMutation({
//     onSuccess: () => refetch()
//   });

//   const isImageFile = (contentType: string) => {
//     return contentType.startsWith('image/');
//   };


//   const [viewerOpen, setViewerOpen] = useState(false);
//   const [viewerFile, setViewerFile] = useState<{ url: string; name: string; contentType: string } | null>(null);

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error.message}</div>;

//   const handleView = async (fileId: number, fileName: string, contentType: string) => {
//     try {
//       const result = await getViewUrlMutation.mutateAsync(fileId);
//       if (result.sasUrl) {
//         setViewerFile({ url: result.sasUrl, name: fileName, contentType });
//         setViewerOpen(true);
//       }
//     } catch (error) {
//       console.error('Error viewing file:', error);
//       alert('Failed to view file. Please try again.');
//     }
//   };

//   const handleDownload = async (fileId: number) => {
//     try {
//       const result = await getDownloadUrlMutation.mutateAsync(fileId);
//       if (result.sasUrl) {
//         const link = document.createElement('a');
//         link.href = result.sasUrl;
//         link.download = result.fileName || 'download';
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//       }
//     } catch (error) {
//       console.error('Error downloading file:', error);
//       alert('Failed to download file. Please try again.');
//     }
//   };


//   const handleDelete = async (fileId: number) => {
//     if (window.confirm('Are you sure you want to delete this file?')) {
//       try {
//         await deleteFileMutation.mutateAsync(fileId);
//       } catch (error) {
//         console.error('Error deleting file:', error);
//         alert('Failed to delete file. Please try again.');
//       }
//     }
//   };

//   return (
//     <>
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//         {files?.map((file) => (
//           <div key={file.id} className="relative group">
//             {isImageFile(file.contentType) ? (
//               <Image 
//                 src={file.url} 
//                 alt={file.name} 
//                 width={200} 
//                 height={150} 
//                 unoptimized
//                 className="rounded"
//               />
//             ) : (
//               <div className="w-full h-[150px] bg-gray-200 flex items-center justify-center rounded">
//                 <span className="text-gray-500">{file.name}</span>
//               </div>
//             )}
//             <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
//               <Button onClick={() => handleView(file.id, file.name, file.contentType)} variant="secondary" size="sm" className="mr-2">
//                 View
//               </Button>
//               <Button onClick={() => handleDownload(file.id)} variant="secondary" size="sm" className="mr-2">
//                 Download
//               </Button>
//               <Button onClick={() => handleDelete(file.id)} variant="destructive" size="sm">
//                 Delete
//               </Button>
//             </div>
//           </div>
//         ))}
//       </div>
//       {viewerFile && (
//         <FileViewer
//           isOpen={viewerOpen}
//           onClose={() => setViewerOpen(false)}
//           fileUrl={viewerFile.url}
//           fileName={viewerFile.name}
//           contentType={viewerFile.contentType}
//         />
//       )}
//     </>
//   );
// }