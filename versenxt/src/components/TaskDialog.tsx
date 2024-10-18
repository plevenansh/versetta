// components/TaskDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { trpc } from '../utils/trpc';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  teamId: number;
  mainStageId?: number;
  subStageId?: number;
}

export function TaskDialog({ isOpen, onClose, projectId, teamId, mainStageId, subStageId }: TaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('PENDING');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [dueDate, setDueDate] = useState('');

  const createTaskMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      onClose();
      // You might want to refetch tasks or update the UI here
    },
  });

  const handleSubmit = () => {
    createTaskMutation.mutate({
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      projectId,
      teamId,
      mainStageId: mainStageId || undefined,
      subStageId: subStageId || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Select value={status} onValueChange={(value: any) => setStatus(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            placeholder="Due Date"
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Create Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}