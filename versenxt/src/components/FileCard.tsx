// // components/FileCard.tsx
// import React from 'react';
// import { Card, CardContent } from './ui/card';
// import { Button } from './ui/button';
// import { 
//   MoreVertical, 
//   Download, 
//   Trash2, 
//   Eye,
//   Image as ImageIcon,
//   File,
//   FileText,
//   Video,
//   Music,
//   Table,
//   PresentationIcon
// } from 'lucide-react';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "./ui/dropdown-menu";
// import Image from 'next/image';
// import { formatFileSize, formatDate, getFileTypeIcon } from '../lib/utils';

// interface FileCardProps {
//   id: number;
//   name: string;
//   contentType: string | null;
//   size: number;
//   createdAt: string;
//   thumbnailUrl?: string;
//   onView?: () => void;
//   onDownload?: () => void;
//   onDelete?: () => void;
//   className?: string;
// }

// export function FileCard({
//   id,
//   name,
//   contentType,
//   size,
//   createdAt,
//   thumbnailUrl,
//   onView,
//   onDownload,
//   onDelete,
//   className
// }: FileCardProps) {
//   const isImage = contentType?.startsWith('image/');
//   const fileIcon = getFileTypeIcon(contentType);

//   return (
//     <Card className={`group relative overflow-hidden hover:shadow-md transition-shadow ${className}`}>
//       <CardContent className="p-0">
//         <div className="aspect-square relative bg-gray-100">
//           {isImage && thumbnailUrl ? (
//             <Image
//               src={thumbnailUrl}
//               alt={name}
//               layout="fill"
//               objectFit="cover"
//               className="rounded-t-lg"
//             />
//           ) : (
//             <div className="w-full h-full flex items-center justify-center">
//               {fileIcon === 'image' && <ImageIcon className="h-12 w-12 text-gray-400" />}
//               {fileIcon === 'video' && <Video className="h-12 w-12 text-gray-400" />}
//               {fileIcon === 'audio' && <Music className="h-12 w-12 text-gray-400" />}
//               {fileIcon === 'file-text' && <FileText className="h-12 w-12 text-gray-400" />}
//               {fileIcon === 'table' && <Table className="h-12 w-12 text-gray-400" />}
//               {fileIcon === 'presentation' && <PresentationIcon className="h-12 w-12 text-gray-400" />}
//               {fileIcon === 'file' && <File className="h-12 w-12 text-gray-400" />}
//             </div>
//           )}
//           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
//             {onView && (
//               <Button
//                 variant="secondary"
//                 size="sm"
//                 onClick={onView}
//                 className="hover:scale-105 transition-transform"
//               >
//                 <Eye className="h-4 w-4" />
//               </Button>
//             )}
//             {onDownload && (
//               <Button
//                 variant="secondary"
//                 size="sm"
//                 onClick={onDownload}
//                 className="hover:scale-105 transition-transform"
//               >
//                 <Download className="h-4 w-4" />
//               </Button>
//             )}
//             {onDelete && (
//               <Button
//                 variant="destructive"
//                 size="sm"
//                 onClick={onDelete}
//                 className="hover:scale-105 transition-transform"
//               >
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             )}
//           </div>
//         </div>
//         <div className="p-3">
//           <div className="flex items-start justify-between">
//             <div className="flex-1 min-w-0">
//               <p className="font-medium text-sm truncate" title={name}>
//                 {name}
//               </p>
//               <p className="text-xs text-muted-foreground">
//                 {formatFileSize(size)}
//               </p>
//             </div>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                   <MoreVertical className="h-4 w-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 {onView && (
//                   <DropdownMenuItem onClick={onView}>
//                     <Eye className="h-4 w-4 mr-2" />
//                     View
//                   </DropdownMenuItem>
//                 )}
//                 {onDownload && (
//                   <DropdownMenuItem onClick={onDownload}>
//                     <Download className="h-4 w-4 mr-2" />
//                     Download
//                   </DropdownMenuItem>
//                 )}
//                 {onDelete && (
//                   <DropdownMenuItem
//                     onClick={onDelete}
//                     className="text-red-600 focus:text-red-600"
//                   >
//                     <Trash2 className="h-4 w-4 mr-2" />
//                     Delete
//                   </DropdownMenuItem>
//                 )}
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//           <p className="text-xs text-muted-foreground mt-1">
//             {formatDate(createdAt)}
//           </p>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }