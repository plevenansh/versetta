"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from '@/trpc/client';
import { Trash2, Edit, Plus, X } from 'lucide-react';

type Task = {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  dueDate?: string | null;
  projectId?: number | null;
  teamId?: number | null;
  userId: number;
};

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    title: '',
    description: '',
    status: 'pending',
    dueDate: null,
    projectId: undefined,
    teamId: undefined,
    userId: 1 // Set a default user ID or fetch from your auth context
  });

  const { data: fetchedTasks, isLoading, error, refetch } = trpc.tasks.getAll.useQuery({});
  const updateTaskMutation = trpc.tasks.update.useMutation({
    onSuccess: () => refetch(),
  });
  const createTaskMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowNewTaskForm(false);
      setNewTask({
        title: '',
        description: '',
        status: 'pending',
        dueDate: null,
        projectId: undefined,
        teamId: undefined,
        userId: 1
      });
    },
  });
  const deleteTaskMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => refetch(),
  });

  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks]);

  const toggleTask = async (id: number) => {
    const taskToUpdate = tasks.find(task => task.id === id);
    if (taskToUpdate) {
      await updateTask({
        ...taskToUpdate,
        status: taskToUpdate.status === 'completed' ? 'pending' : 'completed'
      });
    }
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      const taskToUpdate: Partial<Task> = {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        dueDate: updatedTask.dueDate,
        userId: updatedTask.userId
      };

      // Only include projectId and teamId if they are not undefined
      if (updatedTask.projectId !== undefined) {
        taskToUpdate.projectId = updatedTask.projectId;
      }
      if (updatedTask.teamId !== undefined) {
        taskToUpdate.teamId = updatedTask.teamId;
      }

      console.log('Sending update to backend:', taskToUpdate);
      await updateTaskMutation.mutateAsync(taskToUpdate as Task);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newTask.title || !newTask.userId) {
        throw new Error("Missing required fields");
      }
      const taskData = {
        ...newTask,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
      };
      console.log('Sending task data:', taskData);
      await createTaskMutation.mutateAsync(taskData);
    } catch (error) {
      console.error('Error creating task:', error);
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

  return (
    <Card className="w-full bg-white shadow-lg">
       <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tasks</CardTitle>
        <Button 
          onClick={() => setShowNewTaskForm(!showNewTaskForm)}
          size="sm"
        >
          {showNewTaskForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showNewTaskForm ? 'Cancel' : 'Add New Task'}
        </Button>
      </CardHeader>
      <CardContent>
        {showNewTaskForm && (
          <form onSubmit={handleCreateTask} className="space-y-2 mb-4">
            <Input
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              placeholder="Task Title"
              required
            />
            <Input
              value={newTask.description || ''}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              placeholder="Description"
            />
            <Input
              type="date"
              value={newTask.dueDate || ''}
              onChange={(e) => setNewTask({...newTask, dueDate: e.target.value || null})}
            />
            <Input
              type="number"
              value={newTask.projectId || ''}
              onChange={(e) => setNewTask({...newTask, projectId: e.target.value ? parseInt(e.target.value) : undefined})}
              placeholder="Project ID (optional)"
            />
            <Input
              type="number"
              value={newTask.teamId || ''}
              onChange={(e) => setNewTask({...newTask, teamId: e.target.value ? parseInt(e.target.value) : undefined})}
              placeholder="Team ID (optional)"
            />
            <Input
              type="number"
              value={newTask.userId}
              onChange={(e) => setNewTask({...newTask, userId: parseInt(e.target.value)})}
              placeholder="User ID"
              required
            />
            <Button type="submit">Add Task</Button>
          </form>
        )}
        <ul className="space-y-2">
          {tasks.map(task => (
            <li key={task.id} className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
              {editingTask?.id === task.id ? (
                <div className="flex flex-col space-y-2 w-full">
                  <Input
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
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
                    onChange={(e) => setEditingTask({...editingTask, teamId: e.target.value ? parseInt(e.target.value) : null})}
                    placeholder="Team ID"
                  />
                  <Input
                    type="number"
                    value={editingTask.userId}
                    onChange={(e) => setEditingTask({...editingTask, userId: parseInt(e.target.value)})}
                    placeholder="User ID"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button onClick={() => updateTask(editingTask)}>Save</Button>
                    <Button onClick={() => setEditingTask(null)} variant="outline">Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <Checkbox
                    checked={task.status === 'completed'}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <div className="flex-grow">
                    <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      Project ID: {task.projectId || 'N/A'}, Team ID: {task.teamId || 'N/A'}, User ID: {task.userId}
                    </p>
                    {task.description && <p className="text-sm">{task.description}</p>}
                    {task.dueDate && <p className="text-sm">Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                  </div>
                  <Button onClick={() => startEditing(task)} size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleDeleteTask(task.id)} size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}