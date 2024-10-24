// // components/FileActions.tsx
// import React from 'react';
// import { Button } from './ui/button';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
//   DropdownMenuSub,
//   DropdownMenuSubContent,
//   DropdownMenuSubTrigger,
// } from "./ui/dropdown-menu";
// import {
//   MoreHorizontal,
//   Download,
//   Trash2,
//   FolderInput,
//   Copy,
//   Link,
//   Eye,
//   Edit,
//   Share2
// } from 'lucide-react';

// interface FileActionsProps {
//   onView?: () => void;
//   onDownload?: () => void;
//   onDelete?: () => void;
//   onMove?: () => void;
//   onCopy?: () => void;
//   onRename?: () => void;
//   onShare?: () => void;
//   folders?: { id: number; name: string; path: string }[];
//   disabled?: boolean;
//   className?: string;
// }

// export function FileActions({
//   onView,
//   onDownload,
//   onDelete,
//   onMove,
//   onCopy,
//   onRename,
//   onShare,
//   folders = [],
//   disabled = false,
//   className
// }: FileActionsProps) {
//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant="ghost"
//           size="sm"
//           disabled={disabled}
//           className={className}
//         >
//           <MoreHorizontal className="h-4 w-4" />
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end" className="w-48">
//         {onView && (
//           <DropdownMenuItem onClick={onView}>
//             <Eye className="h-4 w-4 mr-2" />
//             View
//           </DropdownMenuItem>
//         )}
//         {onDownload && (
//           <DropdownMenuItem onClick={onDownload}>
//             <Download className="h-4 w-4 mr-2" />
//             Download
//           </DropdownMenuItem>
//         )}
//         {onRename && (
//           <DropdownMenuItem onClick={onRename}>
//             <Edit className="h-4 w-4 mr-2" />
//             Rename
//           </DropdownMenuItem>
//         )}
//         {onMove && folders.length > 0 && (
//           <DropdownMenuSub>
//             <DropdownMenuSubTrigger>
//               <FolderInput className="h-4 w-4 mr-2" />
//               Move to
//             </DropdownMenuSubTrigger>
//             <DropdownMenuSubContent>
//               {folders.map(folder => (
//                 <DropdownMenuItem
//                   key={folder.id}
//                   onClick={() => onMove(folder.id)}
//                 >
//                   {folder.name}
//                 </DropdownMenuItem>
//               ))}
//             </DropdownMenuSubContent>
//           </DropdownMenuSub>
//         )}
//         {onCopy && (
//           <DropdownMenuItem onClick={onCopy}>
//             <Copy className="h-4 w-4 mr-2" />
//             Make a copy
//           </DropdownMenuItem>
//         )}
//         {onShare && (
//           <>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem onClick={onShare}>
//               <Share2 className="h-4 w-4 mr-2" />
//               Share
//             </DropdownMenuItem>
//             <DropdownMenuItem onClick={() => navigator.clipboard.writeText(window.location.href)}>
//               <Link className="h-4 w-4 mr-2" />
//               Copy link
//             </DropdownMenuItem>
//           </>
//         )}
//         {onDelete && (
//           <>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem
//               onClick={onDelete}
//               className="text-red-600 focus:text-red-600"
//             >
//               <Trash2 className="h-4 w-4 mr-2" />
//               Delete
//             </DropdownMenuItem>
//           </>
//         )}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }