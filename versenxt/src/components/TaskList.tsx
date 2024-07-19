
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
  projectId: number;
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
    projectId: 0,
    userId: 1 // Set a default user ID or fetch from your auth context
  });

  const { data: fetchedTasks, isLoading, error, refetch } = trpc.tasks.getAll.useQuery();
  const updateTaskMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      refetch();
    },
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
        projectId: 0,
        userId: 1 // Reset to default user ID
      });
    },
  });
  const deleteTaskMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
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
      const taskToUpdate = {
        ...updatedTask,
        dueDate: updatedTask.dueDate ? new Date(updatedTask.dueDate).toISOString() : null
      };
      console.log('Sending update to backend:', taskToUpdate);
      await updateTaskMutation.mutateAsync(taskToUpdate);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting task creation with data:', newTask);
    try {
      if (!newTask.title || !newTask.projectId || !newTask.userId) {
        throw new Error("Missing required fields");
      }
  
      const taskData = {
        title: newTask.title,
        description: newTask.description || undefined,
        status: newTask.status || 'pending',
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : undefined,
        // projectId: Number(newTask.projectId),
        // userId: Number(newTask.userId)
        projectId: newTask.projectId,
        userId: newTask.userId
      };
  
      console.log('Sending task data:', taskData);
      const result = await createTaskMutation.mutateAsync(taskData);
      console.log('Task creation successful:', result);
      
      // Reset form and close it after successful creation
      setNewTask({
        title: '',
        description: '',
        status: 'pending',
        dueDate: null,
        projectId: 0,
        userId: 0 // Reset to default or current user's ID
      });
      setShowNewTaskForm(false);
      refetch();
    } catch (error) {
      console.error('Detailed error in task creation:', error);
      // Error handling...
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <Button onClick={() => setShowNewTaskForm(!showNewTaskForm)}>
          {showNewTaskForm ? <X className="mr-2" /> : <Plus className="mr-2" />}
          {showNewTaskForm ? 'Cancel' : 'Add New Task'}
        </Button>
      </div>

      {showNewTaskForm && (
        <Card className="w-full bg-green bg-opacity-10 backdrop-blur-lg rounded-xl shadow-lg mb-4">
          <CardHeader>
            <CardTitle>Add New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTask} className="space-y-4">
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
                value={newTask.projectId}
                onChange={(e) => setNewTask({...newTask, projectId: parseInt(e.target.value)})}
                placeholder="Project ID"
                required
              />
              <Input
                type="number"
                value={newTask.user}
                onChange={(e) => setNewTask({...newTask, userId: parseInt(e.target.value)})}
                placeholder="User ID"
                required
              />
              <Button type="submit">Add Task</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {tasks.map(task => (
          <Card key={task.id} className="w-full bg-green bg-opacity-10 backdrop-blur-lg rounded-xl shadow-lg">
            <CardContent className="pt-6">
              {editingTask?.id === task.id ? (
                <div className="flex flex-col space-y-4">
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
                    value={editingTask.dueDate || ''}
                    onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value || null})}
                  />
                  <Input
                    type="number"
                    value={editingTask.projectId}
                    onChange={(e) => setEditingTask({...editingTask, projectId: parseInt(e.target.value)})}
                    placeholder="Project ID"
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.status === 'completed'}
                      onCheckedChange={() => toggleTask(task.id)}
                    />
                    <div>
                      <label
                        htmlFor={`task-${task.id}`}
                        className={`text-lg font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}
                      >
                        {task.title}
                      </label>
                      <p className="text-sm text-gray-500">Project ID: {task.projectId}, User ID: {task.userId}</p>
                      {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                      {task.dueDate && <p className="text-sm text-gray-500 mt-1">Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={() => startEditing(task)} size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDeleteTask(task.id)} size="sm" variant="destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
