




// // components/FileList.tsx
// import React, { useState, useMemo } from 'react';
// import { trpc } from '../utils/trpc';
// import { Button } from './ui/button';
// import { Input } from './ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
// import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "./ui/table";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "./ui/dropdown-menu";
// import {Eye, Download, Trash2, MoreVertical, Image as ImageIcon, FileText, Video, File, Grid, List,SortAsc,SortDesc,} from 'lucide-react';
// import { FileViewer } from './FileViewer';
// import { Card, CardContent } from './ui/card';
// import { Badge } from './ui/badge';
// import { Skeleton } from './ui/skeleton';
// import Image from 'next/image';
// import { formatFileSize, formatDate } from '../lib/utils';

// interface StorageFile {
//   id: number;
//   name: string;
//   contentType: string | null;
//   size: number | null;
//   sasUrl: string;
//   type: StorageType;
//   createdAt: string;
//   creator: {
//     user: {
//       name: string;
//     };
//   };
// }



// // Update StorageType enum to match your schema
// enum StorageType {
//   TEAM_ASSET = 'TEAM_ASSET',
//   PROJECT_ASSET = 'PROJECT_ASSET',
//   STOCK_FOOTAGE = 'STOCK_FOOTAGE',
//   FINISHED_VIDEO = 'FINISHED_VIDEO',
//   THUMBNAIL = 'THUMBNAIL',
//   OTHER = 'OTHER'
// }

// interface FileListProps {
//   teamId: number;
//   projectId?: number;
//   subStageId?: number;
//   view?: 'grid' | 'list';
//   onFileSelect?: (fileId: number) => void;
//   className?: string;
// }

// interface FileType {
//   id: number;
//   name: string;
//   contentType: string | null;
//   size: number | null;
//   createdAt: string;
//   sasUrl: string;
//   type: string;
//   creator: {
//     user: {
//       name: string;
//     };
//   };
// }

// export function FileList({ 
//   teamId, 
//   projectId, 
//   subStageId, 
//   view: initialView = 'grid',
//   onFileSelect,
//   className 
// }: FileListProps) {
//   const [view, setView] = useState<'grid' | 'list'>(initialView);
//   const [search, setSearch] = useState('');
//   const [sortBy, setSortBy] = useState<string>('createdAt');
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
//   const [fileType, setFileType] = useState<string>('all');
//   const [viewerOpen, setViewerOpen] = useState(false);
//   const [viewerFile, setViewerFile] = useState<{ url: string; name: string; contentType: string } | null>(null);

  
//   const { data, isLoading, error, refetch } = trpc.storage.listFiles.useQuery({
//     teamId,
//     projectId,
//     subStageId,
//     search,
//     sortBy: sortBy as any,
//     sortOrder,
//     });

//   const getViewUrlMutation = trpc.storage.getViewUrl.useMutation();
//   const getDownloadUrlMutation = trpc.storage.getDownloadUrl.useMutation();
//   const deleteFileMutation = trpc.storage.deleteFile.useMutation({
//     onSuccess: () => refetch()
//   });

//   const filteredFiles = useMemo(() => {
//     if (!data?.files) return [];
//     return data.files.filter(file => 
//       file.name.toLowerCase().includes(search.toLowerCase())
//     );
//   }, [data, search]);


//   const handleView = async (fileId: number, fileName: string, contentType: string | null) => {
//     try {
//       const result = await getViewUrlMutation.mutateAsync(fileId);
//       if (result.sasUrl) {
//         setViewerFile({ 
//           url: result.sasUrl, 
//           name: fileName, 
//           contentType: contentType || 'application/octet-stream' 
//         });
//         setViewerOpen(true);
//       }
//     } catch (error) {
//       console.error('Error viewing file:', error);
//     }
//   };

//   const handleDownload = async (fileId: number) => {
//     try {
//       const result = await getDownloadUrlMutation.mutateAsync({
//         fileId,
//         disposition: 'attachment'
//       });
//       if (result.sasUrl) {
//         window.open(result.sasUrl, '_blank');
//       }
//     } catch (error) {
//       console.error('Error downloading file:', error);
//     }
//   };

//   const handleDelete = async (fileId: number) => {
//     if (window.confirm('Are you sure you want to delete this file?')) {
//       try {
//         await deleteFileMutation.mutateAsync(fileId);
//       } catch (error) {
//         console.error('Error deleting file:', error);
//       }
//     }
//   };

//   const getFileIcon = (contentType: string | null) => {
//     if (!contentType) return <File className="h-6 w-6" />;
//     if (contentType.startsWith('image/')) return <ImageIcon className="h-6 w-6" />;
//     if (contentType.startsWith('video/')) return <Video className="h-6 w-6" />;
//     if (contentType === 'application/pdf') return <FileText className="h-6 w-6" />;
//     return <File className="h-6 w-6" />;
//   };

//   if (error) return <div className="text-red-500">Error: {error.message}</div>;

//   const renderGridView = () => (
//     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//       {isLoading ? (
//         Array.from({ length: 8 }).map((_, i) => (
//           <Skeleton key={i} className="h-[200px] rounded-lg" />
//         ))
//       ) : (
//         filteredFiles.map((file) => (
//           <Card key={file.id} className="group relative overflow-hidden">
//             <CardContent className="p-0">
//               {file.contentType?.startsWith('image/') ? (
//                 <div className="aspect-square relative">
//                   <Image
//                     src={file.sasUrl}
//                     alt={file.name}
//                     layout="fill"
//                     objectFit="cover"
//                     className="rounded-t-lg"
//                   />
//                 </div>
//               ) : (
//                 <div className="aspect-square bg-gray-100 flex items-center justify-center">
//                   {getFileIcon(file.contentType)}
//                 </div>
//               )}
//               <div className="p-3">
//                 <p className="font-medium truncate">{file.name}</p>
//                 <p className="text-sm text-gray-500">{formatFileSize(file.size || 0)}</p>
//               </div>
//               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
//                 <Button
//                   variant="secondary"
//                   size="sm"
//                   onClick={() => handleView(file.id, file.name, file.contentType)}
//                 >
//                   <Eye className="h-4 w-4" />
//                 </Button>
//                 <Button
//                   variant="secondary"
//                   size="sm"
//                   onClick={() => handleDownload(file.id)}
//                 >
//                   <Download className="h-4 w-4" />
//                 </Button>
//                 <Button
//                   variant="destructive"
//                   size="sm"
//                   onClick={() => handleDelete(file.id)}
//                 >
//                   <Trash2 className="h-4 w-4" />
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         ))
//       )}
//     </div>
//   );

//   const renderListView = () => (
//     <Table>
//       <TableHeader>
//         <TableRow>
//           <TableHead>Name</TableHead>
//           <TableHead>Type</TableHead>
//           <TableHead>Size</TableHead>
//           <TableHead>Created</TableHead>
//           <TableHead>Created By</TableHead>
//           <TableHead className="text-right">Actions</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {isLoading ? (
//           Array.from({ length: 5 }).map((_, i) => (
//             <TableRow key={i}>
//               <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
//               <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
//               <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
//               <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
//               <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
//               <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
//             </TableRow>
//           ))
//         ) : (
//           filteredFiles.map((file) => (
//             <TableRow key={file.id}>
//               <TableCell className="font-medium">
//                 <div className="flex items-center space-x-2">
//                   {getFileIcon(file.contentType)}
//                   <span>{file.name}</span>
//                 </div>
//               </TableCell>
//               <TableCell>{file.type}</TableCell>
//               <TableCell>{formatFileSize(file.size || 0)}</TableCell>
//               <TableCell>{formatDate(file.createdAt)}</TableCell>
//               <TableCell>{file.creator.user.name}</TableCell>
//               <TableCell className="text-right">
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button variant="ghost" size="sm">
//                       <MoreVertical className="h-4 w-4" />
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end">
//                     <DropdownMenuItem onClick={() => handleView(file.id, file.name, file.contentType)}>
//                       <Eye className="h-4 w-4 mr-2" /> View
//                     </DropdownMenuItem>
//                     <DropdownMenuItem onClick={() => handleDownload(file.id)}>
//                       <Download className="h-4 w-4 mr-2" /> Download
//                     </DropdownMenuItem>
//                     <DropdownMenuItem 
//                       onClick={() => handleDelete(file.id)}
//                       className="text-red-600"
//                     >
//                       <Trash2 className="h-4 w-4 mr-2" /> Delete
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </TableCell>
//             </TableRow>
//           ))
//         )}
//       </TableBody>
//     </Table>
//   );

//   return (
//     <div className={className}>
//       <div className="mb-4 flex items-center justify-between gap-4">
//         <div className="flex-1">
//           <Input
//             placeholder="Search files..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>
//         <Select value={fileType} onValueChange={setFileType}>
//           <SelectTrigger className="w-[150px]">
//             <SelectValue placeholder="File type" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Types</SelectItem>
//             <SelectItem value="THUMBNAIL">Thumbnails</SelectItem>
//             <SelectItem value="RAW_FOOTAGE">Raw Footage</SelectItem>
//             <SelectItem value="FINISHED_VIDEO">Finished Videos</SelectItem>
//             <SelectItem value="PROJECT_ASSET">Project Assets</SelectItem>
//           </SelectContent>
//         </Select>
//         <div className="flex items-center space-x-2">
//           <Button
//             variant="outline"
//             size="icon"
//             onClick={() => setView('grid')}
//             className={view === 'grid' ? 'bg-primary text-primary-foreground' : ''}
//           >
//             <Grid className="h-4 w-4" />
//           </Button>
//           <Button
//             variant="outline"
//             size="icon"
//             onClick={() => setView('list')}
//             className={view === 'list' ? 'bg-primary text-primary-foreground' : ''}
//           >
//             <List className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>

//       {view === 'grid' ? renderGridView() : renderListView()}

//       {viewerFile && (
//         <FileViewer
//           isOpen={viewerOpen}
//           onClose={() => setViewerOpen(false)}
//           fileUrl={viewerFile.url}
//           fileName={viewerFile.name}
//           contentType={viewerFile.contentType}
//         />
//       )}
//     </div>
//   );
// }
