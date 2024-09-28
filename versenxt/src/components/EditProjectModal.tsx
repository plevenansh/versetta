// src/components/EditProjectModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { trpc } from '../trpc/client';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { X, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "@/hooks/use-toast"


interface EditProjectModalProps {
  project: {
    id: number;
    title: string;
    description: string | null;
    status: 'active' | 'completed';
    startDate: string | null;
    endDate: string | null;
    teamId: number;
    stages: { id: number; stage: string; completed: boolean; order?: number }[];
  };
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function EditProjectModal({ project, isOpen, onClose, onUpdate }: EditProjectModalProps) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description || '');
  const [status, setStatus] = useState(project.status);
  const [startDate, setStartDate] = useState(project.startDate || '');
  const [endDate, setEndDate] = useState(project.endDate || '');
  const [teamId, setTeamId] = useState(project.teamId);
  const [stages, setStages] = useState(project.stages);
  const [newStage, setNewStage] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  const updateProjectMutation = trpc.projects.update.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProjectMutation.mutateAsync({
        id: project.id,
        title,
        description,
        status,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        teamId,
        stages: stages.map((s, index) => ({
          id: s.id,
          stage: s.stage,
          completed: s.completed,
          order: s.order !== undefined ? s.order : index
        }))
      });
      onUpdate();
      onClose();
      toast({
        title: "Project updated",
        description: "Your project has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextIndex = index + 1;
      if (nextIndex < inputRefs.current.length) {
        inputRefs.current[nextIndex]?.focus();
      } else {
        handleSubmit(e);
      }
    } else if (e.ctrlKey && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleAddStage = () => {
    if (newStage.trim()) {
      setStages([...stages, {
        id: Date.now(),
        stage: newStage.trim(),
        completed: false,
        order: stages.length
      }]);
      setNewStage('');
    }
  };

  const handleRemoveStage = (stageId: number) => {
    setStages(stages.filter(s => s.id !== stageId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project Title"
            required
            onKeyDown={(e) => handleKeyDown(e, 0)}
            ref={(el) => { inputRefs.current[0] = el; }}
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            onKeyDown={(e) => handleKeyDown(e, 1)}
            ref={(el) => {inputRefs.current[1] = el;}}
          />
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Start Date"
            onKeyDown={(e) => handleKeyDown(e, 2)}
            ref={(el) => {inputRefs.current[2] = el;}}
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End Date"
            onKeyDown={(e) => handleKeyDown(e, 3)}
            ref={(el) => {inputRefs.current[3] = el;}}
          />
          <div>
            <h3 className="text-sm font-medium mb-2">Stages:</h3>
            <div className="space-y-2">
              {stages.map((stage) => (
                <div key={stage.id} className="flex items-center space-x-2">
                  <span>{stage.stage}</span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRemoveStage(stage.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Input
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                placeholder="New Stage"
              />
              <Button type="button" onClick={handleAddStage}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button type="submit" disabled={updateProjectMutation.isPending}>
            {updateProjectMutation.isPending ? 'Updating...' : 'Update Project'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}