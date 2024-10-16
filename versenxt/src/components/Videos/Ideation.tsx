import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";
import { Plus, X, Image as ImageIcon, Star, Save } from 'lucide-react';
import { trpc } from '../../utils/trpc';
import Image from 'next/image';
import { FileUploader } from '../FileUploader';
import { FileList } from '../FileList';

interface SubStage {
  id: number;
  name: string;
  enabled: boolean;
  starred: boolean;
  content: any;
}
interface SubComponentProps {
  subStage: SubStage;
  onUpdate: (subStage: SubStage, updates: Partial<SubStage>) => Promise<void>;
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
  mainStages: MainStage[];
  teamId: number;
}

interface IdeationProps {
  project: Project;
  mainStage: MainStage;
}

interface FileUploaderProps {
  teamId: number;
  projectId: number;
  subStageId: number;
  onUploadComplete: (fileUrl: string) => void; // Change this line
}

export default function Ideation({ project, mainStage }: IdeationProps) {
  const [localSubStages, setLocalSubStages] = useState(mainStage.subStages);
  const [conceptText, setConceptText] = useState(mainStage.subStages.find(s => s.name === 'Concept')?.content?.concept || '');

  useEffect(() => {
    const conceptSubStage = mainStage.subStages.find(s => s.name === 'Concept');
    if (conceptSubStage && conceptSubStage.content?.concept) {
      setConceptText(conceptSubStage.content.concept);
    }
  }, [mainStage.subStages]);
  const utils = trpc.useUtils();

  const updateSubStageMutation = trpc.projectPage.updateSubStage.useMutation({
    onSuccess: () => utils.projectPage.getProjectDetails.invalidate(project.id)
  });

  const createTaskMutation = trpc.tasks.create.useMutation({
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
  
    if (updates.content?.concept) {
      setConceptText(updates.content.concept);
    }
  
    try {
      await updateSubStageMutation.mutateAsync({
        id: subStage.id,
        ...updates,
      });
    } catch (error) {
      console.error('Error updating sub-stage:', error);
      // Revert local state if update fails
      setLocalSubStages(prevStages => 
        prevStages.map(stage => stage.id === subStage.id ? subStage : stage)
      );
      if (updates.content?.concept) {
        setConceptText(subStage.content?.concept || '');
      }
    }
  };
  
  const handleAddTask = async (subStageId: number) => {
    try {
      await createTaskMutation.mutateAsync({
        title: "New Task",
        status: "PENDING",
        priority: "MEDIUM",
        projectId: project.id,
        teamId: project.teamId,
        subStageId: subStageId,
      });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const renderSubStage = (subStage: SubStage) => {
    switch (subStage.name) {
      case 'Concept':
  return (
    <Card key={subStage.id} className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
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
          <Button variant="outline" size="sm" onClick={() => handleAddTask(subStage.id)}>
            <Plus className="h-4 w-4 mr-2" /> Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea 
          placeholder="Describe your video concept here..." 
          className="min-h-[150px] mb-2"
          value={conceptText}
          onChange={(e) => setConceptText(e.target.value)}
        />
        <Button onClick={() => handleUpdateSubStage(subStage, { content: { concept: conceptText } })}>
          <Save className="h-4 w-4 mr-2" /> Save Concept
        </Button>
      </CardContent>
    </Card>
  );
      default:
        return null;
    }
  };

  const renderKeyPointsAndResearch = () => {
    const keyPoints = localSubStages.find(s => s.name === 'Key Points');
    const research = localSubStages.find(s => s.name === 'Research & Reference');

    return (
      <div className="grid grid-cols-2 gap-6 mb-6">
        {keyPoints && (
  <Card className="flex flex-col h-full">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle>{keyPoints.name}</CardTitle>
      <div className="flex items-center space-x-2">
        <Switch
          checked={keyPoints.enabled}
          onCheckedChange={(enabled) => handleUpdateSubStage(keyPoints, { enabled })}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleUpdateSubStage(keyPoints, { starred: !keyPoints.starred })}
        >
          <Star className={`h-4 w-4 ${keyPoints.starred ? 'fill-yellow-400' : ''}`} />
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleAddTask(keyPoints.id)}>
          <Plus className="h-4 w-4 mr-2" /> Add Task
        </Button>
      </div>
    </CardHeader>
    <CardContent className="flex-grow">
      <KeyPointsComponent subStage={keyPoints} onUpdate={handleUpdateSubStage} />
    </CardContent>
  </Card>
)}
        {research && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>{research.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={research.enabled}
                  onCheckedChange={(enabled) => handleUpdateSubStage(research, { enabled })}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUpdateSubStage(research, { starred: !research.starred })}
                >
                  <Star className={`h-4 w-4 ${research.starred ? 'fill-yellow-400' : ''}`} />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAddTask(research.id)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ReferencesComponent subStage={research} onUpdate={handleUpdateSubStage} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderInspirationBoard = () => {
    const inspirationBoard = localSubStages.find(s => s.name === 'Inspiration Board');
    if (!inspirationBoard) return null;

    return (
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>{inspirationBoard.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <Switch
              checked={inspirationBoard.enabled}
              onCheckedChange={(enabled) => handleUpdateSubStage(inspirationBoard, { enabled })}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUpdateSubStage(inspirationBoard, { starred: !inspirationBoard.starred })}
            >
              <Star className={`h-4 w-4 ${inspirationBoard.starred ? 'fill-yellow-400' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAddTask(inspirationBoard.id)}>
              <Plus className="h-4 w-4 mr-2" /> Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <InspirationBoardComponent subStage={inspirationBoard} onUpdate={handleUpdateSubStage} projectId={project.id} />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {renderSubStage(localSubStages.find(s => s.name === 'Concept')!)}
      {renderKeyPointsAndResearch()}
      {renderInspirationBoard()}
    </div>
  );
}

// KeyPointsComponent, ReferencesComponent, and InspirationBoardComponent remain largely the same,
// but update their internal state management to reflect changes immediately:

const KeyPointsComponent: React.FC<SubComponentProps> = ({ subStage, onUpdate }) => {
  const [newKeyPoint, setNewKeyPoint] = useState('');
  const [keyPoints, setKeyPoints] = useState<Array<{ content: string; completed: boolean }>>(subStage.content?.keyPoints || []);

  const handleAddKeyPoint = () => {
    if (newKeyPoint.trim()) {
      const updatedKeyPoints = [...keyPoints, { content: newKeyPoint, completed: false }];
      setKeyPoints(updatedKeyPoints);
      onUpdate(subStage, { content: { ...subStage.content, keyPoints: updatedKeyPoints } });
      setNewKeyPoint('');
    }
  };

  const handleToggleKeyPoint = (index: number) => {
    const updatedKeyPoints = keyPoints.map((kp, i) => 
      i === index ? { ...kp, completed: !kp.completed } : kp
    );
    setKeyPoints(updatedKeyPoints);
    onUpdate(subStage, { content: { ...subStage.content, keyPoints: updatedKeyPoints } });
  };

  const handleDeleteKeyPoint = (index: number) => {
    const updatedKeyPoints = keyPoints.filter((_, i) => i !== index);
    setKeyPoints(updatedKeyPoints);
    onUpdate(subStage, { content: { ...subStage.content, keyPoints: updatedKeyPoints } });
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow mb-4">
        <ul className="space-y-2">
          {keyPoints.map((point, index) => (
            <li key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={point.completed}
                  onCheckedChange={() => handleToggleKeyPoint(index)}
                />
                <span className={point.completed ? 'line-through' : ''}>{point.content}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteKeyPoint(index)}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <div className="flex mt-auto">
        <Input 
          value={newKeyPoint}
          onChange={(e) => setNewKeyPoint(e.target.value)}
          placeholder="Add new key point"
          className="flex-grow mr-2"
        />
        <Button onClick={handleAddKeyPoint}>Add</Button>
      </div>
    </div>
  );
};

const ReferencesComponent: React.FC<SubComponentProps> = ({ subStage, onUpdate }) => {
  const [newReference, setNewReference] = useState({ title: '', link: '' });
  const [references, setReferences] = useState<Array<{ title: string; link: string }>>(subStage.content?.references || []);

  const handleAddReference = () => {
    if (newReference.title.trim()) {
      const updatedReferences = [...references, newReference];
      setReferences(updatedReferences);
      onUpdate(subStage, { content: { ...subStage.content, references: updatedReferences } });
      setNewReference({ title: '', link: '' });
    }
  };

  const handleDeleteReference = (index: number) => {
    const updatedReferences = references.filter((_, i) => i !== index);
    setReferences(updatedReferences);
    onUpdate(subStage, { content: { ...subStage.content, references: updatedReferences } });
  };

  return (
    <div>
      <ScrollArea className="h-[200px] w-full">
        <ul className="space-y-2">
          {references.map((ref, index) => (
            <li key={index} className="flex items-center justify-between">
              <span>
                {ref.link ? (
                  <a href={ref.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {ref.title}
                  </a>
                ) : (
                  ref.title
                )}
              </span>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteReference(index)}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <div className="flex flex-col space-y-2 mt-4">
        <Input 
          value={newReference.title}
          onChange={(e) => setNewReference({ ...newReference, title: e.target.value })}
          placeholder="Reference title"
        />
        <Input 
          value={newReference.link}
          onChange={(e) => setNewReference({ ...newReference, link: e.target.value })}
          placeholder="Reference link (optional)"
        />
        <Button onClick={handleAddReference}>Add Reference</Button>
      </div>
    </div>
  );
};

const InspirationBoardComponent: React.FC<SubComponentProps & { projectId: number }> = ({ subStage, onUpdate, projectId }) => {
  const [inspirations, setInspirations] = useState<Array<{ imageUrl: string }>>(subStage.content?.inspirations || []);

  const handleAddInspiration = (fileUrl: string) => {
    const updatedInspirations = [...inspirations, { imageUrl: fileUrl }];
    setInspirations(updatedInspirations);
    onUpdate(subStage, { content: { ...subStage.content, inspirations: updatedInspirations } });
  };

  const handleDeleteInspiration = (index: number) => {
    const updatedInspirations = inspirations.filter((_, i) => i !== index);
    setInspirations(updatedInspirations);
    onUpdate(subStage, { content: { ...subStage.content, inspirations: updatedInspirations } });
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {inspirations.map((inspiration, index) => (
          <div key={index} className="relative group">
            <Image 
              src={inspiration.imageUrl} 
              alt={`Inspiration ${index + 1}`} 
              width={200} 
              height={150} 
              layout="responsive"
              className="rounded"
            />
            <Button 
              variant="destructive" 
              size="sm" 
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDeleteInspiration(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <FileUploader 
  teamId={projectId} 
  projectId={projectId} 
  subStageId={subStage.id}
  onUploadComplete={handleAddInspiration}
/>
        <FileList 
          teamId={projectId} 
          projectId={projectId} 
          subStageId={subStage.id}
        />
      </div>
  );
};

