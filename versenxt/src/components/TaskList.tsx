import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

type Task = {
  id: number;
  title: string;
  completed: boolean;
};

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Write script for next video", completed: false },
    { id: 2, title: "Edit footage from last shoot", completed: true },
    { id: 3, title: "Design thumbnail for upcoming release", completed: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <Card className="w-full">
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