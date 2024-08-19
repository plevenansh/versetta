//TaskList.tsx
"use client"

import { useEffect, useState,useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from '@/trpc/client';
import { Trash, FilePen, Plus, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Task  {
  id: number;
  title: string;
  description: string | undefined;
  status: 'pending' | 'completed';
  dueDate: string | null;
  projectId: number | null;
  teamId: number | undefined;
  creatorId: number;
  assigneeId: number | undefined;
  // project: { id: number; name: string } | null;
  // team: { id: number; name: string } | null;
  // creator: { id: number; user: { id: number; name: string } } | null;
  // assignee: { id: number; user: { id: number; name: string } } | null;
  createdAt: string;
  updatedAt: string;
  creationOrder: number;
};
interface Project {
  title: string;
  description: string | null;
  endDate: string | null;
  teamId: number;
  creatorId: number;
  status: 'active' | 'completed';
  id: number;
  createdAt: string;
  updatedAt: string;
  team: {
    description: string | null;
    // Add other team properties here
  };
  // Add other project properties here
  creationOrder: number;
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
   const HARDCODED_TEAM_MEMBER_ID = 1;
   const HARDCODED_TEAM_ID = 1;
   const HARDCODED_CREATOR_ID = 1;
   
 
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
    teamId: HARDCODED_TEAM_ID,
    creatorId: HARDCODED_CREATOR_ID,
    assigneeId: undefined,
    // project: null,
    // team: null,
    // creator: null,
    // assignee: null
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [sliderStyle, setSliderStyle] = useState({});
  const [filter, setFilter] = useState<'all' | 'pending' | 'assigned'>('all');
  
  const { data: fetchedProjects } = trpc.projects.getByTeamId.useQuery(HARDCODED_TEAM_ID);
  const { data: fetchedTeamMembers } = trpc.teams.getTeamMembers.useQuery(HARDCODED_TEAM_ID);

  useEffect(() => {
    if (fetchedProjects) setProjects(fetchedProjects as Project[]);
    if (fetchedTeamMembers) setTeamMembers(fetchedTeamMembers);
  }, [fetchedProjects, fetchedTeamMembers]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newTask.title) {
        throw new Error("Missing required fields");
      }

      const taskData = {
        title: newTask.title,
        description: newTask.description,
        status: newTask.status as "pending" | "completed",
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : undefined,
        teamId: HARDCODED_TEAM_ID,
        creatorId: HARDCODED_CREATOR_ID,
        projectId: newTask.projectId ?? undefined,
        assigneeId: newTask.assigneeId ?? undefined
      };
      
      console.log('Sending task data:', taskData);
      await createTaskMutation.mutateAsync(taskData);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };


  const { data: fetchedTasks, isLoading, error, refetch } = trpc.tasks.getFiltered.useQuery({
    filter,
    teamMemberId: HARDCODED_TEAM_MEMBER_ID,
    projectId: undefined,
    teamId: undefined,
    creatorId: undefined,
    assigneeId: undefined
  });
  const updateTaskMutation = trpc.tasks.update.useMutation({
    onSuccess: () => refetch(),
  });
  const createTaskMutation = trpc.tasks.create.useMutation<{
    id: number;
    status?: 'pending' | 'completed';
    assigneeId?: number | null;
    dueDate?: string | null;
    title?: string;
    description?: string | undefined;
    teamId?: number;
    projectId?: number | null;
  }>({
    onSuccess: () => {
      refetch();
      setShowNewTaskForm(false);
      setNewTask({
        title: '',
        description: '',
        status: 'pending',
        dueDate: null,
        projectId: null,
        teamId: HARDCODED_TEAM_ID,
        creatorId: HARDCODED_CREATOR_ID,
        assigneeId: undefined,
      });
    },
  });
  const deleteTaskMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => refetch(),
  });

  useEffect(() => {
    if (fetchedTasks) {
      const sortedTasks = [...fetchedTasks].sort((a, b) => {
        // First, sort by completion status (pending first)
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        
        // Then, sort by due date
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (a.dueDate) {
          return -1;
        } else if (b.dueDate) {
          return 1;
        }
        
        // For tasks without due date, sort by creation time (latest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setTasks(sortedTasks as Task[]);
    }
  }, [fetchedTasks]);

  const toggleTask = async (id: number) => {
    const taskToUpdate = tasks.find(task => task.id === id);
    if (taskToUpdate) {
      const updatedTask = {
        ...taskToUpdate,
        status: taskToUpdate.status === 'completed' ? 'pending' as const : 'completed' as const
      };
      await updateTask(updatedTask);
      
      // Re-sort tasks after updating
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

      // Only include projectId and teamId if they are not undefined
      if (updatedTask.projectId !== null) {
        taskToUpdate.projectId = updatedTask.projectId;
      }
      if (updatedTask.teamId !== null) {
        taskToUpdate.teamId = updatedTask.teamId;
      }

      console.log('Sending update to backend:', taskToUpdate);
      await updateTaskMutation.mutateAsync(taskToUpdate as Task);
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
    <Card className="w-full bg-[#F0F8FF] rounded-2xl shadow-lg">
       <CardHeader className="flex flex-col space-y-4 pb-2">
       <div className="flex justify-between items-center">
        <CardTitle>Tasks</CardTitle>
        <Button 
  onClick={() => setShowNewTaskForm(!showNewTaskForm)}
  size="sm"
  className="bg-pink-100 text-pink-600 hover:bg-pink-200"
>
  {showNewTaskForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
  {showNewTaskForm ? 'Cancel' : 'Add New Task'}
</Button>
        </div>
        </CardHeader>
        <div className="px-6 pb-4 w-full">
  <div className="flex w-full rounded-full bg-[#D6EBFF] p-1 h-12">
    {filterButtons.map((btn) => (
      <button
        key={btn.value}
        onClick={() => setFilter(btn.value as 'all' | 'pending' | 'assigned')}
        className={`
          flex-1 rounded-full px-1 py-1 text-sm font-medium transition-all duration-300 ease-in-out
          ${filter === btn.value 
            ? 'bg-[#F0F8FF] text-black-500' 
            : 'text-gray-600 hover:bg-gray-700 hover:text-white'}
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
            <Card key={task.id} className="flex flex-col bg-gray-100 p-2 rounded-2xl mb-2 border-0">
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
                  <Input
                    type="number"
                    value={editingTask.projectId || ''}
                    onChange={(e) => setEditingTask({...editingTask, projectId: e.target.value ? parseInt(e.target.value) : null})}
                    placeholder="Project ID"
                  />
                  <Input
                    type="number"
                    value={editingTask.teamId || ''}
                    onChange={(e) => setEditingTask({...editingTask, teamId: e.target.value ? parseInt(e.target.value) : undefined})}
                    placeholder="Team ID"
                  />
                  
                  <Input
                    type="number"
                    value={editingTask.assigneeId}
                    onChange={(e) => setEditingTask({...editingTask, assigneeId: parseInt(e.target.value)})}
                    placeholder="Assigne ID"
                  />
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
                      <p className="text-sm text-gray-600">
                        Project ID: {task.projectId || 'N/A'}, Team ID: {task.teamId || 'N/A'}, Creator ID: {task.creatorId}
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
                    <Button onClick={() => startEditing(task)} size="sm" variant="outline" className="rounded-xl ">
                      <FilePen className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleDeleteTask(task.id)} size="sm" variant="destructive" className="rounded-xl bg-[#ec6058]">
                      <Trash className="h-4 w-4" />
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