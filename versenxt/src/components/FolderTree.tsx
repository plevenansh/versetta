// // components/FolderTree.tsx
// import React from 'react';
// import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, MoreVertical } from 'lucide-react';
// import { Button } from './ui/button';
// import { ScrollArea } from './ui/scroll-area';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "./ui/dropdown-menu";
// import { cn } from '../lib/utils';

// interface FolderNode {
//   id: number;
//   name: string;
//   path: string;
//   parentPath: string | null;
//   children: FolderNode[];
//   fileCount: number;
// }

// interface FolderTreeProps {
//   folders: FolderNode[];
//   selectedPath: string | null;
//   expandedPaths: Set<string>;
//   onSelect: (path: string) => void;
//   onToggle: (path: string) => void;
//   onCreateFolder: (parentPath: string | null) => void;
//   onRenameFolder: (folderId: number) => void;
//   onDeleteFolder: (folderId: number) => void;
//   className?: string;
// }

// export function FolderTree({
//   folders,
//   selectedPath,
//   expandedPaths,
//   onSelect,
//   onToggle,
//   onCreateFolder,
//   onRenameFolder,
//   onDeleteFolder,
//   className
// }: FolderTreeProps) {
//   const renderFolder = (folder: FolderNode, depth: number = 0) => {
//     const isExpanded = expandedPaths.has(folder.path);
//     const isSelected = selectedPath === folder.path;
//     const hasChildren = folder.children.length > 0;

//     return (
//       <div key={folder.id}>
//         <div
//           className={cn(
//             "flex items-center py-1 px-2 rounded-lg cursor-pointer",
//             isSelected ? "bg-primary/10" : "hover:bg-primary/5",
//             depth > 0 && "ml-4"
//           )}
//           onClick={() => onSelect(folder.path)}
//         >
//           <Button
//             variant="ghost"
//             size="sm"
//             className="p-0 w-6 h-6"
//             onClick={(e) => {
//               e.stopPropagation();
//               onToggle(folder.path);
//             }}
//           >
//             {hasChildren && (
//               isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
//             )}
//           </Button>
//           {isExpanded ? (
//             <FolderOpen className="h-4 w-4 mx-1 text-blue-500" />
//           ) : (
//             <Folder className="h-4 w-4 mx-1 text-blue-500" />
//           )}
//           <span className="flex-1 truncate">{folder.name}</span>
//           <span className="text-xs text-muted-foreground mr-2">
//             {folder.fileCount} {folder.fileCount === 1 ? 'file' : 'files'}
//           </span>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <MoreVertical className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuItem onClick={() => onCreateFolder(folder.path)}>
//                 <Plus className="h-4 w-4 mr-2" />
//                 New Subfolder
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => onRenameFolder(folder.id)}>
//                 Rename
//               </DropdownMenuItem>
//               <DropdownMenuItem
//                 className="text-red-600"
//                 onClick={() => onDeleteFolder(folder.id)}
//               >
//                 Delete
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//         {isExpanded && hasChildren && (
//           <div className="pl-4">
//             {folder.children.map(child => renderFolder(child, depth + 1))}
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <ScrollArea className={className}>
//       <div className="p-2">
//         <Button
//           variant="outline"
//           size="sm"
//           className="w-full mb-2"
//           onClick={() => onCreateFolder(null)}
//         >
//           <Plus className="h-4 w-4 mr-2" />
//           New Root Folder
//         </Button>
//         {folders.map(folder => renderFolder(folder))}
//       </div>
//     </ScrollArea>
//   );
// }