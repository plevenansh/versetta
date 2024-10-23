
// components/FileUploader.tsx
import { useState, useCallback, useRef } from 'react';
import { trpc } from '../utils/trpc';
import { useDropzone } from 'react-dropzone';
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { 
  Upload, 
  X, 
  File, 
  Image, 
  Video, 
  FileText,
  AlertCircle,
  Folder 
} from 'lucide-react';
import { StorageType } from '@prisma/client';
import { cn } from '../lib/utils';
import { TagInput } from './ui/TagInput';

interface FileUploaderProps {
  teamId: number;
  projectId?: number;
  subStageId?: number;
  folderId?: number;
  type?: StorageType;
  allowedTypes?: string[];
  maxSize?: number;
  multiple?: boolean;
  onUploadComplete: (fileUrl: string) => void;
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
}

interface FilePreUploadOptions {
  name: string;
  folder: string;
  tags: string[];
  description?: string;
  isPublic?: boolean;
}

export function FileUploader({ 
  teamId, 
  projectId, 
  subStageId,
  folderId,
  type = 'TEAM_ASSET',
  allowedTypes = ['image/*', 'video/*', 'application/pdf'],
  maxSize = 100 * 1024 * 1024,
  multiple = true,
  onUploadComplete,
  className
}: FileUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, UploadingFile>>({});
  const [dragActive, setDragActive] = useState(false);
  const [preUploadFile, setPreUploadFile] = useState<File | null>(null);
  const [preUploadOptions, setPreUploadOptions] = useState<FilePreUploadOptions>({
    name: '',
    folder: '',
    tags: [],
    description: '',
    isPublic: false,
  });
  const uploadCountRef = useRef(0);

  const getUploadUrlMutation = trpc.storage.getUploadUrl.useMutation();
  const { data: folders } = trpc.storage.getFolderStructure.useQuery({ 
    teamId,
    parentPath: null 
  });
  const { refetch: refetchFiles } = trpc.storage.listFiles.useQuery({ 
    teamId, 
    projectId, 
    subStageId,
    folderId 
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setPreUploadFile(file);
      setPreUploadOptions({
        name: file.name,
        folder: folderId?.toString() || '',
        tags: [],
        description: '',
        isPublic: false,
      });
    }
  }, [folderId]);

  const handleUpload = async (file: File, options: FilePreUploadOptions) => {
    try {
      setUploadingFiles(prev => ({
        ...prev,
        [file.name]: { file, progress: 0 }
      }));

      const { sasUrl, storageId } = await getUploadUrlMutation.mutateAsync({
        fileName: options.name,
        contentType: file.type,
        teamId,
        projectId,
        subStageId,
        folderId: options.folder ? parseInt(options.folder) : undefined,
        type,
        tags: options.tags,
        metadata: {
          originalName: file.name,
          description: options.description,
          isPublic: options.isPublic,
          size: file.size,
          type: file.type,
        },
      });

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadingFiles(prev => ({
            ...prev,
            [file.name]: { ...prev[file.name], progress }
          }));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 201 || xhr.status === 200) {
          onUploadComplete(sasUrl);
          setUploadingFiles(prev => {
            const updated = { ...prev };
            delete updated[file.name];
            return updated;
          });
          refetchFiles();
        } else {
          setUploadingFiles(prev => ({
            ...prev,
            [file.name]: { ...prev[file.name], error: 'Upload failed' }
          }));
        }
      };

      xhr.onerror = () => {
        setUploadingFiles(prev => ({
          ...prev,
          [file.name]: { ...prev[file.name], error: 'Upload failed' }
        }));
      };

      xhr.open('PUT', sasUrl, true);
      xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);

    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadingFiles(prev => ({
        ...prev,
        [file.name]: { ...prev[file.name], error: 'Failed to get upload URL' }
      }));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: false,
  });

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-6 w-6" />;
    if (fileType.startsWith('video/')) return <Video className="h-6 w-6" />;
    if (fileType === 'application/pdf') return <FileText className="h-6 w-6" />;
    return <File className="h-6 w-6" />;
  };

  return (
    <>
      <div className={className}>
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragActive ? "border-primary bg-primary/10" : "border-gray-200",
            "hover:border-primary hover:bg-primary/5"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-sm font-medium">
              Drag & drop files here, or click to select files
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Maximum file size: {Math.floor(maxSize / (1024 * 1024))}MB
            </p>
            <p className="text-xs text-gray-500">
              Allowed types: {allowedTypes.join(', ')}
            </p>
          </div>
        </div>

        {/* Upload Progress */}
        {Object.entries(uploadingFiles).length > 0 && (
          <div className="mt-4 space-y-4">
            {Object.entries(uploadingFiles).map(([fileName, { file, progress, error }]) => (
              <Card key={fileName} className="p-4">
                <div className="flex items-center space-x-4">
                  {getFileIcon(file.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{fileName}</p>
                      {error ? (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUploadingFiles(prev => {
                              const updated = { ...prev };
                              delete updated[fileName];
                              return updated;
                            });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {error ? (
                      <p className="text-xs text-destructive mt-1">{error}</p>
                    ) : (
                      <Progress value={progress} className="mt-2" />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pre-upload Dialog */}
      <Dialog open={!!preUploadFile} onOpenChange={() => setPreUploadFile(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Options</DialogTitle>
            <DialogDescription>
              Configure options before uploading {preUploadFile?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>File Name</Label>
              <Input
                value={preUploadOptions.name}
                onChange={(e) => setPreUploadOptions(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Destination Folder</Label>
              <Select 
                value={preUploadOptions.folder}
                onValueChange={(value) => setPreUploadOptions(prev => ({
                  ...prev,
                  folder: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  {folders?.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id.toString()}>
                      <div className="flex items-center">
                        <Folder className="h-4 w-4 mr-2" />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <TagInput
                value={preUploadOptions.tags}
                onChange={(tags) => setPreUploadOptions(prev => ({
                  ...prev,
                  tags
                }))}
                placeholder="Add tags..."
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={preUploadOptions.description}
                onChange={(e) => setPreUploadOptions(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Add a description..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={preUploadOptions.isPublic}
                onCheckedChange={(checked) => setPreUploadOptions(prev => ({
                  ...prev,
                  isPublic: checked
                }))}
              />
              <Label htmlFor="public">Make file public</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreUploadFile(null)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (preUploadFile) {
                handleUpload(preUploadFile, preUploadOptions);
                setPreUploadFile(null);
              }
            }}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}





// // components/FileUploader.tsx
// import { useState, useCallback, useRef } from 'react';
// import { trpc } from '../utils/trpc';
// import { useDropzone } from 'react-dropzone';
// import { Progress } from "./ui/progress";
// import { Button } from "./ui/button";
// import { Card } from "./ui/card";
// import {  Upload, X, File, Image, Video, FileText,AlertCircle } from 'lucide-react';
// import { StorageType } from '@prisma/client';
// import { cn } from '../lib/utils';

// interface FileUploaderProps {
//   teamId: number;
//   projectId?: number;
//   subStageId?: number;
//   folderId?: number;
//   type?: StorageType;
//   allowedTypes?: string[];
//   maxSize?: number; // in bytes
//   multiple?: boolean;
//   onUploadComplete: (fileUrl: string) => void;
//   className?: string;
// }

// interface UploadingFile {
//   file: File;
//   progress: number;
//   error?: string;
// }

// export function FileUploader({ 
//   teamId, 
//   projectId, 
//   subStageId,
//   folderId,
//   type = 'TEAM_ASSET',
//   allowedTypes = ['image/*', 'video/*', 'application/pdf'],
//   maxSize = 100 * 1024 * 1024, // 100MB default
//   multiple = true,
//   onUploadComplete,
//   className
// }: FileUploaderProps) {
//   const [uploadingFiles, setUploadingFiles] = useState<Record<string, UploadingFile>>({});
//   const [dragActive, setDragActive] = useState(false);
//   const uploadCountRef = useRef(0);

//   const getUploadUrlMutation = trpc.storage.getUploadUrl.useMutation();
//   const { refetch: refetchFiles } = trpc.storage.listFiles.useQuery({ 
//     teamId, 
//     projectId, 
//     subStageId,
//     folderId 
//   });

//   const onDrop = useCallback(async (acceptedFiles: File[]) => {
//     const newUploadingFiles: Record<string, UploadingFile> = {};
//     acceptedFiles.forEach(file => {
//       newUploadingFiles[file.name] = { file, progress: 0 };
//     });
//     setUploadingFiles(prev => ({ ...prev, ...newUploadingFiles }));

//     for (const file of acceptedFiles) {
//       try {
//         // Get upload URL
//         const { sasUrl, storageId } = await getUploadUrlMutation.mutateAsync({
//           fileName: file.name,
//           contentType: file.type,
//           teamId,
//           projectId,
//           subStageId,
//           folderId,
//           type,
//           tags: [], // Optional: Add tags based on file type or other criteria
//           metadata: {
//             originalName: file.name,
//             size: file.size,
//             type: file.type,
//           },
//         });

//         // Upload file with progress tracking
//         const xhr = new XMLHttpRequest();
//         xhr.upload.onprogress = (event) => {
//           if (event.lengthComputable) {
//             const progress = (event.loaded / event.total) * 100;
//             setUploadingFiles(prev => ({
//               ...prev,
//               [file.name]: { ...prev[file.name], progress }
//             }));
//           }
//         };

//         xhr.onload = () => {
//           if (xhr.status === 201 || xhr.status === 200) {
//             onUploadComplete(sasUrl);
//             setUploadingFiles(prev => {
//               const updated = { ...prev };
//               delete updated[file.name];
//               return updated;
//             });
//             uploadCountRef.current++;
//             if (uploadCountRef.current === acceptedFiles.length) {
//               refetchFiles();
//               uploadCountRef.current = 0;
//             }
//           } else {
//             setUploadingFiles(prev => ({
//               ...prev,
//               [file.name]: { ...prev[file.name], error: 'Upload failed' }
//             }));
//           }
//         };

//         xhr.onerror = () => {
//           setUploadingFiles(prev => ({
//             ...prev,
//             [file.name]: { ...prev[file.name], error: 'Upload failed' }
//           }));
//         };

//         xhr.open('PUT', sasUrl, true);
//         xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
//         xhr.setRequestHeader('Content-Type', file.type);
//         xhr.send(file);

//       } catch (error) {
//         console.error('Error uploading file:', error);
//         setUploadingFiles(prev => ({
//           ...prev,
//           [file.name]: { ...prev[file.name], error: 'Failed to get upload URL' }
//         }));
//       }
//     }
//   }, [teamId, projectId, subStageId, folderId, type, getUploadUrlMutation, onUploadComplete, refetchFiles]);

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: allowedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
//     maxSize,
//     multiple,
//   });

//   const getFileIcon = (fileType: string) => {
//     if (fileType.startsWith('image/')) return <Image className="h-6 w-6" />;
//     if (fileType.startsWith('video/')) return <Video className="h-6 w-6" />;
//     if (fileType === 'application/pdf') return <FileText className="h-6 w-6" />;
//     return <File className="h-6 w-6" />;
//   };

//   return (
//     <div className={className}>
//       <div
//         {...getRootProps()}
//         className={cn(
//           "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
//           isDragActive ? "border-primary bg-primary/10" : "border-gray-200",
//           "hover:border-primary hover:bg-primary/5"
//         )}
//       >
//         <input {...getInputProps()} />
//         <Upload className="mx-auto h-12 w-12 text-gray-400" />
//         <div className="mt-4">
//           <p className="text-sm font-medium">
//             Drag & drop files here, or click to select files
//           </p>
//           <p className="text-xs text-gray-500 mt-1">
//             Maximum file size: {Math.floor(maxSize / (1024 * 1024))}MB
//           </p>
//           <p className="text-xs text-gray-500">
//             Allowed types: {allowedTypes.join(', ')}
//           </p>
//         </div>
//       </div>

//       {/* Upload Progress */}
//       {Object.entries(uploadingFiles).length > 0 && (
//         <div className="mt-4 space-y-4">
//           {Object.entries(uploadingFiles).map(([fileName, { file, progress, error }]) => (
//             <Card key={fileName} className="p-4">
//               <div className="flex items-center space-x-4">
//                 {getFileIcon(file.type)}
//                 <div className="flex-1">
//                   <div className="flex items-center justify-between">
//                     <p className="text-sm font-medium truncate">{fileName}</p>
//                     {error ? (
//                       <AlertCircle className="h-5 w-5 text-destructive" />
//                     ) : (
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => {
//                           setUploadingFiles(prev => {
//                             const updated = { ...prev };
//                             delete updated[fileName];
//                             return updated;
//                           });
//                         }}
//                       >
//                         <X className="h-4 w-4" />
//                       </Button>
//                     )}
//                   </div>
//                   {error ? (
//                     <p className="text-xs text-destructive mt-1">{error}</p>
//                   ) : (
//                     <Progress value={progress} className="mt-2" />
//                   )}
//                 </div>
//               </div>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


// // // src/components/FileUploader.tsx

// // import { useState } from 'react';
// // import { trpc } from '../utils/trpc';

// // interface FileUploaderProps {
// //   teamId: number;
// //   projectId?: number;
// //   subStageId?: number;
// //   onUploadComplete: (fileUrl: string) => void;
// // }

// // export function FileUploader({ teamId, projectId, subStageId, onUploadComplete }: FileUploaderProps) {
// //     const [file, setFile] = useState<File | null>(null);
// //     const [uploading, setUploading] = useState(false);
// //     const getUploadUrlMutation = trpc.storage.getUploadUrl.useMutation();
// //     const { refetch: refetchFiles } = trpc.storage.listFiles.useQuery({ teamId, projectId, subStageId });

// //     const handleUpload = async () => {
// //       if (!file) return;
  
// //       setUploading(true);
// //       try {
// //         const { sasUrl, storageId } = await getUploadUrlMutation.mutateAsync({
// //           fileName: file.name,
// //           contentType: file.type,
// //           teamId,
// //           projectId,
// //           subStageId,
// //         });
  
// //         await fetch(sasUrl, {
// //           method: 'PUT',
// //           headers: {
// //             'x-ms-blob-type': 'BlockBlob',
// //             'Content-Type': file.type,
// //           },
// //           body: file,
// //         });
        
// //         refetchFiles(); // Refetch the file list after successful upload
// //         onUploadComplete(sasUrl); // Pass the sasUrl to onUploadComplete
// //       } catch (error) {
// //         console.error('Error uploading file:', error);
// //       } finally {
// //         setUploading(false);
// //       }
// //     };

// //   return (
// //     <div>
// //       <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
// //       <button onClick={handleUpload} disabled={!file || uploading}>
// //         {uploading ? 'Uploading...' : 'Upload'}
// //       </button>
// //     </div>
// //   );
// // }