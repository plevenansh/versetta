import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Plus, X, Star, Save,Youtube, Twitter, Instagram, Linkedin, Facebook} from 'lucide-react';
import { trpc } from '../../utils/trpc';
import { FileUploader } from '../FileUploader';
import { FileList } from '../FileList';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TaskDialog } from '../TaskDialog';

interface SubStage {
  id: number;
  name: string;
  enabled: boolean;
  starred: boolean;
  content: any;
}
interface Platforms {
  Youtube: boolean;
  X: boolean;
  Instagram: boolean;
  LinkedIn: boolean;
  Facebook: boolean;
}

interface MainStage {
  id: number;
  name: string;
  starred: boolean;
  subStages: SubStage[];
}

interface PublishingProps {
  project: {
    id: number;
    title: string;
    description: string | null;
    mainStages: MainStage[];
    teamId: number;
  };
  mainStage: MainStage;
}

export default function Publishing({ project, mainStage }: PublishingProps) {
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
        ...updates,
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

  const renderVideoDetails = (subStage: SubStage) => (
    <Card key={subStage.id} className="mb-6">
      <CardHeader>{renderSubStageHeader(subStage)}</CardHeader>
      <CardContent>
        <VideoDetailsComponent subStage={subStage} onUpdate={handleUpdateSubStage} />
      </CardContent>
    </Card>
  );

  const renderThumbnails = (subStage: SubStage) => (
    <Card key={subStage.id} className="mb-6">
      <CardHeader>{renderSubStageHeader(subStage)}</CardHeader>
      <CardContent>
        <ThumbnailsComponent subStage={subStage} onUpdate={handleUpdateSubStage} projectId={project.id} />
      </CardContent>
    </Card>
  );

  const renderPublishingSchedule = (subStage: SubStage) => (
    <Card key={subStage.id} className="mb-6">
      <CardHeader>{renderSubStageHeader(subStage)}</CardHeader>
      <CardContent>
        <PublishingScheduleComponent subStage={subStage} onUpdate={handleUpdateSubStage} />
      </CardContent>
    </Card>
  );

  const renderSubtitles = (subStage: SubStage) => (
    <Card key={subStage.id} className="mb-6">
      <CardHeader>{renderSubStageHeader(subStage)}</CardHeader>
      <CardContent>
        <SubtitlesComponent subStage={subStage} onUpdate={handleUpdateSubStage} />
      </CardContent>
    </Card>
  );

  const renderCrossPlatformSharing = (subStage: SubStage) => (
    <Card key={subStage.id} className="mb-6">
      <CardHeader>{renderSubStageHeader(subStage)}</CardHeader>
      <CardContent>
        <CrossPlatformSharingComponent subStage={subStage} onUpdate={handleUpdateSubStage} />
      </CardContent>
    </Card>
  );

  const renderMonetization = (subStage: SubStage) => (
    <Card key={subStage.id} className="mb-6">
      <CardHeader>{renderSubStageHeader(subStage)}</CardHeader>
      <CardContent>
        <MonetizationComponent subStage={subStage} onUpdate={handleUpdateSubStage} />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {renderVideoDetails(localSubStages.find(s => s.name === 'Video Details')!)}
      {renderThumbnails(localSubStages.find(s => s.name === 'Thumbnails')!)}
      {renderPublishingSchedule(localSubStages.find(s => s.name === 'Publishing Schedule')!)}
      {renderSubtitles(localSubStages.find(s => s.name === 'Subtitles')!)}
      {renderCrossPlatformSharing(localSubStages.find(s => s.name === 'Cross-Platform Sharing')!)}
      {renderMonetization(localSubStages.find(s => s.name === 'Monetization')!)}
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

const VideoDetailsComponent: React.FC<SubComponentProps> = ({ subStage, onUpdate }) => {
  const [details, setDetails] = useState<{
    title: string;
    description: string;
    tags: string;
    category: string;
    commentsEnabled: boolean;
  }>(subStage.content || {
    title: '',
    description: '',
    tags: '',
    category: 'How-to & Style',
    commentsEnabled: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setDetails((prev: typeof details) => ({ ...prev, [name]: checked }));
  };

  const handleSave = () => {
    onUpdate(subStage, { content: details });
  };

  return (
    <div className="space-y-4">
      <Input 
        name="title"
        placeholder="Enter video title" 
        value={details.title}
        onChange={handleInputChange}
      />
      <Textarea 
        name="description"
        placeholder="Enter video description" 
        className="min-h-[100px]" 
        value={details.description}
        onChange={handleInputChange}
      />
      <Input 
        name="tags"
        placeholder="Enter tags separated by commas" 
        value={details.tags}
        onChange={handleInputChange}
      />
      <Select name="category" value={details.category} onValueChange={(value) => handleInputChange({ target: { name: 'category', value } } as any)}>
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="How-to & Style">How-to & Style</SelectItem>
          <SelectItem value="Education">Education</SelectItem>
          <SelectItem value="Entertainment">Entertainment</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center space-x-2">
        <Switch 
          id="comments-enabled" 
          checked={details.commentsEnabled}
          onCheckedChange={handleSwitchChange('commentsEnabled')}
        />
        <label htmlFor="comments-enabled">Enable comments</label>
      </div>
      <Button onClick={handleSave}>Save Details</Button>
    </div>
  );
};

const ThumbnailsComponent: React.FC<SubComponentProps & { projectId: number }> = ({ subStage, onUpdate, projectId }) => {
  const handleUploadThumbnail = (fileUrl: string) => {
    onUpdate(subStage, { content: { ...subStage.content, thumbnailUrl: fileUrl } });
  };

  return (
    <div>
      <FileUploader 
        teamId={projectId} 
        projectId={projectId} 
        subStageId={subStage.id}
        onUploadComplete={handleUploadThumbnail}
      />
      <FileList 
        teamId={projectId} 
        projectId={projectId} 
        subStageId={subStage.id}
      />
    </div>
  );
};

const PublishingScheduleComponent: React.FC<SubComponentProps> = ({ subStage, onUpdate }) => {
  const [schedule, setSchedule] = useState<{
    publishDate: string;
    notifySubscribers: boolean;
    isPremiere: boolean;
  }>(subStage.content || {
    publishDate: '',
    notifySubscribers: true,
    isPremiere: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSchedule((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setSchedule((prev: typeof schedule) => ({ ...prev, [name]: checked }));
  };

  const handleSave = () => {
    onUpdate(subStage, { content: schedule });
  };

  return (
    <div className="space-y-4">
      <Input 
        type="datetime-local" 
        name="publishDate"
        value={schedule.publishDate}
        onChange={handleInputChange}
      />
      <div className="flex items-center space-x-2">
        <Switch 
          id="notify-subscribers" 
          checked={schedule.notifySubscribers}
          onCheckedChange={handleSwitchChange('notifySubscribers')}
        />
        <label htmlFor="notify-subscribers">Notify subscribers</label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch 
          id="premiere" 
          checked={schedule.isPremiere}
          onCheckedChange={handleSwitchChange('isPremiere')}
        />
        <label htmlFor="premiere">Set as premiere</label>
      </div>
      <Button onClick={handleSave}>Schedule</Button>
    </div>
  );
};

const SubtitlesComponent: React.FC<SubComponentProps> = ({ subStage, onUpdate }) => {
  const [subtitles, setSubtitles] = useState<Array<{ language: string; url: string }>>(subStage.content?.subtitles || []);
  const [newSubtitle, setNewSubtitle] = useState({ language: '', file: null as File | null });

  const handleLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSubtitle({ ...newSubtitle, language: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewSubtitle({ ...newSubtitle, file: e.target.files[0] });
    }
  };

  const handleAddSubtitle = () => {
    if (newSubtitle.language && newSubtitle.file) {
      // In a real app, you'd upload the file here and get a URL back
      const fakeUrl = URL.createObjectURL(newSubtitle.file);
      const updatedSubtitles = [...subtitles, { language: newSubtitle.language, url: fakeUrl }];
      setSubtitles(updatedSubtitles);
      onUpdate(subStage, { content: { ...subStage.content, subtitles: updatedSubtitles } });
      setNewSubtitle({ language: '', file: null });
    }
  };

  const handleDeleteSubtitle = (index: number) => {
    const updatedSubtitles = subtitles.filter((_, i) => i !== index);
    setSubtitles(updatedSubtitles);
    onUpdate(subStage, { content: { ...subStage.content, subtitles: updatedSubtitles } });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
      {subtitles.map((subtitle: { language: string; url: string }, index: number) => (
          <div key={index} className="flex items-center justify-between">
            <span>{subtitle.language}</span>
            <div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mr-2"
                onClick={() => window.open(subtitle.url, '_blank')}
              >
                Download
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDeleteSubtitle(index)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <Input 
          placeholder="Language (e.g., English, Spanish)"
          value={newSubtitle.language}
          onChange={handleLanguageChange}
        />
        <Input 
          type="file" 
          accept=".srt,.vtt"
          onChange={handleFileChange}
        />
        <Button onClick={handleAddSubtitle}>Add Subtitle</Button>
      </div>
    </div>
  );
};

const CrossPlatformSharingComponent: React.FC<SubComponentProps> = ({ subStage, onUpdate }) => {
  const [platforms, setPlatforms] = useState<Platforms>(subStage.content?.platforms || {
    Youtube: false,
    X: false,
    Instagram: false,
    LinkedIn: false,
    Facebook: false,
  });

  const handleTogglePlatform = (platform: keyof Platforms) => {
    const updatedPlatforms = { ...platforms, [platform]: !platforms[platform] };
    setPlatforms(updatedPlatforms);
    onUpdate(subStage, { content: { ...subStage.content, platforms: updatedPlatforms } });
  };

  const platformIcons = {
    Youtube: <Youtube className="w-5 h-5" />,
    X: <Twitter className="w-5 h-5" />,
    Instagram: <Instagram className="w-5 h-5" />,
    LinkedIn: <Linkedin className="w-5 h-5" />,
    Facebook: <Facebook className="w-5 h-5" />,
  };

  return (
    <div className="space-y-4">
      {(Object.entries(platforms) as [keyof Platforms, boolean][]).map(([platform, isEnabled]) => (
        <div key={platform} className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {platformIcons[platform]}
            <span>{platform}</span>
          </div>
          <Switch 
            checked={isEnabled}
            onCheckedChange={() => handleTogglePlatform(platform)}
          />
        </div>
      ))}
      <Button className="w-full mt-4">Share Now</Button>
    </div>
  );
};

const MonetizationComponent: React.FC<SubComponentProps> = ({ subStage, onUpdate }) => {
  const [monetization, setMonetization] = useState(subStage.content || {
    adsEnabled: false,
    sponsorship: '',
    membershipOnly: false,
  });

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    const updatedMonetization = { ...monetization, [name]: checked };
    setMonetization(updatedMonetization);
    onUpdate(subStage, { content: updatedMonetization });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedMonetization = { ...monetization, [name]: value };
    setMonetization(updatedMonetization);
    onUpdate(subStage, { content: updatedMonetization });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span>Enable Ads</span>
        <Switch 
          checked={monetization.adsEnabled}
          onCheckedChange={handleSwitchChange('adsEnabled')}
        />
      </div>
      <Input 
        name="sponsorship"
        placeholder="Enter sponsorship details" 
        value={monetization.sponsorship}
        onChange={handleInputChange}
      />
      <div className="flex items-center justify-between">
        <span>Membership Only</span>
        <Switch 
          checked={monetization.membershipOnly}
          onCheckedChange={handleSwitchChange('membershipOnly')}
        />
      </div>
    </div>
  );
};