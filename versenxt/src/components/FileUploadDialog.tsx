// components/FilePreUploadDialog.tsx

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem,SelectValue, SelectTrigger } from './ui/select';
import {Textarea} from './ui/textarea';
import { Switch } from './ui/switch';
import { TagInput } from './ui/TagInput';
import { Button } from './ui/button';
import { File } from 'lucide-react';


interface FilePreUploadOptions {
    name: string;
    folder: string;
    tags: string[];
    description?: string;
    isPublic?: boolean;
  }
  
  interface FilePreUploadDialogProps {
    file: File;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (options: FilePreUploadOptions) => void;
    folders: { id: string; name: string; path: string }[];
    defaultFolder?: string;
  }
  
  export function FilePreUploadDialog({
    file,
    isOpen,
    onClose,
    onConfirm,
    folders,
    defaultFolder
  }: FilePreUploadDialogProps) {
    const [name, setName] = useState(file.name);
    const [folder, setFolder] = useState(defaultFolder || '');
    const [tags, setTags] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Options</DialogTitle>
            <DialogDescription>
              Configure options before uploading {file.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>File Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
  
            <div className="space-y-2">
              <Label>Destination Folder</Label>
              <Select value={folder} onValueChange={setFolder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((f) => (
                    <SelectItem key={f.id} value={f.path}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
  
            <div className="space-y-2">
              <Label>Tags</Label>
              <TagInput
                value={tags}
                onChange={setTags}
                placeholder="Add tags..."
              />
            </div>
  
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
              />
            </div>
  
            <div className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="public">Make file public</Label>
            </div>
          </div>
  
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onConfirm({
              name,
              folder,
              tags,
              description,
              isPublic
            })}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }