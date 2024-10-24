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
//import { FileList } from '../FileList';
import { FileUploader } from '../FileUploader';
import { FileViewer } from '../FileViewer';
import { TaskDialog } from '../TaskDialog';
import { CommentSection } from '../CommentSection';

interface SubStage {
  id: number;
  name: string;
  enabled: boolean;
  starred: boolean;
  content: any;
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

interface PreProductionProps {
  project: Project;
  mainStage: MainStage;
}
interface SubComponentProps {
  subStage: SubStage;
  onUpdate: (subStage: SubStage, updates: Partial<SubStage>) => Promise<void>;
}

export default function PreProduction({ project, mainStage }: PreProductionProps) {
  const [localSubStages, setLocalSubStages] = useState(mainStage.subStages);
  const [scriptText, setScriptText] = useState('');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedStageForTask, setSelectedStageForTask] = useState<{ mainStageId?: number, subStageId?: number } | null>(null);
  const utils = trpc.useUtils();

  const updateSubStageMutation = trpc.projectPage.updateSubStage.useMutation({
    onSuccess: () => utils.projectPage.getProjectDetails.invalidate(project.id)
  });

  useEffect(() => {
    setLocalSubStages(mainStage.subStages);
    const scriptSubStage = mainStage.subStages.find(s => s.name === 'Script');
    if (scriptSubStage && scriptSubStage.content?.script) {
      setScriptText(scriptSubStage.content.script);
    }
  }, [mainStage.subStages]);

  const handleUpdateSubStage = async (subStage: SubStage, updates: Partial<SubStage>) => {
    const updatedSubStage = { ...subStage, ...updates };
    setLocalSubStages(prevStages => 
      prevStages.map(stage => stage.id === subStage.id ? updatedSubStage : stage)
    );
  
    if (updates.content?.script) {
      setScriptText(updates.content.script);
    }
  
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
      if (updates.content?.script) {
        setScriptText(subStage.content?.script || '');
      }
    }
  };

  const handleAddTask = (mainStageId?: number, subStageId?: number) => {
    setSelectedStageForTask({ mainStageId, subStageId });
    setIsTaskDialogOpen(true);
  };

  const renderSubStage = (subStage: SubStage) => (
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
          <Button variant="outline" size="sm" onClick={() => handleAddTask(mainStage.id, subStage.id)}>
            <Plus className="h-4 w-4 mr-2" /> Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {subStage.name === 'Script' && (
          <>
            <Textarea 
              placeholder="Write your script here..." 
              className="min-h-[300px] mb-2"
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
            />
            <Button onClick={() => handleUpdateSubStage(subStage, { content: { script: scriptText } })}>
              <Save className="h-4 w-4 mr-2" /> Save Script
            </Button>
          </>
        )}
        {subStage.name === 'Keyword Research' && (
          <KeywordResearchComponent subStage={subStage} onUpdate={handleUpdateSubStage} />
        )}
        {subStage.name === 'Equipment Checklist' && (
          <EquipmentChecklistComponent subStage={subStage} onUpdate={handleUpdateSubStage} />
        )}
        {subStage.name === 'Storyboard' && (
          <StoryboardComponent subStage={subStage} onUpdate={handleUpdateSubStage} projectId={project.id} />
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex">
      <div className="w-2/3 pr-4">
      {renderSubStage(localSubStages.find(s => s.name === 'Script')!)}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderSubStage(localSubStages.find(s => s.name === 'Keyword Research')!)}
        {renderSubStage(localSubStages.find(s => s.name === 'Equipment Checklist')!)}
      </div>
      {renderSubStage(localSubStages.find(s => s.name === 'Storyboard')!)}
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
      <div className="w-1/3">
        <CommentSection
          projectId={project.id}
          mainStageId={mainStage.id}
          contextName={`${project.title} - ${mainStage.name}`}
        />
      </div>
      </div>
    </div>
  );
}

const KeywordResearchComponent: React.FC<SubComponentProps> = ({ subStage, onUpdate }) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [keywords, setKeywords] = useState<string[]>(subStage.content?.keywords || []);

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      const updatedKeywords = [...keywords, newKeyword.trim()];
      setKeywords(updatedKeywords);
      onUpdate(subStage, { content: { ...subStage.content, keywords: updatedKeywords } });
      setNewKeyword('');
    }
  };

  const handleDeleteKeyword = (index: number) => {
    const updatedKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(updatedKeywords);
    onUpdate(subStage, { content: { ...subStage.content, keywords: updatedKeywords } });
  };

  return (
    <div>
      <ScrollArea className="h-[200px] w-full mb-4">
        <ul className="space-y-2">
          {keywords.map((keyword, index) => (
            <li key={index} className="flex items-center justify-between">
              <span>{keyword}</span>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteKeyword(index)}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <div className="flex mt-4">
        <Input 
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          placeholder="Add new keyword"
          className="flex-grow mr-2"
        />
        <Button onClick={handleAddKeyword}>Add</Button>
      </div>
    </div>
  );
};

const EquipmentChecklistComponent: React.FC<SubComponentProps> = ({ subStage, onUpdate }) => {
  const [newEquipment, setNewEquipment] = useState('');
  const [equipment, setEquipment] = useState<Array<{ name: string; checked: boolean }>>(subStage.content?.equipment || []);

  const handleAddEquipment = () => {
    if (newEquipment.trim()) {
      const updatedEquipment = [...equipment, { name: newEquipment.trim(), checked: false }];
      setEquipment(updatedEquipment);
      onUpdate(subStage, { content: { ...subStage.content, equipment: updatedEquipment } });
      setNewEquipment('');
    }
  };

  const handleToggleEquipment = (index: number) => {
    const updatedEquipment = equipment.map((item, i) => 
      i === index ? { ...item, checked: !item.checked } : item
    );
    setEquipment(updatedEquipment);
    onUpdate(subStage, { content: { ...subStage.content, equipment: updatedEquipment } });
  };

  const handleDeleteEquipment = (index: number) => {
    const updatedEquipment = equipment.filter((_, i) => i !== index);
    setEquipment(updatedEquipment);
    onUpdate(subStage, { content: { ...subStage.content, equipment: updatedEquipment } });
  };

  return (
    <div>
      <ScrollArea className="h-[200px] w-full mb-4">
        <ul className="space-y-2">
          {equipment.map((item, index) => (
            <li key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={item.checked}
                  onCheckedChange={() => handleToggleEquipment(index)}
                />
                <span className={item.checked ? 'line-through' : ''}>{item.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteEquipment(index)}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <div className="flex mt-4">
        <Input 
          value={newEquipment}
          onChange={(e) => setNewEquipment(e.target.value)}
          placeholder="Add new equipment"
          className="flex-grow mr-2"
        />
        <Button onClick={handleAddEquipment}>Add</Button>
      </div>
    </div>
  );
};

interface StoryboardComponentProps extends SubComponentProps {
  projectId: number;
}

const StoryboardComponent: React.FC<StoryboardComponentProps> = ({ subStage, onUpdate, projectId }) => {
  const [storyboardFrames, setStoryboardFrames] = useState<Array<{ imageUrl: string; scene: number }>>(subStage.content?.storyboard || []);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState<{ url: string; name: string; contentType: string } | null>(null);

  const handleAddFrame = (fileUrl: string) => {
    const updatedFrames = [...storyboardFrames, { imageUrl: fileUrl, scene: storyboardFrames.length + 1 }];
    setStoryboardFrames(updatedFrames);
    onUpdate(subStage, { content: { ...subStage.content, storyboard: updatedFrames } });
  };

  const handleDeleteFrame = (index: number) => {
    const updatedFrames = storyboardFrames.filter((_, i) => i !== index);
    setStoryboardFrames(updatedFrames);
    onUpdate(subStage, { content: { ...subStage.content, storyboard: updatedFrames } });
  };

  const handleViewImage = (imageUrl: string, index: number) => {
    setViewerFile({ url: imageUrl, name: `Scene ${index + 1}`, contentType: 'image/jpeg' });
    setViewerOpen(true);
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {storyboardFrames.map((frame, index) => (
          <div key={index} className="relative group">
            <Image 
              src={frame.imageUrl} 
              alt={`Scene ${frame.scene}`} 
              width={200} 
              height={150} 
              layout="responsive"
              objectFit="cover"
              className="rounded cursor-pointer"
              onClick={() => handleViewImage(frame.imageUrl, index)}
            />
            <Button 
              variant="destructive" 
              size="sm" 
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDeleteFrame(index)}
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
        onUploadComplete={handleAddFrame}
      />
      {/* <FileList 
        teamId={projectId} 
        projectId={projectId} 
        subStageId={subStage.id}
      /> */}
      {viewerFile && (
        <FileViewer
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          fileUrl={viewerFile.url}
          fileName={viewerFile.name}
          contentType={viewerFile.contentType}
        />
      )}
    </div>
  );
};

// return (
//   <div className="space-y-6">
//     {renderSubStage(localSubStages.find(s => s.name === 'Script')!)}
//     {renderKeyPointsAndResearch()}
//     {renderStoryboardSubStage(localSubStages.find(s => s.name === 'Storyboard')!)}
//   </div>
// );

