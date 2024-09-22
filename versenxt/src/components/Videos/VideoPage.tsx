import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus } from 'lucide-react'
import Overview from './Overview'
import Ideation from './Ideation'
import PreProduction from './PreProduction'
import Production from './Production'
import PostProduction from './PostProduction'
import Publishing from './Publishing'
import Analytics from './Analytics'
import { trpc } from '@/trpc/client';


interface ProjectStage {
  id: number;
  stage: string;
  completed: boolean;
  order: number;
}

interface TeamMember {
  id: number;
  user: {
    name: string;
    avatarUrl?: string;
  };
}

interface Project {
  id: number;
  title: string;
  description: string | null;
  stages: ProjectStage[];
  team: {
    members: TeamMember[];
  };
}


export default function VideoPage({ projectId }: { projectId: number }) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [progress, setProgress] = useState(0)

  // Assuming you have a projectPage router defined in your tRPC setup
  const { data: project, refetch } = trpc.projectPage.getProjectDetails.useQuery(projectId)
  const updateProject = trpc.projectPage.updateProjectDetails.useMutation()

  useEffect(() => {
    if (project) {
      setTitle(project.title)
      setDescription(project.description || "")
      // Calculate progress based on completed stages
      const completedStages = project.stages.filter(stage => stage.completed).length
      setProgress((completedStages / project.stages.length) * 100)
    }
  }, [project])

  const handleSave = async () => {
    await updateProject.mutateAsync({
      id: projectId,
      title,
      description,
    })
    setIsEditing(false)
    refetch()
  }

  if (!project) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      {/* ... (header content remains the same) ... */}

      {/* <div className="flex flex-wrap items-center gap-2 mb-8">
        {project.team.members.map((member: TeamMember) => (
          <Avatar key={member.id}>
            <AvatarImage src={member.user.avatarUrl} alt={member.user.name} />
            <AvatarFallback>{member.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        ))}
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div> */}

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {project.stages.map((stage: ProjectStage, index: number) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium">{stage.stage}</div>
                <div className="flex-1">
                  <Progress value={stage.completed ? 100 : 0} className="h-2" />
                </div>
                <div className="w-16 text-sm text-right">
                  {stage.completed ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>
                  ) : (
                    '0%'
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
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