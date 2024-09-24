import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit3, Video, Users, Activity } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus } from 'lucide-react'
import { trpc } from '@/trpc/client'
import { Progress } from "@/components/ui/progress"

interface ProjectStage {
  id: number;
  stage: string;
  completed: boolean;
  order: number;
}

interface Task {
  id: number;
  title: string;
  status: string;
  assignee?: {
    user: {
      name: string;
    };
  };
}

interface Project {
  id: number;
  title: string;
  description?: string;
  status: string;
  endDate?: string;
  duration?: string;
  stages: ProjectStage[];
  tasks: Task[];
  teamId: number;
  creatorId: number;
}

interface OverviewProps {
  project: Project;
}

export default function Overview({ project }: OverviewProps) {
  const addTask = trpc.projectPage.addTask.useMutation()
  const updateTask = trpc.projectPage.updateTask.useMutation()

  const handleAddTask = async () => {
    await addTask.mutateAsync({
      projectId: project.id,
      teamId: project.teamId,
      creatorId: project.creatorId,
      title: "New Task",
      description: "Task description",
    })
  }

  const handleUpdateTask = async (taskId: number, completed: boolean) => {
    await updateTask.mutateAsync({
      id: taskId,
      status: completed ? "Completed" : "In Progress",
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Target Publish Date:</span>
                <span>{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Current Status:</span>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">{project.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Video Duration:</span>
                <span>{project.duration || 'Not set'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="w-full">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Script
            </Button>
            <Button variant="outline" className="w-full">
              <Video className="w-4 h-4 mr-2" />
              Upload Footage
            </Button>
            <Button variant="outline" className="w-full">
              <Users className="w-4 h-4 mr-2" />
              Team Chat
            </Button>
            <Button variant="outline" className="w-full">
              <Activity className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Project Stages</CardTitle>
        </CardHeader>
        <CardContent>
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
      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            <div className="space-y-4">
              {project.tasks.map((task: Task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`task-${task.id}`} 
                      checked={task.status === "Completed"}
                      onCheckedChange={(checked) => handleUpdateTask(task.id, checked as boolean)}
                    />
                    <label htmlFor={`task-${task.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {task.title}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{task.status}</Badge>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{task.assignee?.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <Button className="w-full mt-4" onClick={handleAddTask}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Task
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}