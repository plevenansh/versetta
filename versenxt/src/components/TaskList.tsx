"use client"
import React, { useState, useEffect } from 'react';
import { trpc } from '../utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Trash, FilePen, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { CalendarIcon, UserIcon } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  projectId: number | null;
  mainStageId: number | null;
  subStageId: number | null;
  teamId: number;
  assigneeId: number | null;
  creatorId: number;
  project: { id: number; title: string } | null;
  mainStage: { id: number; name: string } | null;
  subStage: { id: number; name: string } | null;
  assignee: { id: number; user: { name: string } } | null;
  creator: { id: number; user: { name: string } };
}

interface Project {
  id: number ;
  title: string;
  mainStages: MainStage[];
  
  // ... other properties
}

interface SubStage {
  id: number;
  name: string;
  // ... other properties
}

interface MainStage {
  id: number;
  name: string;
  subStages: SubStage[];
  // ... other properties
}

interface Team {
  id: number;
  name: string;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'assigned' | 'created' | 'pending' | 'completed'>('all');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    status: Task['status'];
    priority: Task['priority'];
    dueDate: string;
    projectId: number | null;
    mainStageId: number | null;
    subStageId: number | null;
    assigneeId: number | null;
  }>({
    title: '',
    description: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    dueDate: '',
    projectId: null,
    mainStageId: null,
    subStageId: null,
    assigneeId: null,
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<number[]>([]);

  const { data: user } = trpc.users.getUser.useQuery();
  const { data: userTeams } = trpc.users.getUserTeams.useQuery();
  const { data: teamMembers } = trpc.teams.listTeamMembers.useQuery(selectedTeamId || -1, { enabled: !!selectedTeamId });
  const { data: projects } = trpc.projects.getByTeamId.useQuery(selectedTeamId || -1, { enabled: !!selectedTeamId });

  const { data: fetchedTasks, refetch: refetchTasks } = trpc.tasks.getTasksForUser.useQuery({ filter }, { enabled: !!user });

  const createTaskMutation = trpc.tasks.create.useMutation({ onSuccess: () => refetchTasks() });
  const updateTaskMutation = trpc.tasks.update.useMutation({ onSuccess: () => refetchTasks() });
  const deleteTaskMutation = trpc.tasks.delete.useMutation({ onSuccess: () => refetchTasks() });

  useEffect(() => {
    if (userTeams && userTeams.length > 0) {
      setSelectedTeamId(userTeams[0].id);
    }
  }, [userTeams]);

  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks]);

  const handleCreateTask = async () => {
    if (!selectedTeamId) return;
    try {
      const taskData = {
        ...newTask,
        teamId: selectedTeamId,
        description: newTask.description || null,
        dueDate: newTask.dueDate || null,
        projectId: newTask.projectId || undefined,
        mainStageId: newTask.mainStageId || undefined,
        subStageId: newTask.subStageId || undefined,
      };
  
      await createTaskMutation.mutateAsync(taskData);
      setNewTask({
        title: '',
        description: '',
        status: 'PENDING',
        priority: 'MEDIUM',
        dueDate: '',
        projectId: null,
        mainStageId: null,
        subStageId: null,
        assigneeId: null,
      });
      setShowNewTaskForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (task: Task) => {
    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        projectId: task.projectId,
        mainStageId: task.mainStageId,
        subStageId: task.subStageId,
        teamId: task.teamId,
        assigneeId: task.assigneeId,
      });
      setEditingTask(null);
      refetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleDescription = (taskId: number) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };
  const renderSubStageOptions = (editingTask: Task, projects: Project[] | undefined) => {
  const project = projects?.find(p => p.id === editingTask.projectId);
  if (!project) return null;
  
  const mainStage = project.mainStages.find(s => s.id === editingTask.mainStageId);
  if (!mainStage) return null;

  return mainStage.subStages.map((subStage) => (
    <SelectItem key={subStage.id} value={subStage.id.toString()}>
      {subStage.name}
    </SelectItem>
  ));
};
const renderMainStageOptions = (project: Project | undefined) => {
  if (!project) return null;
  return project.mainStages.map((stage) => (
    <SelectItem key={stage.id} value={stage.id.toString()}>
      {stage.name}
    </SelectItem>
  ));
};
return (
  <Card className="w-full shadow-lg">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <CardTitle>Tasks</CardTitle>
          <Select
            value={selectedTeamId?.toString() || ''}
            onValueChange={(value) => setSelectedTeamId(Number(value))}
          >
            <SelectTrigger className="w-[120px] h-[30px]">
              <SelectValue placeholder="Select Team" />
            </SelectTrigger>
            <SelectContent>
              {userTeams?.map((team: Team) => (
                <SelectItem key={team.id} value={team.id.toString()}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowNewTaskForm(!showNewTaskForm)}>
          {showNewTaskForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showNewTaskForm ? 'Cancel' : 'Add New Task'}
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex space-x-2">
          {['all', 'assigned', 'created', 'pending', 'completed'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f as typeof filter)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
        {showNewTaskForm && (
          <Card className="p-4 space-y-4">
            <Input
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Task Title"
            />
            <Textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Description"
            />
            <Select
              value={newTask.status}
              onValueChange={(value) => setNewTask({ ...newTask, status: value as Task['status'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={newTask.priority}
              onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task['priority'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {['LOW', 'MEDIUM', 'HIGH'].map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              placeholder="Due Date"
            />
            <Select
              value={newTask.projectId?.toString() || ''}
              onValueChange={(value) => setNewTask({ ...newTask, projectId: Number(value), mainStageId: null, subStageId: null })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project: Project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {newTask.projectId && (
  <Select
    value={newTask.mainStageId?.toString() || ''}
    onValueChange={(value) => setNewTask({ ...newTask, mainStageId: value ? Number(value) : null, subStageId: null })}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select Main Stage" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="">No Main Stage</SelectItem>
      {(projects?.find(p => p.id === newTask.projectId) as Project | undefined)?.mainStages.map((stage) => (
        <SelectItem key={stage.id} value={stage.id.toString()}>
          {stage.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)}

{newTask.projectId && newTask.mainStageId && (
  <Select
    value={newTask.subStageId?.toString() || ''}
    onValueChange={(value) => setNewTask({ ...newTask, subStageId: value ? Number(value) : null })}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select Sub Stage" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="">No Sub Stage</SelectItem>
      {(() => {
        const project = projects?.find(p => p.id === newTask.projectId) as Project | undefined;
        if (!project) return null;
        
        const mainStage = project.mainStages.find(s => s.id === newTask.mainStageId) as MainStage | undefined;
        if (!mainStage) return null;

        return mainStage.subStages.map((subStage) => (
          <SelectItem key={subStage.id} value={subStage.id.toString()}>
            {subStage.name}
          </SelectItem>
        ));
      })()}
    </SelectContent>
  </Select>
)}
            <Select
              value={newTask.assigneeId?.toString() || ''}
              onValueChange={(value) => setNewTask({ ...newTask, assigneeId: Number(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Assignee" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers?.map((member: any) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleCreateTask}>Create Task</Button>
          </Card>
        )}
        {tasks.map((task) => (
          <Card key={task.id} className="p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-grow">
                <Checkbox
                  checked={task.status === 'COMPLETED'}
                  onCheckedChange={(checked) => 
                    handleUpdateTask({ ...task, status: checked ? 'COMPLETED' : 'PENDING' })
                  }
                />
                <div className="flex flex-col">
                  <span className={`font-medium ${task.status === 'COMPLETED' ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </span>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    {task.assignee && (
                      <span className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-1" />
                        {task.assignee.user.name}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={
                  task.priority === 'HIGH' ? 'destructive' :
                  task.priority === 'MEDIUM' ? 'warning' :
                  'secondary'
                }>
                  {task.priority}
                </Badge>
                <Button variant="ghost" onClick={() => toggleDescription(task.id)}>
                  {expandedTasks.includes(task.id) ? <ChevronUp /> : <ChevronDown />}
                </Button>
                <Button variant="ghost" onClick={() => setEditingTask(task)}>
                  <FilePen className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={() => handleDeleteTask(task.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {expandedTasks.includes(task.id) && (
              <div className="mt-2 space-y-2 text-sm text-gray-600">
                <p>{task.description}</p>
                <p>Status: {task.status}</p>
                <p>Project: {task.project?.title || 'None'}</p>
                <p>Main Stage: {task.mainStage?.name || 'None'}</p>
                <p>Sub Stage: {task.subStage?.name || 'None'}</p>
                <p>Creator: {task.creator.user.name}</p>
              </div>
            )}
            {editingTask?.id === task.id && (
              <Card className="mt-4 p-4 space-y-4">
                <Input
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  placeholder="Task Title"
                />
                <Textarea
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  placeholder="Description"
                />
                <Select
                  value={editingTask.status}
                  onValueChange={(value) => setEditingTask({ ...editingTask, status: value as Task['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={editingTask.priority}
                  onValueChange={(value) => setEditingTask({ ...editingTask, priority: value as Task['priority'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {['LOW', 'MEDIUM', 'HIGH'].map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                  placeholder="Due Date"
                />
                <Select
                  value={editingTask.projectId?.toString() || ''}
                  onValueChange={(value) => setEditingTask({ ...editingTask, projectId: Number(value), mainStageId: null, subStageId: null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((project: Project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editingTask.projectId && (
                   <Select
                   value={newTask.mainStageId?.toString() || ''}
                   onValueChange={(value) => setNewTask({ ...newTask, mainStageId: Number(value), subStageId: null })}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select Main Stage" />
                   </SelectTrigger>
                   <SelectContent>
                     {renderMainStageOptions(projects?.find(p => p.id === newTask.projectId))}
                   </SelectContent>
                 </Select>
                )}
                {editingTask.projectId && editingTask.mainStageId && (
                  <Select
                    value={editingTask.subStageId?.toString() || ''}
                    onValueChange={(value) => setEditingTask({ ...editingTask, subStageId: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Sub Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {renderSubStageOptions(editingTask, projects)}
                    </SelectContent>
                  </Select>
                )}
                <Select
                  value={editingTask.assigneeId?.toString() || ''}
                  onValueChange={(value) => setEditingTask({ ...editingTask, assigneeId: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers?.map((member: any) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex justify-end space-x-2">
                  <Button onClick={() => handleUpdateTask(editingTask)}>
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setEditingTask(null)}>
                    Cancel
                  </Button>
                </div>
              </Card>
            )}
          </Card>
        ))}
      </div>
    </CardContent>
  </Card>
);
}


