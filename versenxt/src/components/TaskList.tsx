"use client"
import React, { useState, useEffect } from 'react';
import { trpc } from '../trpc/client';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Trash, FilePen, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Textarea } from "./ui/textarea";

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  projectId: number | null;
  stageId: number | null;
  teamId: number;
  assigneeId: number | null;
  creatorId: number;
  project: { id: number; title: string } | null;
  stage: { id: number; stage: string } | null;
  assignee: { id: number; user: { name: string } } | null;
  creator: { id: number; user: { name: string } };
}

interface Project {
  id: number;
  title: string;
  stages: { id: number; stage: string }[];
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
    stageId: number | null;
    assigneeId: number | null;
  }>({
    title: '',
    description: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    dueDate: '',
    projectId: null,
    stageId: null,
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
      setTasks(fetchedTasks as Task[]);
    }
  }, [fetchedTasks]);

  const handleCreateTask = async () => {
    if (!selectedTeamId) return;
    try {
      await createTaskMutation.mutateAsync({
        ...newTask,
        teamId: selectedTeamId,
        description: newTask.description || null,
        dueDate: newTask.dueDate || null,
      });
      setNewTask({
        title: '',
        description: '',
        status: 'PENDING',
        priority: 'MEDIUM',
        dueDate: '',
        projectId: null,
        stageId: null,
        assigneeId: null,
      });
      setShowNewTaskForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (task: Task) => {
    try {
      const updatedTask = await updateTaskMutation.mutateAsync({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        projectId: task.projectId,
        stageId: task.stageId,
        teamId: task.teamId,
        assigneeId: task.assigneeId,
      });
      console.log('Task updated successfully:', updatedTask);
      setEditingTask(null);
      refetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      // You can add a toast notification here to show the error to the user
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
            <Plus className="h-4 w-4 mr-2" />
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
  value={newTask.projectId?.toString() || undefined}
  onValueChange={(value) => setNewTask({ ...newTask, projectId: value ? Number(value) : null })}
>
  <SelectTrigger>
    <SelectValue placeholder="Select Project" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="none">No Project</SelectItem>
    {projects?.map((project: Project) => (
      <SelectItem key={project.id} value={project.id.toString()}>
        {project.title}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
{newTask.projectId && (
  <Select
    value={newTask.stageId?.toString() || undefined}
    onValueChange={(value) => setNewTask({ ...newTask, stageId: value ? Number(value) : null })}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select Stage" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="none">No Stage</SelectItem>
      {projects?.find(p => p.id === newTask.projectId)?.stages.map((stage) => (
        <SelectItem key={stage.id} value={stage.id.toString()}>
          {stage.stage}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)}
             <Select
  value={newTask.assigneeId?.toString() || undefined}
  onValueChange={(value) => setNewTask({ ...newTask, assigneeId: value ? Number(value) : null })}
>
  <SelectTrigger>
    <SelectValue placeholder="Select Assignee" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="none">Unassigned</SelectItem>
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
            <Card key={task.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={task.status === 'COMPLETED'}
                    onCheckedChange={(checked) => 
                      handleUpdateTask({ ...task, status: checked ? 'COMPLETED' : 'PENDING' })
                    }
                  />
                  <span className={task.status === 'COMPLETED' ? 'line-through' : ''}>{task.title}</span>
                </div>
                <div className="flex items-center space-x-2">
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
                <div className="mt-2 space-y-2">
                  <p>{task.description}</p>
                  <p>Status: {task.status}</p>
                  <p>Priority: {task.priority}</p>
                  <p>Due Date: {formatDate(task.dueDate)}</p>
                  <p>Project: {task.project?.title || 'None'}</p>
                  <p>Stage: {task.stage?.stage || 'None'}</p>
                  <p>Assignee: {task.assignee?.user.name || 'Unassigned'}</p>
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
  value={editingTask.projectId?.toString() || 'none'}
  onValueChange={(value) => setEditingTask({ ...editingTask, projectId: value === 'none' ? null : Number(value) })}
>
  <SelectTrigger>
    <SelectValue placeholder="Select Project" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="none">No Project</SelectItem>
    {projects?.map((project: Project) => (
      <SelectItem key={project.id} value={project.id.toString()}>
        {project.title}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
{editingTask.projectId && (
  <Select
    value={editingTask.stageId?.toString() || 'none'}
    onValueChange={(value) => setEditingTask({ ...editingTask, stageId: value === 'none' ? null : Number(value) })}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select Stage" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="none">No Stage</SelectItem>
      {projects?.find(p => p.id === editingTask.projectId)?.stages.map((stage) => (
        <SelectItem key={stage.id} value={stage.id.toString()}>
          {stage.stage}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)}
<Select
  value={editingTask.assigneeId?.toString() || 'none'}
  onValueChange={(value) => setEditingTask({ ...editingTask, assigneeId: value === 'none' ? null : Number(value) })}
>
  <SelectTrigger>
    <SelectValue placeholder="Select Assignee" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="none">Unassigned</SelectItem>
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







// import React, { useState, useEffect } from 'react';
// import { trpc } from '../trpc/client';
// import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
// import { Checkbox } from "./ui/checkbox";
// import { Input } from "./ui/input";
// import { Button } from "./ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
// import { Trash, FilePen, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
// import { Textarea } from "./ui/textarea";

// interface Task {
//   id: number;
//   title: string;
//   description: string | null;
//   status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
//   priority: 'LOW' | 'MEDIUM' | 'HIGH';
//   dueDate: string | null;
//   projectId: number | null;
//   stageId: number | null;
//   teamId: number;
//   assigneeId: number | null;
//   creatorId: number;
//   project?: { id: number; title: string };
//   stage?: { id: number; stage: string };
//   assignee?: { id: number; user: { name: string } };
//   creator: { id: number; user: { name: string } };
// }

// interface Project {
//   id: number;
//   title: string;
//   stages: { id: number; stage: string }[];
// }

// interface Team {
//   id: number;
//   name: string;
// }

// export default function TaskList() {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
//   const [filter, setFilter] = useState<'all' | 'assigned' | 'created' | 'pending' | 'completed'>('all');
//   const [showNewTaskForm, setShowNewTaskForm] = useState(false);
//   const [newTask, setNewTask] = useState({
//     title: '',
//     description: '',
//     status: 'PENDING' as const,
//     priority: 'MEDIUM' as const,
//     dueDate: '',
//     projectId: null as number | null,
//     stageId: null as number | null,
//     assigneeId: null as number | null,
//   });
//   const [editingTask, setEditingTask] = useState<Task | null>(null);
//   const [expandedTasks, setExpandedTasks] = useState<number[]>([]);

//   const { data: user } = trpc.users.getUser.useQuery();
//   const { data: userTeams } = trpc.users.getUserTeams.useQuery();
//   const { data: teamMembers } = trpc.teams.listTeamMembers.useQuery(selectedTeamId || -1, { enabled: !!selectedTeamId });
//   const { data: projects } = trpc.projects.getByTeamId.useQuery(selectedTeamId || -1, { enabled: !!selectedTeamId });

//   const { data: fetchedTasks, refetch: refetchTasks } = trpc.tasks.getTasksForUser.useQuery({ filter }, { enabled: !!user });

//   const createTaskMutation = trpc.tasks.create.useMutation({ onSuccess: () => refetchTasks() });
//   const updateTaskMutation = trpc.tasks.update.useMutation({ onSuccess: () => refetchTasks() });
//   const deleteTaskMutation = trpc.tasks.delete.useMutation({ onSuccess: () => refetchTasks() });

//   useEffect(() => {
//     if (userTeams && userTeams.length > 0) {
//       setSelectedTeamId(userTeams[0].id);
//     }
//   }, [userTeams]);

//   useEffect(() => {
//     if (fetchedTasks) {
//       setTasks(fetchedTasks);
//     }
//   }, [fetchedTasks]);

//   const handleCreateTask = async () => {
//     if (!selectedTeamId) return;
//     try {
//       await createTaskMutation.mutateAsync({
//         ...newTask,
//         teamId: selectedTeamId,
//       });
//       setNewTask({
//         title: '',
//         description: '',
//         status: 'PENDING',
//         priority: 'MEDIUM',
//         dueDate: '',
//         projectId: null,
//         stageId: null,
//         assigneeId: null,
//       });
//       setShowNewTaskForm(false);
//     } catch (error) {
//       console.error('Error creating task:', error);
//     }
//   };

//   const handleUpdateTask = async (task: Task) => {
//     try {
//       const updatedTask = {
//         ...task,
//         description: task.description || '', // Convert null to empty string
//       };
//       await updateTaskMutation.mutateAsync(updatedTask);
//     } catch (error) {
//       console.error('Error updating task:', error);
//     }
//   };

//   const handleDeleteTask = async (taskId: number) => {
//     try {
//       await deleteTaskMutation.mutateAsync(taskId);
//     } catch (error) {
//       console.error('Error deleting task:', error);
//     }
//   };

//   const toggleDescription = (taskId: number) => {
//     setExpandedTasks(prev => 
//       prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
//     );
//   };

//   return (
//     <Card className="w-full shadow-lg">
//       <CardHeader className="pb-2">
//         <div className="flex justify-between items-center">
//           <div className="flex items-center space-x-4">
//             <CardTitle>Tasks</CardTitle>
//             <Select
//               value={selectedTeamId?.toString() || ''}
//               onValueChange={(value) => setSelectedTeamId(Number(value))}
//             >
//               <SelectTrigger className="w-[120px] h-[30px]">
//                 <SelectValue placeholder="Select Team" />
//               </SelectTrigger>
//               <SelectContent>
//                 {userTeams?.map((team: Team) => (
//                   <SelectItem key={team.id} value={team.id.toString()}>
//                     {team.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//           <Button onClick={() => setShowNewTaskForm(!showNewTaskForm)}>
//             <Plus className="h-4 w-4 mr-2" />
//             {showNewTaskForm ? 'Cancel' : 'Add New Task'}
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           <div className="flex space-x-2">
//             {['all', 'assigned', 'created', 'pending', 'completed'].map((f) => (
//               <Button
//                 key={f}
//                 variant={filter === f ? 'default' : 'outline'}
//                 onClick={() => setFilter(f as typeof filter)}
//               >
//                 {f.charAt(0).toUpperCase() + f.slice(1)}
//               </Button>
//             ))}
//           </div>
//           {showNewTaskForm && (
//   <Card className="p-4 space-y-4">
//     <Input
//       value={newTask.title}
//       onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
//       placeholder="Task Title"
//     />
//     <Textarea
//       value={newTask.description}
//       onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
//       placeholder="Description"
//     />
//     <Select
//       value={newTask.status}
//       onValueChange={(value) => setNewTask({ ...newTask, status: value as Task['status'] })}
//     >
//       <SelectTrigger>
//         <SelectValue placeholder="Status" />
//       </SelectTrigger>
//       <SelectContent>
//         {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
//           <SelectItem key={status} value={status}>
//             {status}
//           </SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//     <Select
//       value={newTask.priority}
//       onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task['priority'] })}
//     >
//       <SelectTrigger>
//         <SelectValue placeholder="Priority" />
//       </SelectTrigger>
//       <SelectContent>
//         {['LOW', 'MEDIUM', 'HIGH'].map((priority) => (
//           <SelectItem key={priority} value={priority}>
//             {priority}
//           </SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//     <Input
//       type="date"
//       value={newTask.dueDate}
//       onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
//       placeholder="Due Date"
//     />
//     <Select
//       value={newTask.projectId?.toString() || undefined}
//       onValueChange={(value) => setNewTask({ ...newTask, projectId: value ? Number(value) : null })}
//     >
//       <SelectTrigger>
//         <SelectValue placeholder="Select Project" />
//       </SelectTrigger>
//       <SelectContent>
//         <SelectItem value={undefined}>No Project</SelectItem>
//         {projects?.map((project: Project) => (
//           <SelectItem key={project.id} value={project.id.toString()}>
//             {project.title}
//           </SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//     {newTask.projectId && (
//       <Select
//         value={newTask.stageId?.toString() || undefined}
//         onValueChange={(value) => setNewTask({ ...newTask, stageId: value ? Number(value) : null })}
//       >
//         <SelectTrigger>
//           <SelectValue placeholder="Select Stage" />
//         </SelectTrigger>
//         <SelectContent>
//           <SelectItem value={undefined}>No Stage</SelectItem>
//           {projects?.find(p => p.id === newTask.projectId)?.stages.map((stage) => (
//             <SelectItem key={stage.id} value={stage.id.toString()}>
//               {stage.stage}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//     )}
//     <Select
//       value={newTask.assigneeId?.toString() || undefined}
//       onValueChange={(value) => setNewTask({ ...newTask, assigneeId: value ? Number(value) : null })}
//     >
//       <SelectTrigger>
//         <SelectValue placeholder="Select Assignee" />
//       </SelectTrigger>
//       <SelectContent>
//         <SelectItem value={undefined}>Unassigned</SelectItem>
//         {teamMembers?.map((member: any) => (
//           <SelectItem key={member.id} value={member.id.toString()}>
//             {member.user.name}
//           </SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//     <Button onClick={handleCreateTask}>Create Task</Button>
//   </Card>
// )}
//           {tasks.map((task) => (
//             <Card key={task.id} className="p-4">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-2">
//                   <Checkbox
//                     checked={task.status === 'COMPLETED'}
//                     onCheckedChange={(checked) => 
//                       handleUpdateTask({ ...task, status: checked ? 'COMPLETED' : 'PENDING' })
//                     }
//                   />
//                   <span className={task.status === 'COMPLETED' ? 'line-through' : ''}>{task.title}</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <Button variant="ghost" onClick={() => toggleDescription(task.id)}>
//                     {expandedTasks.includes(task.id) ? <ChevronUp /> : <ChevronDown />}
//                   </Button>
//                   <Button variant="ghost" onClick={() => setEditingTask(task)}>
//                     <FilePen className="h-4 w-4" />
//                   </Button>
//                   <Button variant="ghost" onClick={() => handleDeleteTask(task.id)}>
//                     <Trash className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//               {expandedTasks.includes(task.id) && (
//                 <div className="mt-2 space-y-2">
//                   <p>{task.description}</p>
//                   <p>Status: {task.status}</p>
//                   <p>Priority: {task.priority}</p>
//                   <p>Due Date: {task.dueDate}</p>
//                   <p>Project: {task.project?.title || 'None'}</p>
//                   <p>Stage: {task.stage?.stage || 'None'}</p>
//                   <p>Assignee: {task.assignee?.user.name || 'Unassigned'}</p>
//                   <p>Creator: {task.creator.user.name}</p>
//                 </div>
//               )}
//             </Card>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }


// // // TaskList.tsx
// // "use client"

// // import { useEffect, useState, useRef } from 'react';
// // import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
// // import { Checkbox } from "./ui/checkbox";
// // import { Input } from "./ui/input";
// // import { Button } from "./ui/button";
// // import { trpc } from '../trpc/client';
// // import { Trash, FilePen, Plus, X } from 'lucide-react';
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
// // import { ChevronDown, ChevronUp } from 'lucide-react';

// // interface Task {
// //   id: number;
// //   title: string;
// //   description: string | undefined;
// //   status: 'pending' | 'completed';
// //   dueDate: string | null;
// //   projectId: number | null;
// //   teamId: number | undefined;
// //   creatorId: number;
// //   assigneeId: number | undefined;
// //   createdAt: string;
// //   updatedAt: string;
// //   creationOrder: number;
// // }

// // interface Project {
// //   id: number;
// //   title: string;
// //   description: string | null;
// //   status: string; // Change this from 'active' | 'completed' to string
// //   startDate: string | null;
// //   endDate: string | null;
// //   creatorId: number;
// //   teamId: number;
// //   //stages: ProjectStage[];
// //   tasks?: Task[];
// //   completed?: boolean;
// //   createdAt: string;
// //   updatedAt: string;
// //   team: {
// //     id: number;
// //     name: string;
// //     createdAt: string;
// //     updatedAt: string;
// //     description: string | null;
// //     workOsOrgId: string;
// //     creatorId: number;
// //   };
// //   creationOrder: number;
// //   productionNotes: string | null;
// //   // Add any other properties that are present in fetchedProjects
// // }

// // interface TeamMember {
// //   teamId: number;
// //   id: number;
// //   user: {
// //     name: string;
// //     email: string;
// //     gender: string | null;
// //     id: number;
// //     createdAt: string;
// //     updatedAt: string;
// //   };
// //   role: string;
// //   joinedAt: string;
// //   userId: number;
// // }

// // export default function TaskList() {
// //   const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
// //   const [tasks, setTasks] = useState<Task[]>([]);
// //   const [projects, setProjects] = useState<Project[]>([]);
// //   const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
// //   const [expandedTasks, setExpandedTasks] = useState<number[]>([]);
// //   const [editingTask, setEditingTask] = useState<Task | null>(null);
// //   const [showNewTaskForm, setShowNewTaskForm] = useState(false);
// //   const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'creationOrder'>>({
// //     title: '',
// //     description: undefined,
// //     status: 'pending',
// //     dueDate: null,
// //     projectId: null,
// //     teamId: undefined,
// //     creatorId: 0,
// //     assigneeId: undefined,
// //   });

// //   const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
// //   const [filter, setFilter] = useState<'all' | 'pending' | 'assigned'>('all');

// //   const { data: user } = trpc.users.getUser.useQuery();
// //   const { data: userTeams } = trpc.users.getUserTeams.useQuery(undefined, { enabled: !!user });

// //   const { data: fetchedProjects, refetch: refetchProjects } = trpc.projects.getByTeamId.useQuery(
// //     selectedTeamId || -1,
// //     { enabled: !!selectedTeamId }
// //   );

// //   const { data: fetchedTeamMembers, refetch: refetchTeamMembers } = trpc.teams.listTeamMembers.useQuery(
// //     selectedTeamId || -1,
// //     { enabled: !!selectedTeamId }
// //   );

// //   const { data: fetchedTasks, isLoading, error, refetch: refetchTasks } = trpc.tasks.getFiltered.useQuery({
// //     filter,
// //     teamMemberId: user?.id || -1,
// //     projectId: undefined,
// //     teamId: selectedTeamId || undefined,
// //     creatorId: undefined,
// //     assigneeId: undefined
// //   }, { enabled: !!user && !!selectedTeamId });

// //   const updateTaskMutation = trpc.tasks.update.useMutation();
// //   const createTaskMutation = trpc.tasks.create.useMutation();
// //   const deleteTaskMutation = trpc.tasks.delete.useMutation();

// //   useEffect(() => {
// //     if (userTeams && userTeams.length > 0) {
// //       setSelectedTeamId(userTeams[0].id);
// //     }
// //   }, [userTeams]);

// //   useEffect(() => {
// //     if (fetchedProjects) {
// //       setProjects(fetchedProjects as Project[]);
// //     }
// //     if (fetchedTeamMembers) {
// //       setTeamMembers(fetchedTeamMembers);
// //     }
// //   }, [fetchedProjects, fetchedTeamMembers]);

// //   useEffect(() => {
// //     if (fetchedTasks) {
// //       const sortedTasks = [...fetchedTasks].sort((a, b) => {
// //         if (a.status === 'completed' && b.status !== 'completed') return 1;
// //         if (a.status !== 'completed' && b.status === 'completed') return -1;
        
// //         if (a.dueDate && b.dueDate) {
// //           return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
// //         } else if (a.dueDate) {
// //           return -1;
// //         } else if (b.dueDate) {
// //           return 1;
// //         }
        
// //         return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
// //       });
  
// //       // Map the sorted tasks to match the Task interface
// //       const mappedTasks: Task[] = sortedTasks.map(task => ({
// //         ...task,
// //         description: task.description || undefined, // Convert null to undefined
// //         status: task.status as 'pending' | 'completed', // Ensure correct status type
// //         assigneeId: task.assigneeId || undefined, // Convert null to undefined if necessary
// //         // Add any other necessary type conversions here
// //       }));
  
// //       setTasks(mappedTasks);
// //     }
// //   }, [fetchedTasks]);

// //   const handleCreateTask = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     try {
// //       if (!newTask.title || !selectedTeamId || !user) {
// //         throw new Error("Missing required fields");
// //       }
  
// //       const taskData = {
// //         title: newTask.title,
// //         description: newTask.description,
// //         status: newTask.status as "pending" | "completed",
// //         dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
// //         teamId: selectedTeamId,
// //         projectId: newTask.projectId ?? undefined,
// //         assigneeId: newTask.assigneeId ?? undefined
// //       };
      
// //       console.log('Sending task data:', taskData);
// //       const createdTask = await createTaskMutation.mutateAsync(taskData);
// //       console.log('Created task:', createdTask);
// //       refetchTasks();
  
// //       setShowNewTaskForm(false);
// //       setNewTask({
// //         title: '',
// //         description: undefined,
// //         status: 'pending',
// //         dueDate: null,
// //         projectId: null,
// //         teamId: selectedTeamId,
// //         creatorId: user.id,
// //         assigneeId: undefined,
// //       });
// //     } catch (error) {
// //       console.error('Error creating task:', error);
// //     }
// //   };

  
// //   const toggleTask = async (id: number) => {
// //     const taskToUpdate = tasks.find(task => task.id === id);
// //     if (taskToUpdate) {
// //       const updatedTask = {
// //         ...taskToUpdate,
// //         status: taskToUpdate.status === 'completed' ? 'pending' as const : 'completed' as const
// //       };
// //       await updateTask(updatedTask);
      
// //       const updatedTasks = tasks.map(t => t.id === id ? updatedTask : t);
// //       const sortedTasks = [...updatedTasks].sort((a, b) => {
// //         if (a.status === 'completed' && b.status !== 'completed') return 1;
// //         if (a.status !== 'completed' && b.status === 'completed') return -1;
// //         if (a.dueDate && b.dueDate) {
// //           return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
// //         } else if (a.dueDate) {
// //           return -1;
// //         } else if (b.dueDate) {
// //           return 1;
// //         }
// //         return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
// //       });
// //       setTasks(sortedTasks);
// //     }
// //   };
  
// //   const toggleDescription = (taskId: number) => {
// //     setExpandedTasks(prev => 
// //       prev.includes(taskId) 
// //         ? prev.filter(id => id !== taskId) 
// //         : [...prev, taskId]
// //     );
// //   };

// //   const updateTask = async (updatedTask: Task) => {
// //     try {
// //       const taskToUpdate: Partial<Task> = {
// //         id: updatedTask.id,
// //         title: updatedTask.title,
// //         description: updatedTask.description,
// //         status: updatedTask.status as 'pending' | 'completed',  
// //         dueDate: updatedTask.dueDate,
// //         projectId: updatedTask.projectId,
// //         teamId: updatedTask.teamId,
// //         assigneeId: updatedTask.assigneeId
// //       };

// //       if (updatedTask.projectId !== null) {
// //         taskToUpdate.projectId = updatedTask.projectId;
// //       }
// //       if (updatedTask.teamId !== null) {
// //         taskToUpdate.teamId = updatedTask.teamId;
// //       }

// //       console.log('Sending update to backend:', taskToUpdate);
// //       await updateTaskMutation.mutateAsync(taskToUpdate as Task);
// //       refetchTasks();
// //       setEditingTask(null);
// //     } catch (error) {
// //       console.error('Error updating task:', error);
// //     }
// //   };

// //   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
// //     if (e.key === 'Enter' && !e.ctrlKey) {
// //       e.preventDefault();
// //       if (index < inputRefs.current.length - 1) {
// //         inputRefs.current[index + 1]?.focus();
// //       } else {
// //         handleCreateTask(e);
// //       }
// //     } else if (e.ctrlKey && e.key === 'Enter') {
// //       handleCreateTask(e);
// //     }
// //   };

// //   const handleDeleteTask = async (taskId: number) => {
// //     if (window.confirm('Are you sure you want to delete this task?')) {
// //       try {
// //         await deleteTaskMutation.mutateAsync(taskId);
// //         refetchTasks();
// //       } catch (error) {
// //         console.error('Error deleting task:', error);
// //       }
// //     }
// //   };

// //   const startEditing = (task: Task) => {
// //     setEditingTask(task);
// //   };

// //   if (isLoading) return <div>Loading tasks...</div>;
// //   if (error) return <div>Error loading tasks: {error.message}</div>;

// //   const filterButtons = [
// //     { label: 'All', value: 'all' },
// //     { label: 'Pending', value: 'pending' },
// //     { label: 'Assigned', value: 'assigned' },
// //   ];

// //   return (
// //     <Card className="w-full shadow-lg">
// //       <CardHeader className="pb-2">
// //         <div className="flex justify-between items-center">
// //           <div className="flex items-center space-x-4">
// //             <CardTitle>Tasks</CardTitle>
// //             <Select
// //               value={selectedTeamId?.toString() || ''}
// //               onValueChange={(value) => setSelectedTeamId(Number(value))}
// //             >
// //               <SelectTrigger className="w-[120px] h-[30px] ">
// //                 <SelectValue placeholder="Select Team" />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 {userTeams?.map((team) => (
// //                   <SelectItem key={team.id} value={team.id.toString()}>
// //                     {team.name}
// //                   </SelectItem>
// //                 ))}
// //               </SelectContent>
// //             </Select>
// //           </div>
// //           <Button 
// //             onClick={() => setShowNewTaskForm(!showNewTaskForm)}
// //             size="sm"
// //             className=""
// //           >
// //             {showNewTaskForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
// //             {showNewTaskForm ? 'Cancel' : 'Add New Task'}
// //           </Button>
// //         </div>
// //       </CardHeader>
// //       <div className="px-6 pb-4 w-full">
// //         <div className="flex w-full p-1 h-12">
// //           {filterButtons.map((btn) => (
// //             <button
// //               key={btn.value}
// //               onClick={() => setFilter(btn.value as 'all' | 'pending' | 'assigned')}
// //               className={`
// //                 flex-1 px-1 py-1 text-sm font-medium transition-all duration-300 ease-in-out
// //                 ${filter === btn.value 
// //                   ? 'bg-gray-700 text-white' 
// //                   : 'text-gray-600 hover:bg-[#F0F8FF] hover:primary'}
// //               `}
// //             >
// //               {btn.label}
// //             </button>
// //           ))}
// //         </div>
// //       </div>
// //       <CardContent>
// //         {showNewTaskForm && (
// //           <form onSubmit={handleCreateTask} className="space-y-2 mb-4">
// //             <Input
// //               value={newTask.title}
// //               onChange={(e) => setNewTask({...newTask, title: e.target.value})}
// //               placeholder="Task Title"
// //               required
// //               onKeyDown={(e) => handleKeyDown(e, 0)}
// //               ref={(el) => {inputRefs.current[0] = el}}
// //             />
// //             <Input
// //               value={newTask.description || ''}
// //               onChange={(e) => setNewTask({...newTask, description: e.target.value })}
// //               placeholder="Description"
// //               onKeyDown={(e) => handleKeyDown(e, 1)}
// //               ref={(el) => {inputRefs.current[1] = el}}
// //             />
// //             <Input
// //               type="date"
// //               value={newTask.dueDate || ''}
// //               onChange={(e) => setNewTask({...newTask, dueDate: e.target.value || null})}
// //               placeholder="Due Date"
// //               onKeyDown={(e) => handleKeyDown(e, 2)}
// //               ref={(el) => {inputRefs.current[2] = el}}
// //             />
// //             <Select
// //               onValueChange={(value) => setNewTask({...newTask, projectId: parseInt(value)})}
// //             >
// //               <SelectTrigger>
// //                 <SelectValue placeholder="Select Project" />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 {projects.map((project) => (
// //                   <SelectItem key={project.id} value={project.id.toString()}>
// //                     {project.title}
// //                   </SelectItem>
// //                 ))}
// //               </SelectContent>
// //             </Select>
// //             <Select
// //               onValueChange={(value) => setNewTask({...newTask, assigneeId: parseInt(value)})}
// //             >
// //               <SelectTrigger>
// //                 <SelectValue placeholder="Select Assignee" />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 {teamMembers.map((member) => (
// //                   <SelectItem key={member.id} value={member.id.toString()}>
// //                     {member.user.name}
// //                   </SelectItem>
// //                 ))}
// //                             </SelectContent>
// //             </Select>
// //             <Button type="submit">Add Task</Button>
// //           </form>
// //         )}
// //         <div className="h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide hover:scrollbar-default focus-within:scrollbar-default pr-4">
// //           {tasks.map(task => (
// //             <Card key={task.id} className="flex flex-col mb-2 border-0">
// //               {editingTask?.id === task.id ? (
// //                 <div className="flex flex-col space-y-2 w-full">
// //                   <Input
// //                     value={editingTask.title}
// //                     onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
// //                     placeholder="Task Title"
// //                   />
// //                   <Input
// //                     value={editingTask.description || ''}
// //                     onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
// //                     placeholder="Description"
// //                   />
// //                   <Input
// //                     type="date"
// //                     value={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''}
// //                     onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value || null})}
// //                     placeholder="Due Date"
// //                   />
// //                   <Select
// //                     value={editingTask.projectId?.toString() || ''}
// //                     onValueChange={(value) => setEditingTask({...editingTask, projectId: parseInt(value) || null})}
// //                   >
// //                     <SelectTrigger>
// //                       <SelectValue placeholder="Select Project" />
// //                     </SelectTrigger>
// //                     <SelectContent>
// //                       <SelectItem value="">No Project</SelectItem>
// //                       {projects.map((project) => (
// //                         <SelectItem key={project.id} value={project.id.toString()}>
// //                           {project.title}
// //                         </SelectItem>
// //                       ))}
// //                     </SelectContent>
// //                   </Select>
// //                   <Select
// //                     value={editingTask.assigneeId?.toString() || ''}
// //                     onValueChange={(value) => setEditingTask({...editingTask, assigneeId: parseInt(value) || undefined})}
// //                   >
// //                     <SelectTrigger>
// //                       <SelectValue placeholder="Select Assignee" />
// //                     </SelectTrigger>
// //                     <SelectContent>
// //                       <SelectItem value="">Unassigned</SelectItem>
// //                       {teamMembers.map((member) => (
// //                         <SelectItem key={member.id} value={member.id.toString()}>
// //                           {member.user.name}
// //                         </SelectItem>
// //                       ))}
// //                     </SelectContent>
// //                   </Select>
// //                   <div className="flex justify-end space-x-2">
// //                     <Button onClick={() => updateTask(editingTask)}>Save</Button>
// //                     <Button onClick={() => setEditingTask(null)} variant="outline">Cancel</Button>
// //                   </div>
// //                 </div>
// //               ) : (
// //                 <>
// //                   <div className="flex items-center space-x-2">
// //                     <Checkbox
// //                       checked={task.status === 'completed'}
// //                       onCheckedChange={() => toggleTask(task.id)}
// //                       className="round-checkbox"
// //                     />
// //                     <div className="flex-grow">
// //                       <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
// //                         {task.title}
// //                       </p>
// //                       <p className="text-sm">
// //                         Project: {projects.find(p => p.id === task.projectId)?.title || 'N/A'}
// //                       </p>
// //                       <p className="text-sm">
// //                         Assignee: {teamMembers.find(m => m.id === task.assigneeId)?.user.name || 'Unassigned'}
// //                       </p>
// //                       {task.dueDate && <p className="text-sm">Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
// //                       {task.description && (
// //                         <p className="text-sm text-gray-600">
// //                           {expandedTasks.includes(task.id) 
// //                             ? task.description 
// //                             : `${task.description.slice(0, 40)}${task.description.length > 40 ? '...' : ''}`}
// //                         </p>
// //                       )}
// //                     </div>
// //                     {task.description && task.description.length > 50 && (
// //                       <Button onClick={() => toggleDescription(task.id)} size="sm" variant="ghost">
// //                         {expandedTasks.includes(task.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
// //                       </Button>
// //                     )}
// //                     <Button onClick={() => startEditing(task)} size="sm" variant="outline" className=" ">
// //                       <FilePen className="h-4 w-4" />
// //                     </Button>
// //                     <Button onClick={() => handleDeleteTask(task.id)} size="sm" variant="destructive" className="">
// //                       <Trash className="h-5 w-5" />
// //                     </Button>
// //                   </div>
// //                 </>
// //               )}
// //             </Card>
// //           ))}
// //         </div>
// //       </CardContent>
// //     </Card>
// //   );
// // }