// src/components/FileUploader.tsx

import { useState } from 'react';
import { trpc } from '../utils/trpc';

interface FileUploaderProps {
  teamId: number;
  projectId?: number;
  subStageId?: number;
  onUploadComplete: (fileUrl: string) => void;
}

export function FileUploader({ teamId, projectId, subStageId, onUploadComplete }: FileUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const getUploadUrlMutation = trpc.storage.getUploadUrl.useMutation();
    const { refetch: refetchFiles } = trpc.storage.listFiles.useQuery({ teamId, projectId, subStageId });

    const handleUpload = async () => {
      if (!file) return;
  
      setUploading(true);
      try {
        const { sasUrl, storageId } = await getUploadUrlMutation.mutateAsync({
          fileName: file.name,
          contentType: file.type,
          teamId,
          projectId,
          subStageId,
        });
  
        await fetch(sasUrl, {
          method: 'PUT',
          headers: {
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type': file.type,
          },
          body: file,
        });
        
        refetchFiles(); // Refetch the file list after successful upload
        onUploadComplete(sasUrl); // Pass the sasUrl to onUploadComplete
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setUploading(false);
      }
    };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}