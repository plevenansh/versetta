"use client"
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from '@/trpc/client';

type Task = {
  id: number;
  title: string;
  completed: boolean;
};

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { data: fetchedTasks, isLoading, error } = trpc.tasks.getAll.useQuery();

  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks.map(task => ({
        id: task.id,
        title: task.title,
        completed: task.status === 'completed'
      })));
    }
  }, [fetchedTasks]);

  const toggleTask = async (id: number) => {
    const taskToUpdate = tasks.find(task => task.id === id);
    if (taskToUpdate) {
      const updatedTask = await trpc.tasks.update.mutate({
        id,
        status: taskToUpdate.completed ? 'pending' : 'completed'
      });
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, completed: updatedTask.status === 'completed' } : task
      ));
    }
  };

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error loading tasks: {error.message}</div>;

  return (
    <Card className="w-full bg-green bg-opacity-10 backdrop-blur-lg rounded-xl shadow-lg">
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {tasks.map(task => (
            <li key={task.id} className="flex items-center space-x-2">
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
              />
              <label
                htmlFor={`task-${task.id}`}
                className={`text-sm ${task.completed ? 'line-through text-gray-500' : ''}`}
              >
                {task.title}
              </label>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
