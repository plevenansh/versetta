import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";
import { Plus, X, Star, Save } from 'lucide-react';
import { trpc } from '../../utils/trpc';
import { Badge } from "../ui/badge";
import { TaskDialog } from '../TaskDialog';

interface SubStage {
  id: number;
  name: string;
  enabled: boolean;
  starred: boolean;
  content?: {
    filmingSchedule?: Array<{ scene: string; time: string; location: string; other: string }>;
    bRollIdeas?: Array<{ idea: string }>;
    shotList?: Array<{ description: string; completed: boolean }>;
    notes?: string;
  };
}

interface MainStage {
  id: number;
  name: string;
  starred: boolean;
  subStages: SubStage[];
}

interface Project {
  id: number;
  title: string;
 // mainStages: MainStage[];
  teamId: number;
}

interface ProductionProps {
  project: Project;
  mainStage: MainStage;
}

export default function Production({ project, mainStage }: ProductionProps) {
  const [localSubStages, setLocalSubStages] = useState(mainStage.subStages);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedStageForTask, setSelectedStageForTask] = useState<{ mainStageId?: number, subStageId?: number } | null>(null);
  const utils = trpc.useUtils();

  const updateSubStageMutation = trpc.projectPage.updateSubStage.useMutation({
    onSuccess: () => utils.projectPage.getProjectDetails.invalidate(project.id)
  });

  useEffect(() => {
    setLocalSubStages(mainStage.subStages);
  }, [mainStage.subStages]);

  const handleUpdateSubStage = async (subStage: SubStage, updates: Partial<SubStage>) => {
    const updatedSubStage = { ...subStage, ...updates };
    setLocalSubStages(prevStages => 
      prevStages.map(stage => stage.id === subStage.id ? updatedSubStage : stage)
    );
  
    try {
      await updateSubStageMutation.mutateAsync({
        id: subStage.id,
        name: updates.name,
        enabled: updates.enabled,
        starred: updates.starred,
        content: updates.content,
      });
    } catch (error) {
      console.error('Error updating sub-stage:', error);
      setLocalSubStages(prevStages => 
        prevStages.map(stage => stage.id === subStage.id ? subStage : stage)
      );
    }
  };

  const handleAddTask = (mainStageId?: number, subStageId?: number) => {
    setSelectedStageForTask({ mainStageId, subStageId });
    setIsTaskDialogOpen(true);
  };

  const renderSubStageHeader = (subStage: SubStage) => (
    <div className="flex justify-between items-center">
      <CardTitle>{subStage.name}</CardTitle>
      <div className="flex items-center space-x-2">
        <Switch
          checked={subStage.enabled}
          onCheckedChange={(enabled) => handleUpdateSubStage(subStage, { enabled })}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleUpdateSubStage(subStage, { starred: !subStage.starred })}
        >
          <Star className={`h-4 w-4 ${subStage.starred ? 'fill-yellow-400' : ''}`} />
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleAddTask(mainStage.id, subStage.id)}>
          <Plus className="h-4 w-4 mr-2" /> Add Task
        </Button>
      </div>
    </div>
  );

  const renderSubStage = (subStage: SubStage) => {
    switch (subStage.name.toLowerCase()) {
      case 'filming schedule':
        return (
          <Card key={subStage.id} className="mb-6">
            <CardHeader>{renderSubStageHeader(subStage)}</CardHeader>
            <CardContent>
              <FilmingScheduleComponent subStage={subStage} onUpdate={handleUpdateSubStage} />
            </CardContent>
          </Card>
        );
      case 'b-roll ideas':
      case 'b roll ideas':
      case 'broll ideas':
        return (
          <Card key={subStage.id}>
            <CardHeader>{renderSubStageHeader(subStage)}</CardHeader>
            <CardContent>
              <BRollComponent subStage={subStage} onUpdate={handleUpdateSubStage} />
            </CardContent>
          </Card>
        );
      case 'shot list':
        return (
          <Card key={subStage.id}>
            <CardHeader>{renderSubStageHeader(subStage)}</CardHeader>
            <CardContent>
              <ShotListComponent subStage={subStage} onUpdate={handleUpdateSubStage} />
            </CardContent>
          </Card>
        );
      case 'production notes':
        return (
          <Card key={subStage.id} className="mb-6">
            <CardHeader>{renderSubStageHeader(subStage)}</CardHeader>
            <CardContent>
              <ProductionNotesComponent subStage={subStage} onUpdate={handleUpdateSubStage} />
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  const filmingSchedule = localSubStages.find(s => s.name.toLowerCase() === 'filming schedule');
  const bRoll = localSubStages.find(s => ['b-roll ideas', 'b roll ideas', 'broll ideas'].includes(s.name.toLowerCase()));
  const shotList = localSubStages.find(s => s.name.toLowerCase() === 'shot list');
  const productionNotes = localSubStages.find(s => s.name.toLowerCase() === 'production notes');

  return (
    <div className="space-y-6">
      {filmingSchedule && renderSubStage(filmingSchedule)}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {bRoll && renderSubStage(bRoll)}
        {shotList && renderSubStage(shotList)}
      </div>
      {productionNotes && renderSubStage(productionNotes)}
      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => {
          setIsTaskDialogOpen(false);
          setSelectedStageForTask(null);
        }}
        projectId={project.id}
        teamId={project.teamId}
        mainStageId={selectedStageForTask?.mainStageId}
        subStageId={selectedStageForTask?.subStageId}
      />
    </div>
  );
}

interface SubComponentProps {
  subStage: SubStage;
  onUpdate: (subStage: SubStage, updates: Partial<SubStage>) => Promise<void>;
}

const FilmingScheduleComponent: React.FC<SubComponentProps> = ({ subStage, onUpdate }) => {
  const [newSession, setNewSession] = useState({ scene: '', time: '', location: '', other: '' });

  const handleAddSession = () => {
    if (newSession.scene && newSession.time && newSession.location) {
      const updatedSessions = [...(subStage.content?.filmingSchedule || []), newSession];
      onUpdate(subStage, { 
        content: { 
          ...subStage.content, 
          filmingSchedule: updatedSessions 
        } 
      });
      setNewSession({ scene: '', time: '', location: '', other: '' });
    }
  };

  const handleDeleteSession = (index: number) => {
    const updatedSessions = subStage.content?.filmingSchedule.filter((_: any, i: number) => i !== index);
    onUpdate(subStage, { 
      content: { 
        ...subStage.content, 
        filmingSchedule: updatedSessions 
      } 
    });
  };

  return (
    <div>
      <ScrollArea className="h-[200px] w-full mb-4">
      {subStage.content?.filmingSchedule?.map((session, index) => (
          <div key={index} className="flex items-center justify-between mb-2">
            <div>
              <Badge>{session.scene}</Badge>
              <span className="ml-2">{session.time} - {session.location}</span>
              {session.other && <span className="ml-2 text-sm text-gray-500">{session.other}</span>}
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleDeleteSession(index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </ScrollArea>
      <div className="flex flex-col space-y-2">
        <Input 
          placeholder="Scene" 
          value={newSession.scene}
          onChange={(e) => setNewSession({...newSession, scene: e.target.value})}
        />
        <Input 
          placeholder="Time" 
          value={newSession.time}
          onChange={(e) => setNewSession({...newSession, time: e.target.value})}
        />
        <Input 
          placeholder="Location" 
          value={newSession.location}
          onChange={(e) => setNewSession({...newSession, location: e.target.value})}
        />
        <Input 
          placeholder="Other details" 
          value={newSession.other}
          onChange={(e) => setNewSession({...newSession, other: e.target.value})}
        />
        <Button onClick={handleAddSession}>Add Session</Button>
      </div>
    </div>
  );
};

const BRollComponent: React.FC<SubComponentProps> = ({ subStage, onUpdate }) => {
  const [newIdea, setNewIdea] = useState('');

  const handleAddIdea = () => {
    if (newIdea.trim()) {
      const updatedIdeas = [...(subStage.content?.bRollIdeas || []), { idea: newIdea.trim() }];
      onUpdate(subStage, { 
        content: { 
          ...subStage.content, 
          bRollIdeas: updatedIdeas 
        } 
      });
      setNewIdea('');
    }
  };

  const handleDeleteIdea = (index: number) => {
    const updatedIdeas = subStage.content?.bRollIdeas.filter((_: any, i: number) => i !== index);
    onUpdate(subStage, { 
      content: { 
        ...subStage.content, 
        bRollIdeas: updatedIdeas 
      } 
    });
  };

  return (
    <div>
      <ScrollArea className="h-[200px] w-full mb-4">
        <ul className="space-y-2">
        {subStage.content?.bRollIdeas?.map((idea, index) => (
            <li key={index} className="flex items-center justify-between">
              <span>{idea.idea}</span>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteIdea(index)}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <div className="flex mt-4">
        <Input 
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          placeholder="Add new B-roll idea"
          className="flex-grow mr-2"
        />
        <Button onClick={handleAddIdea}>Add</Button>
      </div>
    </div>
  );
};

const ShotListComponent: React.FC<SubComponentProps> = ({ subStage, onUpdate }) => {
  const [newShot, setNewShot] = useState('');

  const handleAddShot = () => {
    if (newShot.trim()) {
      const updatedShots = [...(subStage.content?.shotList || []), { description: newShot.trim(), completed: false }];
      onUpdate(subStage, { 
        content: { 
          ...subStage.content, 
          shotList: updatedShots 
        } 
      });
      setNewShot('');
    }
  };

  const handleToggleShot = (index: number) => {
    const updatedShots = subStage.content?.shotList.map((shot: any, i: number) => 
      i === index ? { ...shot, completed: !shot.completed } : shot
    );
    onUpdate(subStage, { 
      content: { 
        ...subStage.content, 
        shotList: updatedShots 
      } 
    });
  };

  const handleDeleteShot = (index: number) => {
    const updatedShots = subStage.content?.shotList.filter((_: any, i: number) => i !== index);
    onUpdate(subStage, { 
      content: { 
        ...subStage.content, 
        shotList: updatedShots 
      } 
    });
  };

  return (
    <div>
      <ScrollArea className="h-[200px] w-full mb-4">
        <ul className="space-y-2">
        {subStage.content?.shotList?.map((shot, index) => (
            <li key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={shot.completed}
                  onCheckedChange={() => handleToggleShot(index)}
                />
                <span className={shot.completed ? 'line-through' : ''}>{shot.description}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteShot(index)}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <div className="flex mt-4">
        <Input 
          value={newShot}
          onChange={(e) => setNewShot(e.target.value)}
          placeholder="Add new shot"
          className="flex-grow mr-2"
        />
        <Button onClick={handleAddShot}>Add</Button>
      </div>
    </div>
  );
};

const ProductionNotesComponent: React.FC<SubComponentProps> = ({ subStage, onUpdate }) => {
  const [notes, setNotes] = useState(subStage.content?.notes || '');

  const handleSaveNotes = () => {
    onUpdate(subStage, { 
      content: { 
        ...subStage.content, 
        notes: notes 
      } 
    });
  };

  return (
    <div>
      <Textarea 
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Enter production notes here..."
        className="min-h-[200px] mb-2"
      />
      <Button onClick={handleSaveNotes}>
        <Save className="h-4 w-4 mr-2" /> Save Notes
      </Button>
    </div>
  );
};
