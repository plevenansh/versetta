// src/components/FileList.tsx
"use client";
import React from 'react';
import { trpc } from '../utils/trpc';
import { Button } from './ui/button';
import { FileViewer } from './FileViewer';
import { useState } from 'react';

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

  const handleView = async (fileId: number, fileName: string, contentType: string) => {
    try {
      const result = await getViewUrlMutation.mutateAsync(fileId);
      if (result.sasUrl) {
        setViewerFile({ url: result.sasUrl, name: fileName, contentType });
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
        const link = document.createElement('a');
        link.href = result.sasUrl;
        link.download = result.fileName || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

  return (
    <>
    <ul className="space-y-2">
      {files?.map((file) => (
        <li key={file.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
          <span>{file.name} ({file.size} bytes)</span>
          <div className="space-x-2">
            <Button onClick={() => handleView(file.id, file.name, file.contentType || '')} variant="outline" size="sm">
              View
            </Button>
            <Button onClick={() => handleDownload(file.id)} variant="outline" size="sm">
              Download
            </Button>
            <Button onClick={() => handleDelete(file.id)} variant="destructive" size="sm">
              Delete
            </Button>
          </div>
        </li>
      ))}
    </ul>
    {viewerFile && (
      <FileViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        fileUrl={viewerFile.url}
        fileName={viewerFile.name}
        contentType={viewerFile.contentType}
      />
    )}
  </>
  );
}