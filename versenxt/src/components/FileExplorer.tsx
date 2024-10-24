// // components/FileExplorer.tsx
// import React, { useState, useMemo } from 'react';
// import { trpc } from '../utils/trpc';
// import { FileList } from './FileList';
// import { Button } from './ui/button';
// import { Input } from './ui/input';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
// import { ScrollArea } from './ui/scroll-area';
// import { Separator } from './ui/separator';
// import { Badge } from './ui/badge';
// import {
//   Folder,
//   ChevronRight,
//   ChevronDown,
//   Plus,
//   FolderPlus,
//   Settings,
//   Search,
//   Filter,
// } from 'lucide-react';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "./ui/dropdown-menu";
// import { cn } from '../lib/utils';

// interface FileExplorerProps {
//   teamId: number;
//   initialPath?: string;
//   className?: string;
// }

// interface FolderNode {
//   id: number;
//   name: string;
//   path: string;
//   parentPath: string | null;
//   children: FolderNode[];
//   files: any[];
// }

// export function FileExplorer({ teamId, initialPath, className }: FileExplorerProps) {
//   const [currentPath, setCurrentPath] = useState(initialPath || '');
//   const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([currentPath]));
//   const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
//   const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
//   const [newFolderName, setNewFolderName] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterType, setFilterType] = useState<string | null>(null);

//   // Queries
//   const { data: folderStructure, refetch: refetchFolders } = trpc.storage.getFolderStructure.useQuery({
//     teamId,
//     parentPath: currentPath,
//   });

//   const createFolderMutation = trpc.storage.createFolder.useMutation({
//     onSuccess: () => {
//       refetchFolders();
//       setIsCreateFolderOpen(false);
//       setNewFolderName('');
//     }
//   });

//   // Build folder tree
//   const folderTree = useMemo(() => {
//     if (!folderStructure) return [];

//     const buildTree = (folders: any[], parentPath: string | null = null): FolderNode[] => {
//       return folders
//         .filter(folder => folder.parentPath === parentPath)
//         .map(folder => ({
//           id: folder.id,
//           name: folder.name,
//           path: folder.path,
//           parentPath: folder.parentPath,
//           children: buildTree(folders, folder.path),
//           files: folder.files,
//         }));
//     };

//     return buildTree(folderStructure);
//   }, [folderStructure]);

//   // Handlers
//   const handleCreateFolder = async () => {
//     if (!newFolderName.trim()) return;

//     try {
//       await createFolderMutation.mutateAsync({
//         name: newFolderName,
//         teamId,
//         parentPath: selectedFolder || undefined,
//       });
//     } catch (error) {
//       console.error('Error creating folder:', error);
//     }
//   };

//   const toggleFolder = (path: string) => {
//     setExpandedFolders(prev => {
//       const next = new Set(prev);
//       if (next.has(path)) {
//         next.delete(path);
//       } else {
//         next.add(path);
//       }
//       return next;
//     });
//   };

//   const handleFolderSelect = (path: string) => {
//     setSelectedFolder(path);
//     setCurrentPath(path);
//   };

//   const renderFolderTree = (nodes: FolderNode[], depth = 0) => {
//     return nodes.map(node => {
//       const isExpanded = expandedFolders.has(node.path);
//       const isSelected = selectedFolder === node.path;
//       const hasChildren = node.children.length > 0;

//       if (searchTerm && !node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
//         return null;
//       }

//       return (
//         <div key={node.id}>
//           <div
//             className={cn(
//               "flex items-center space-x-2 py-1 px-2 rounded-lg cursor-pointer",
//               isSelected ? "bg-primary/10" : "hover:bg-primary/5",
//               depth > 0 && "ml-4"
//             )}
//             onClick={() => handleFolderSelect(node.path)}
//           >
//             <Button
//               variant="ghost"
//               size="sm"
//               className="p-0 w-6 h-6"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 toggleFolder(node.path);
//               }}
//             >
//               {hasChildren && (isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
//             </Button>
//             <Folder className="h-4 w-4" />
//             <span className="flex-1">{node.name}</span>
//             <Badge variant="secondary" className="text-xs">
//               {node.files.length}
//             </Badge>
//           </div>
//           {isExpanded && hasChildren && (
//             <div className="pl-4">
//               {renderFolderTree(node.children, depth + 1)}
//             </div>
//           )}
//         </div>
//       );
//     });
//   };

//   const breadcrumbs = currentPath.split('/').filter(Boolean);

//   return (
//     <div className={cn("flex h-full", className)}>
//       {/* Sidebar */}
//       <div className="w-64 border-r p-4 flex flex-col">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="font-semibold">Files</h3>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="sm">
//                 <Settings className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuItem onClick={() => setIsCreateFolderOpen(true)}>
//                 <FolderPlus className="h-4 w-4 mr-2" />
//                 New Folder
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>

//         <div className="space-y-2 mb-4">
//           <Input
//             placeholder="Search folders..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full"
//             leftIcon={<Search className="h-4 w-4" />}
//           />
//         </div>

//         <ScrollArea className="flex-1">
//           {renderFolderTree(folderTree)}
//         </ScrollArea>
//       </div>

//       {/* Main content */}
//       <div className="flex-1 p-4">
//         {/* Breadcrumb navigation */}
//         <div className="flex items-center space-x-2 mb-4">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => {
//               setCurrentPath('');
//               setSelectedFolder(null);
//             }}
//           >
//             <Folder className="h-4 w-4 mr-2" />
//             Root
//           </Button>
//           {breadcrumbs.map((crumb, index) => (
//             <React.Fragment key={index}>
//               <ChevronRight className="h-4 w-4 text-muted-foreground" />
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => {
//                   const newPath = breadcrumbs.slice(0, index + 1).join('/');
//                   setCurrentPath(newPath);
//                   setSelectedFolder(newPath);
//                 }}
//               >
//                 {crumb}
//               </Button>
//             </React.Fragment>
//           ))}
//         </div>

//         {/* File list */}
//         <FileList
//           teamId={teamId}
//           folderId={selectedFolder ? parseInt(selectedFolder) : undefined}
//         />
//       </div>

//       {/* Create folder dialog */}
//       <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Create New Folder</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4 py-4">
//             <Input
//               placeholder="Folder name"
//               value={newFolderName}
//               onChange={(e) => setNewFolderName(e.target.value)}
//             />
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleCreateFolder}>
//               Create
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }