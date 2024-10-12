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
import { Plus,User } from "lucide-react"
interface ProjectStage {
  id: number;
  stage: string;
  completed: boolean;
  order: number;
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
  creationOrder: number;
  completed: boolean;
  concept: string | null;
  script: string | null;
  productionNotes: string | null; // Change this line
  stages: ProjectStage[];
  keyPoints: Array<{ id: number; content: string; completed: boolean }>;
  references: Array<{ id: number; title: string; link?: string | null }>;
  inspirations: Array<{ id: number; imageUrl: string }>;
  // Add other fields as necessary
}

export default function VideoPage({ projectId }: { projectId: number }) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [progress, setProgress] = useState(0)

  const { data: project, isLoading, error, refetch } = trpc.projectPage.getProjectDetails.useQuery(projectId)
  const updateProjectMutation = trpc.projectPage.updateProjectDetails.useMutation()

  useEffect(() => {
    if (project) {
      setTitle(project.title)
      setDescription(project.description || "")
      const completedStages = project.stages.filter(stage => stage.completed).length
      setProgress((completedStages / project.stages.length) * 100)
    }
  }, [project])

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
        // Handle error (e.g., show error message to user)
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
          <TabsTrigger value="ideation">Ideation</TabsTrigger>
          <TabsTrigger value="pre-production">Pre-Production</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="post-production">Post-Production</TabsTrigger>
          <TabsTrigger value="publishing">Publishing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Overview project={project} />
        </TabsContent>

        <TabsContent value="ideation">
          <Ideation project={project} />
        </TabsContent>

        <TabsContent value="pre-production">
          <PreProduction project={project} />
        </TabsContent>

        <TabsContent value="production">
          <Production project={project} />
        </TabsContent>

        <TabsContent value="post-production">
          <PostProduction project={project} />
        </TabsContent>

        <TabsContent value="publishing">
          <Publishing project={project} />
        </TabsContent>

        <TabsContent value="analytics">
          <Analytics project={project} />
        </TabsContent>
      </Tabs>
    </div>
  )
}