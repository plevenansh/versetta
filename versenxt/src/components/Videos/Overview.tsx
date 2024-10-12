import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { Checkbox } from "../ui/checkbox"
import { Edit3, Video, Users, Activity, Plus, X } from 'lucide-react'
import { Avatar, AvatarFallback } from "../ui/avatar"
import { trpc } from '../../utils/trpc'
import { Progress } from "../ui/progress"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

interface ProjectStage {
  id: number;
  stage: string;
  completed: boolean;
  order: number;
}

interface Task {
  id: number;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignee?: {
    id: number;
    user: {
      name: string;
    };
  };
  dueDate: string | null;
  description: string | null;
  teamId: number;
  projectId: number | null;
  stageId: number | null;
}

interface TeamMember {
  id: number;
  user: {
    name: string;
  };
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
  productionNotes: string | null;
  duration?: string;
  stages: ProjectStage[];
  tasks: Task[];
}

interface OverviewProps {
  project: Project;
}

export default function Overview({ project }: OverviewProps) {
  const [newStage, setNewStage] = useState('')
  const [newTask, setNewTask] = useState({ title: '', assigneeId: '' })
  const [expandedTasks, setExpandedTasks] = useState<number[]>([])
  const utils = trpc.useUtils();

  const { data: teamMembers } = trpc.teams.listTeamMembers.useQuery(project.teamId);

  const addTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.projectPage.getProjectDetails.invalidate(project.id);
    },
  });

  const updateTask = trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.projectPage.getProjectDetails.invalidate(project.id);
    },
  });

  const deleteTask = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      utils.projectPage.getProjectDetails.invalidate(project.id);
    },
  });

  const addStage = trpc.projects.updateProjectStage.useMutation({
    onSuccess: () => {
      utils.projectPage.getProjectDetails.invalidate(project.id);
    },
  });

  const updateStage = trpc.projects.updateProjectStage.useMutation({
    onSuccess: () => {
      utils.projectPage.getProjectDetails.invalidate(project.id);
    },
  });

  const handleAddTask = async () => {
    if (newTask.title.trim()) {
      try {
        await addTask.mutateAsync({
          title: newTask.title,
          status: 'PENDING', // Default status
          priority: 'MEDIUM', // Default priority
          projectId: project.id,
          teamId: project.teamId,
          assigneeId: newTask.assigneeId ? parseInt(newTask.assigneeId) : null,
          description: null, // Add this if needed
          dueDate: null, // Add this if needed
        });
        setNewTask({ title: '', assigneeId: '' });
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  }

  const handleUpdateTask = async (taskId: number, completed: boolean) => {
    try {
      await updateTask.mutateAsync({
        id: taskId,
        status: completed ? "COMPLETED" : "PENDING",
        // You need to include other required fields here
        title: '', // You should get the current title from somewhere
        priority: 'MEDIUM', // You should get the current priority from somewhere
        teamId: project.teamId,
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask.mutateAsync(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  const handleAddStage = async () => {
    if (newStage.trim()) {
      try {
        await addStage.mutateAsync({
          projectId: project.id,
          stage: newStage,
          completed: false,
        });
        setNewStage('');
      } catch (error) {
        console.error('Error adding stage:', error);
      }
    }
  }

  const handleUpdateStage = async (stageId: number, completed: boolean) => {
    try {
      await updateStage.mutateAsync({
        projectId: project.id,
        stage: project.stages.find(s => s.id === stageId)?.stage || '',
        completed: completed,
      });
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  }

  const toggleTaskDescription = (taskId: number) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
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
              Edit Projects
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
            {project.stages.map((stage: ProjectStage) => (
              <div key={stage.id} className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium">{stage.stage}</div>
                <div className="flex-1">
                  <Progress value={stage.completed ? 100 : 0} className="h-2" />
                </div>
                <div className="w-16 text-sm text-right">
                  <Checkbox
                    checked={stage.completed}
                    onCheckedChange={(checked) => handleUpdateStage(stage.id, checked as boolean)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex mt-4">
            <Input
              placeholder="New stage"
              value={newStage}
              onChange={(e) => setNewStage(e.target.value)}
              className="mr-2"
            />
            <Button onClick={handleAddStage}>Add Stage</Button>
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
                    checked={task.status === "COMPLETED"}
                    onCheckedChange={(checked) => handleUpdateTask(task.id, checked as boolean)}
                  />
                    <label htmlFor={`task-${task.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {task.title}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{task.status}</Badge>
                    {task.assignee && (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{task.assignee.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => toggleTaskDescription(task.id)}>
                      {expandedTasks.includes(task.id) ? 'Less' : 'More'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex mt-4">
            <Input
              placeholder="New task"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="mr-2"
            />
            <Select onValueChange={(value) => setNewTask({ ...newTask, assigneeId: value })}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Assign to" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers?.map((member: TeamMember) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddTask} className="ml-2">Add Task</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}