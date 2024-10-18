import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Progress } from "../ui/progress"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import Overview from './Overview'
import Ideation from './Ideation'
import PreProduction from './PreProduction'
import Production from './Production'
import PostProduction from './PostProduction'
import Publishing from './Publishing'
import Analytics from './Analytics'
import { trpc } from '../../utils/trpc'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, User } from "lucide-react"

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
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  teamId: number;
  creatorId: number;
  completed: boolean;
  mainStages: MainStage[];
  // Add other properties as needed
}

export default function VideoPage({ projectId }: { projectId: number }) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [progress, setProgress] = useState(0)

  const { data: project, isLoading, error, refetch } = trpc.projects.getById.useQuery(projectId) as { 
    data: Project | undefined, 
    isLoading: boolean, 
    error: Error | null, 
    refetch: () => void 
  };
  const updateProjectMutation = trpc.projects.update.useMutation()

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description || "");
      const completedSubStages = (project as Project).mainStages.reduce((acc: number, mainStage: MainStage) => 
        acc + mainStage.subStages.filter(subStage => subStage.enabled).length, 0);
      const totalSubStages = (project as Project).mainStages.reduce((acc: number, mainStage: MainStage) => 
        acc + mainStage.subStages.length, 0);
      setProgress((completedSubStages / totalSubStages) * 100);
    }
  }, [project]);

  const handleSave = async () => {
    if (project) {
      try {
        await updateProjectMutation.mutateAsync({
          id: projectId,
          title,
          description,
        })
        setIsEditing(false)
        refetch()
      } catch (error) {
        console.error('Error updating project:', error)
      }
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!project) return <div>Project not found</div>

  return (
    <div className="w-full max-w-full p-2 sm:p-4 md:p-6 space-y-6">
     <header className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-8">
        <div className="space-y-2 flex-1">
          {isEditing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-3xl font-bold"
            />
          ) : (
            <h1 className="text-3xl font-bold">{title}</h1>
          )}
          {isEditing ? (
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-muted-foreground"
            />
          ) : (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
            {isEditing ? 'Save' : 'Edit'}
          </Button>
          <Button variant="default">Publish</Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 mb-8">
        <Avatar>
          {/* <AvatarImage src="/placeholder-avatar.jpg" alt="@johndoe" /> */}
         
          <AvatarFallback> <User className="h-6 w-6" /></AvatarFallback>
        </Avatar>
        <Avatar>
          {/* <AvatarImage src="/placeholder-avatar-2.jpg" alt="@janedoe" /> */}
          <AvatarFallback> <User className="h-6 w-6" /></AvatarFallback>
        </Avatar>
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <Progress value={progress} className="w-full" />
        <span className="text-sm font-medium whitespace-nowrap">{Math.round(progress)}% Complete</span>
      </div>
       
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {project.mainStages.map((stage) => (
            <TabsTrigger key={stage.id} value={stage.name.toLowerCase()}>{stage.name}</TabsTrigger>
          ))}
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Overview project={project} />
        </TabsContent>

        {project.mainStages.map((stage) => (
          <TabsContent key={stage.id} value={stage.name.toLowerCase()}>
            {stage.name === 'Ideation' && <Ideation project={project} mainStage={stage} />}
            {stage.name === 'Pre-Production' && <PreProduction project={project} mainStage={stage} />}
            {stage.name === 'Production' && <Production project={project} mainStage={stage} />}
            {stage.name === 'Post-Production' && <PostProduction project={project} mainStage={stage} />}
            {stage.name === 'Publishing' && <Publishing project={project} mainStage={stage} />}
          </TabsContent>
        ))}

        <TabsContent value="analytics">
          <Analytics project={project} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
