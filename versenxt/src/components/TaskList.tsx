// TaskList.tsx
"use client"

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { trpc } from '../trpc/client';
import { Trash, FilePen, Plus, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string | undefined;
  status: 'pending' | 'completed';
  dueDate: string | null;
  projectId: number | null;
  teamId: number | undefined;
  creatorId: number;
  assigneeId: number | undefined;
  createdAt: string;
  updatedAt: string;
  creationOrder: number;
}

interface Project {
  id: number;
  title: string;
  description: string | null;
  status: string; // Change this from 'active' | 'completed' to string
  startDate: string | null;
  endDate: string | null;
  creatorId: number;
  teamId: number;
  //stages: ProjectStage[];
  tasks?: Task[];
  completed?: boolean;
  createdAt: string;
  updatedAt: string;
  team: {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    description: string | null;
    workOsOrgId: string;
    creatorId: number;
  };
  creationOrder: number;
  productionNotes: string | null;
  // Add any other properties that are present in fetchedProjects
}

interface TeamMember {
  teamId: number;
  id: number;
  user: {
    name: string;
    email: string;
    gender: string | null;
    id: number;
    createdAt: string;
    updatedAt: string;
  };
  role: string;
  joinedAt: string;
  userId: number;
}

export default function TaskList() {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<number[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'creationOrder'>>({
    title: '',
    description: undefined,
    status: 'pending',
    dueDate: null,
    projectId: null,
    teamId: undefined,
    creatorId: 0,
    assigneeId: undefined,
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'assigned'>('all');

  const { data: user } = trpc.users.getUser.useQuery();
  const { data: userTeams } = trpc.users.getUserTeams.useQuery(undefined, { enabled: !!user });

  const { data: fetchedProjects, refetch: refetchProjects } = trpc.projects.getByTeamId.useQuery(
    selectedTeamId || -1,
    { enabled: !!selectedTeamId }
  );

  const { data: fetchedTeamMembers, refetch: refetchTeamMembers } = trpc.teams.listTeamMembers.useQuery(
    selectedTeamId || -1,
    { enabled: !!selectedTeamId }
  );

  const { data: fetchedTasks, isLoading, error, refetch: refetchTasks } = trpc.tasks.getFiltered.useQuery({
    filter,
    teamMemberId: user?.id || -1,
    projectId: undefined,
    teamId: selectedTeamId || undefined,
    creatorId: undefined,
    assigneeId: undefined
  }, { enabled: !!user && !!selectedTeamId });

  const updateTaskMutation = trpc.tasks.update.useMutation();
  const createTaskMutation = trpc.tasks.create.useMutation();
  const deleteTaskMutation = trpc.tasks.delete.useMutation();

  useEffect(() => {
    if (userTeams && userTeams.length > 0) {
      setSelectedTeamId(userTeams[0].id);
    }
  }, [userTeams]);

  useEffect(() => {
    if (fetchedProjects) {
      setProjects(fetchedProjects as Project[]);
    }
    if (fetchedTeamMembers) {
      setTeamMembers(fetchedTeamMembers);
    }
  }, [fetchedProjects, fetchedTeamMembers]);

  useEffect(() => {
    if (fetchedTasks) {
      const sortedTasks = [...fetchedTasks].sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (a.dueDate) {
          return -1;
        } else if (b.dueDate) {
          return 1;
        }
        
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  
      // Map the sorted tasks to match the Task interface
      const mappedTasks: Task[] = sortedTasks.map(task => ({
        ...task,
        description: task.description || undefined, // Convert null to undefined
        status: task.status as 'pending' | 'completed', // Ensure correct status type
        assigneeId: task.assigneeId || undefined, // Convert null to undefined if necessary
        // Add any other necessary type conversions here
      }));
  
      setTasks(mappedTasks);
    }
  }, [fetchedTasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newTask.title || !selectedTeamId || !user) {
        throw new Error("Missing required fields");
      }
  
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        status: newTask.status as "pending" | "completed",
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
        teamId: selectedTeamId,
        projectId: newTask.projectId ?? undefined,
        assigneeId: newTask.assigneeId ?? undefined
      };
      
      console.log('Sending task data:', taskData);
      const createdTask = await createTaskMutation.mutateAsync(taskData);
      console.log('Created task:', createdTask);
      refetchTasks();
  
      setShowNewTaskForm(false);
      setNewTask({
        title: '',
        description: undefined,
        status: 'pending',
        dueDate: null,
        projectId: null,
        teamId: selectedTeamId,
        creatorId: user.id,
        assigneeId: undefined,
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const toggleTask = async (id: number) => {
    const taskToUpdate = tasks.find(task => task.id === id);
    if (taskToUpdate) {
      const updatedTask = {
        ...taskToUpdate,
        status: taskToUpdate.status === 'completed' ? 'pending' as const : 'completed' as const
      };
      await updateTask(updatedTask);
      
      const updatedTasks = tasks.map(t => t.id === id ? updatedTask : t);
      const sortedTasks = [...updatedTasks].sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (a.dueDate) {
          return -1;
        } else if (b.dueDate) {
          return 1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setTasks(sortedTasks);
    }
  };
  
  const toggleDescription = (taskId: number) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId) 
        : [...prev, taskId]
    );
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      const taskToUpdate: Partial<Task> = {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status as 'pending' | 'completed',  
        dueDate: updatedTask.dueDate,
        projectId: updatedTask.projectId,
        teamId: updatedTask.teamId,
        assigneeId: updatedTask.assigneeId
      };

      if (updatedTask.projectId !== null) {
        taskToUpdate.projectId = updatedTask.projectId;
      }
      if (updatedTask.teamId !== null) {
        taskToUpdate.teamId = updatedTask.teamId;
      }

      console.log('Sending update to backend:', taskToUpdate);
      await updateTaskMutation.mutateAsync(taskToUpdate as Task);
      refetchTasks();
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter' && !e.ctrlKey) {
      e.preventDefault();
      if (index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else {
        handleCreateTask(e);
      }
    } else if (e.ctrlKey && e.key === 'Enter') {
      handleCreateTask(e);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
        refetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
  };

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error loading tasks: {error.message}</div>;

  const filterButtons = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Assigned', value: 'assigned' },
  ];

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
              <SelectTrigger className="w-[120px] h-[30px] ">
                <SelectValue placeholder="Select Team" />
              </SelectTrigger>
              <SelectContent>
                {userTeams?.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={() => setShowNewTaskForm(!showNewTaskForm)}
            size="sm"
            className=""
          >
            {showNewTaskForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {showNewTaskForm ? 'Cancel' : 'Add New Task'}
          </Button>
        </div>
      </CardHeader>
      <div className="px-6 pb-4 w-full">
        <div className="flex w-full p-1 h-12">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value as 'all' | 'pending' | 'assigned')}
              className={`
                flex-1 px-1 py-1 text-sm font-medium transition-all duration-300 ease-in-out
                ${filter === btn.value 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-600 hover:bg-[#F0F8FF] hover:primary'}
              `}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
      <CardContent>
        {showNewTaskForm && (
          <form onSubmit={handleCreateTask} className="space-y-2 mb-4">
            <Input
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              placeholder="Task Title"
              required
              onKeyDown={(e) => handleKeyDown(e, 0)}
              ref={(el) => {inputRefs.current[0] = el}}
            />
            <Input
              value={newTask.description || ''}
              onChange={(e) => setNewTask({...newTask, description: e.target.value })}
              placeholder="Description"
              onKeyDown={(e) => handleKeyDown(e, 1)}
              ref={(el) => {inputRefs.current[1] = el}}
            />
            <Input
              type="date"
              value={newTask.dueDate || ''}
              onChange={(e) => setNewTask({...newTask, dueDate: e.target.value || null})}
              placeholder="Due Date"
              onKeyDown={(e) => handleKeyDown(e, 2)}
              ref={(el) => {inputRefs.current[2] = el}}
            />
            <Select
              onValueChange={(value) => setNewTask({...newTask, projectId: parseInt(value)})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) => setNewTask({...newTask, assigneeId: parseInt(value)})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Assignee" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.user.name}
                  </SelectItem>
                ))}
                            </SelectContent>
            </Select>
            <Button type="submit">Add Task</Button>
          </form>
        )}
        <div className="h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide hover:scrollbar-default focus-within:scrollbar-default pr-4">
          {tasks.map(task => (
            <Card key={task.id} className="flex flex-col mb-2 border-0">
              {editingTask?.id === task.id ? (
                <div className="flex flex-col space-y-2 w-full">
                  <Input
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                    placeholder="Task Title"
                  />
                  <Input
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                    placeholder="Description"
                  />
                  <Input
                    type="date"
                    value={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value || null})}
                    placeholder="Due Date"
                  />
                  <Select
                    value={editingTask.projectId?.toString() || ''}
                    onValueChange={(value) => setEditingTask({...editingTask, projectId: parseInt(value) || null})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Project</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={editingTask.assigneeId?.toString() || ''}
                    onValueChange={(value) => setEditingTask({...editingTask, assigneeId: parseInt(value) || undefined})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end space-x-2">
                    <Button onClick={() => updateTask(editingTask)}>Save</Button>
                    <Button onClick={() => setEditingTask(null)} variant="outline">Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={task.status === 'completed'}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="round-checkbox"
                    />
                    <div className="flex-grow">
                      <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </p>
                      <p className="text-sm">
                        Project: {projects.find(p => p.id === task.projectId)?.title || 'N/A'}
                      </p>
                      <p className="text-sm">
                        Assignee: {teamMembers.find(m => m.id === task.assigneeId)?.user.name || 'Unassigned'}
                      </p>
                      {task.dueDate && <p className="text-sm">Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                      {task.description && (
                        <p className="text-sm text-gray-600">
                          {expandedTasks.includes(task.id) 
                            ? task.description 
                            : `${task.description.slice(0, 40)}${task.description.length > 40 ? '...' : ''}`}
                        </p>
                      )}
                    </div>
                    {task.description && task.description.length > 50 && (
                      <Button onClick={() => toggleDescription(task.id)} size="sm" variant="ghost">
                        {expandedTasks.includes(task.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    )}
                    <Button onClick={() => startEditing(task)} size="sm" variant="outline" className=" ">
                      <FilePen className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleDeleteTask(task.id)} size="sm" variant="destructive" className="">
                      <Trash className="h-5 w-5" />
                    </Button>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}