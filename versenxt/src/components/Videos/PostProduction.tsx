import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";
import { Plus, X, Star, Save, Upload } from 'lucide-react';
import { trpc } from '../../utils/trpc';
import Image from 'next/image';
import { FileUploader } from '../FileUploader';
import { FileList } from '../FileList';
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { TaskDialog } from '../TaskDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

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

interface PostProductionProps {
  project: Project;
  mainStage: MainStage;
}
interface SubComponentProps {
  subStage: SubStage;
  onUpdate: (subStage: SubStage, updates: Partial<SubStage>) => Promise<void>;
}

export default function PostProduction({ project, mainStage }: PostProductionProps) {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderEditingProgress(localSubStages.find(s => s.name === 'Editing Progress')!)}
        {renderThumbnailCreator(localSubStages.find(s => s.name === 'Thumbnail Creator')!)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderVideoFootage(localSubStages.find(s => s.name === 'Video Footage')!)}
        {renderSubtitles(localSubStages.find(s => s.name === 'Subtitles')!)}
      </div>
      {renderFeedbackAndRevisions(localSubStages.find(s => s.name === 'Feedback and Revisions')!)}
      {renderExportSettings(localSubStages.find(s => s.name === 'Export Settings')!)}
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

  function renderEditingProgress(subStage: SubStage) {
    return (
      <Card key={subStage.id} className="mb-6">
        <CardHeader>{renderSubStageHeader(subStage)}</CardHeader>
        <CardContent>
          <EditingProgressComponent subStage={subStage} onUpdate={handleUpdateSubStage} />
        </CardContent>
      </Card>
    );
  }

  function renderThumbnailCreator(subStage: SubStage) {
    return (
      <Card key={subStage.id} className="mb-6">
        <CardHeader>{renderSubStageHeader(subStage)}</CardHeader>
        <CardContent>
          <ThumbnailCreatorComponent subStage={subStage} onUpdate={handleUpdateSubStage} projectId={project.id} />
        </CardContent>
      </Card>
    );
  }

  function renderVideoFootage(subStage: SubStage) {
    return (
      <Card key={subStage.id} className="mb-6">
        <CardHeader>{renderSubStageHeader(subStage)}</CardHeader>
        <CardContent>
          <VideoFootageComponent subStage={subStage} onUpdate={handleUpdateSubStage} projectId={project.id} />
        </CardContent>
      </Card>
    );
  }

  function renderSubtitles(subStage: SubStage) {
    return (
      <Card key={subStage.id} className="mb-6">
        <CardHeader>{renderSubStageHeader(subStage)}</CardHeader>
        <CardContent>
          <SubtitlesComponent subStage={subStage} onUpdate={handleUpdateSubStage} />
        </CardContent>
      </Card>
    );
  }

  function renderFeedbackAndRevisions(subStage: SubStage) {
    return (
      <Card key={subStage.id} className="mb-6">
        <CardHeader>{renderSubStageHeader(subStage)}</CardHeader>
        <CardContent>
          <FeedbackAndRevisionsComponent subStage={subStage} onUpdate={handleUpdateSubStage} />
        </CardContent>
      </Card>
    );
  }

  function renderExportSettings(subStage: SubStage) {
    return (
      <Card key={subStage.id} className="mb-6">
        <CardHeader>{renderSubStageHeader(subStage)}</CardHeader>
        <CardContent>
          <ExportSettingsComponent subStage={subStage} onUpdate={handleUpdateSubStage} />
        </CardContent>
      </Card>
    );
  }
}


const EditingProgressComponent: React.FC<SubComponentProps> = ({ subStage, onUpdate }) => {
  const [newProcess, setNewProcess] = useState('');
  const editingProcesses = subStage.content?.editingProcesses || [];

  const handleAddProcess = () => {
    if (newProcess.trim()) {
      const updatedProcesses = [...editingProcesses, { name: newProcess.trim(), completed: false }];
      onUpdate(subStage, { 
        content: { 
          ...subStage.content, 
          editingProcesses: updatedProcesses 
        } 
      });
      
      setNewProcess('');
    }
  };

  const handleToggleProcess = (index: number) => {
    const updatedProcesses = editingProcesses.map((process: { name: string; completed: boolean }, i: number) => 
      i === index ? { ...process, completed: !process.completed } : process
    );
    onUpdate(subStage, { 
      content: { 
        ...subStage.content, 
        editingProcesses: updatedProcesses 
      } 
    });
    
  };
  
  const handleDeleteProcess = (index: number) => {
    const updatedProcesses = editingProcesses.filter((_: any, i: number) => i !== index);
    onUpdate(subStage, { 
      content: { 
        ...subStage.content, 
        editingProcesses: updatedProcesses 
      } 
    });
    
  };

  const calculateProgress = () => {
    const completedProcesses = editingProcesses.filter((process: { completed: boolean }) => process.completed).length;
    return editingProcesses.length > 0 ? (completedProcesses / editingProcesses.length) * 100 : 0;
  };

  return (
    <div>
      <Progress value={calculateProgress()} className="mb-4" />
      <p className="mb-4">Overall Progress: {Math.round(calculateProgress())}%</p>
      <ScrollArea className="h-[200px] w-full mb-4">
        <ul className="space-y-2">
        {editingProcesses.map((process: { name: string; completed: boolean }, index: number) => (
            <li key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={process.completed}
                  onCheckedChange={() => handleToggleProcess(index)}
                />
                <span className={process.completed ? 'line-through' : ''}>{process.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteProcess(index)}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <div className="flex mt-4">
        <Input 
          value={newProcess}
          onChange={(e) => setNewProcess(e.target.value)}
          placeholder="Add new editing process"
          className="flex-grow mr-2"
        />
        <Button onClick={handleAddProcess}>Add</Button>
      </div>
    </div>
  );
};

const ThumbnailCreatorComponent: React.FC<SubComponentProps & { projectId: number }> = ({ subStage, onUpdate, projectId }) => {
  const thumbnailUrl = subStage.content?.thumbnailUrl || '';
  const handleUploadThumbnail = (fileUrl: string) => {
    onUpdate(subStage, { 
      content: { 
        ...subStage.content, 
        thumbnailUrl: fileUrl 
      } 
    });
  };

  return (
    <div>
      {subStage.content?.thumbnailUrl ? (
        <div className="relative w-full h-48 mb-4">
          <Image 
            src={subStage.content.thumbnailUrl} 
            alt="Thumbnail" 
            layout="fill" 
            objectFit="cover" 
            className="rounded"
          />
        </div>
      ) : (
        <div className="bg-gray-200 w-full h-48 flex items-center justify-center mb-4 rounded">
          <p>No thumbnail uploaded</p>
        </div>
      )}
      <FileUploader 
        teamId={projectId} 
        projectId={projectId} 
        subStageId={subStage.id}
        onUploadComplete={handleUploadThumbnail}
      />
    </div>
  );
};

const VideoFootageComponent: React.FC<SubComponentProps & { projectId: number }> = ({ subStage, onUpdate, projectId }) => {
  return (
    <div>
      <FileList 
        teamId={projectId} 
        projectId={projectId} 
        subStageId={subStage.id}
      />
      <FileUploader 
        teamId={projectId} 
        projectId={projectId} 
        subStageId={subStage.id}
        onUploadComplete={(fileUrl) => {
          const updatedFootage = [...(subStage.content?.footage || []), { url: fileUrl }];
          onUpdate(subStage, { 
            content: { 
              ...subStage.content, 
              footage: updatedFootage 
            } 
          });
        }}
      />
    </div>
  );
};

const SubtitlesComponent: React.FC<SubComponentProps> = ({ subStage, onUpdate }) => {
  const [newSubtitle, setNewSubtitle] = useState({ language: '', file: null as File | null });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewSubtitle({ ...newSubtitle, file: e.target.files[0] });
    }
  };

  const handleAddSubtitle = () => {
    if (newSubtitle.language && newSubtitle.file) {
      // In a real app, you'd upload the file here and get a URL back
      const fakeUrl = URL.createObjectURL(newSubtitle.file);
      const updatedSubtitles = [...(subStage.content?.subtitles || []), { language: newSubtitle.language, url: fakeUrl }];
      onUpdate(subStage, { 
        content: { 
          ...subStage.content, 
          subtitles: updatedSubtitles 
        } 
      });
      setNewSubtitle({ language: '', file: null });
    }
  };

  return (
    <div>
      <ScrollArea className="h-[200px] w-full mb-4">
        <ul className="space-y-2">
        {subStage.content?.subtitles?.map((subtitle: { language: string; url: string }, index: number) => (
            <li key={index} className="flex items-center justify-between">
              <span>{subtitle.language}</span>
              <Button variant="outline" size="sm" onClick={() => window.open(subtitle.url, '_blank')}>
                Download
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <div className="flex space-x-2 mt-4">
        <Input 
          value={newSubtitle.language}
          onChange={(e) => setNewSubtitle({ ...newSubtitle, language: e.target.value })}
          placeholder="Language"
          className="flex-grow"
        />
             <Input 
          type="file" 
          onChange={handleFileChange}
          accept=".srt,.vtt"
        />
        <Button onClick={handleAddSubtitle}>Add</Button>
      </div>
    </div>
  );
};

const FeedbackAndRevisionsComponent: React.FC<SubComponentProps> = ({ subStage, onUpdate }) => {
  const [newFeedback, setNewFeedback] = useState({ content: '', creator: '', mentioned: '', completed: false });
  const feedback = subStage.content?.feedback || [];

  const handleAddFeedback = () => {
    if (newFeedback.content && newFeedback.creator) {
      const updatedFeedback = [...(subStage.content?.feedback || []), newFeedback];
      onUpdate(subStage, { 
        content: { 
          ...subStage.content, 
          feedback: updatedFeedback 
        } 
      });
      setNewFeedback({ content: '', creator: '', mentioned: '', completed: false });
    }
  };

  const handleToggleFeedback = (index: number) => {
    const updatedFeedback = subStage.content?.feedback.map((item: any, i: number) => 
      i === index ? { ...item, completed: !item.completed } : item
    );
    onUpdate(subStage, { 
      content: { 
        ...subStage.content, 
        feedback: updatedFeedback 
      } 
    });
  };

  const handleDeleteFeedback = (index: number) => {
    const updatedFeedback = subStage.content?.feedback.filter((_: any, i: number) => i !== index);
    onUpdate(subStage, { 
      content: { 
        ...subStage.content, 
        feedback: updatedFeedback 
      } 
    });
  };

  return (
    <div>
      <ScrollArea className="h-[200px] w-full mb-4">
        <ul className="space-y-2">
          {subStage.content?.feedback?.map((item: any, index: number) => (
            <li key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={item.completed}
                  onCheckedChange={() => handleToggleFeedback(index)}
                />
                <span className={item.completed ? 'line-through' : ''}>
                  {item.content}
                  <Badge variant="outline"  className="ml-2">{item.creator}</Badge>
                  {item.mentioned && <Badge className="ml-2">@{item.mentioned}</Badge>}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteFeedback(index)}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <div className="flex flex-col space-y-2 mt-4">
        <Input 
          value={newFeedback.content}
          onChange={(e) => setNewFeedback({ ...newFeedback, content: e.target.value })}
          placeholder="Feedback content"
        />
        <Input 
          value={newFeedback.creator}
          onChange={(e) => setNewFeedback({ ...newFeedback, creator: e.target.value })}
          placeholder="Feedback creator"
        />
        <Input 
          value={newFeedback.mentioned}
          onChange={(e) => setNewFeedback({ ...newFeedback, mentioned: e.target.value })}
          placeholder="Mentioned person (optional)"
        />
        <Button onClick={handleAddFeedback}>Add Feedback</Button>
      </div>
    </div>
  );
};

const ExportSettingsComponent: React.FC<SubComponentProps> = ({ subStage, onUpdate }) => {
  const [settings, setSettings] = useState(subStage.content?.exportSettings || {
    resolution: '1080p',
    frameRate: '30fps',
    format: 'mp4'
  });
  

  const handleSettingChange = (setting: string, value: string) => {
    const updatedSettings = { ...settings, [setting]: value };
    setSettings(updatedSettings);
    onUpdate(subStage, { 
      content: { 
        ...subStage.content, 
        exportSettings: updatedSettings 
      } 
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-2">Resolution</label>
        <Select
          value={settings.resolution}
          onValueChange={(value) => handleSettingChange('resolution', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Resolution" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="720p">720p</SelectItem>
            <SelectItem value="1080p">1080p</SelectItem>
            <SelectItem value="4K">4K</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block mb-2">Frame Rate</label>
        <Select
          value={settings.frameRate}
          onValueChange={(value) => handleSettingChange('frameRate', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Frame Rate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24fps">24fps</SelectItem>
            <SelectItem value="30fps">30fps</SelectItem>
            <SelectItem value="60fps">60fps</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block mb-2">Format</label>
        <Select
          value={settings.format}
          onValueChange={(value) => handleSettingChange('format', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mp4">MP4</SelectItem>
            <SelectItem value="mov">MOV</SelectItem>
            <SelectItem value="avi">AVI</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};