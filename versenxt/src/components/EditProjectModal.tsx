// components/EditProjectModal.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, X } from 'lucide-react';


interface SubStage {
  id: number;
  name: string;
  enabled: boolean;
  starred: boolean;
  content: any;
  mainStageId: number;
  projectId: number;
}

interface MainStage {
  id: number;
  name: string;
  projectId: number;
  starred: boolean;
  subStages: SubStage[];
}

interface Project {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  duration: string;
  teamId: number;
  mainStages: MainStage[];
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EditProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedProject: Partial<Project>) => void;
}

export function EditProjectModal({ project, isOpen, onClose, onUpdate }: EditProjectModalProps) {
  const [editedProject, setEditedProject] = useState(project);

  const handleSave = () => {
    const updatedProject: Partial<Project> = {
      title: editedProject.title,
      description: editedProject.description,
      status: editedProject.status,
      startDate: editedProject.startDate,
      endDate: editedProject.endDate,
      duration: editedProject.duration,
      mainStages: editedProject.mainStages,
    };
    onUpdate(updatedProject);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Project: {project.title}</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 p-4">
            <div className="space-y-4">
              <Input
                placeholder="Project Title"
                value={editedProject.title}
                onChange={(e) => setEditedProject({ ...editedProject, title: e.target.value })}
              />
              <Textarea
                placeholder="Project Description"
                value={editedProject.description || ''}
                onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
              />
              <Input
                type="date"
                placeholder="Start Date"
                value={editedProject.startDate ? new Date(editedProject.startDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setEditedProject({ ...editedProject, startDate: e.target.value })}
              />
              <Input
                type="date"
                placeholder="End Date"
                value={editedProject.endDate ? new Date(editedProject.endDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setEditedProject({ ...editedProject, endDate: e.target.value })}
              />
              <Input
                placeholder="Duration"
                value={editedProject.duration}
                onChange={(e) => setEditedProject({ ...editedProject, duration: e.target.value })}
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Main Stages</h3>
              {editedProject.mainStages.map((stage, index) => (
                <div key={stage.id} className="border p-2 rounded">
                  <Input
                    placeholder="Main Stage Name"
                    value={stage.name}
                    onChange={(e) => {
                      const updatedStages = [...editedProject.mainStages];
                      updatedStages[index].name = e.target.value;
                      setEditedProject({ ...editedProject, mainStages: updatedStages });
                    }}
                  />
                  <h4 className="mt-2">Sub Stages</h4>
                  {stage.subStages.map((subStage, subIndex) => (
                    <div key={subStage.id} className="flex items-center space-x-2 mt-1">
                      <Input
                        placeholder="Sub Stage Name"
                        value={subStage.name}
                        onChange={(e) => {
                          const updatedStages = [...editedProject.mainStages];
                          updatedStages[index].subStages[subIndex].name = e.target.value;
                          setEditedProject({ ...editedProject, mainStages: updatedStages });
                        }}
                      />
                      <Select
                        value={subStage.enabled ? 'enabled' : 'disabled'}
                        onValueChange={(value) => {
                          const updatedStages = [...editedProject.mainStages];
                          updatedStages[index].subStages[subIndex].enabled = value === 'enabled';
                          setEditedProject({ ...editedProject, mainStages: updatedStages });
                        }}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enabled">Enabled</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const updatedStages = [...editedProject.mainStages];
                          updatedStages[index].subStages = updatedStages[index].subStages.filter(s => s.id !== subStage.id);
                          setEditedProject({ ...editedProject, mainStages: updatedStages });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const updatedStages = [...editedProject.mainStages];
                      updatedStages[index].subStages.push({
                        id: Date.now(),
                        name: '',
                        enabled: true,
                        starred: false,
                        content: null,
                        mainStageId: stage.id,
                        projectId: project.id
                      });
                      setEditedProject({ ...editedProject, mainStages: updatedStages });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Sub Stage
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const updatedStages = [...editedProject.mainStages];
                  updatedStages.push({
                    id: Date.now(),
                    name: '',
                    projectId: project.id,
                    starred: false,
                    subStages: []
                  });
                  setEditedProject({ ...editedProject, mainStages: updatedStages });
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Main Stage
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}