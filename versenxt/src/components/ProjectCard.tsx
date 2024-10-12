
// components/ProjectCard.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { trpc } from '../utils/trpc';
import { Trash2, Edit2, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { EditProjectModal } from './EditProjectModal';
import Link from 'next/link';
import { slugify } from '../utils/slugify';
interface Project {
  id: number;
  title: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  creatorId: number;
  teamId: number;
  mainStages: MainStage[];
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  team: {
    name: string;
    id: number;
    createdAt: string;
    updatedAt: string;
    description: string | null;
    creatorId: number;
  };
  duration: string;
  creator: {
    user: {
      name: string;
    }
  };
}

interface MainStage {
  id: number;
  name: string;
  projectId: number;
  starred: boolean;
  subStages: SubStage[];
}

interface SubStage {
  id: number;
  name: string;
  enabled: boolean;
  starred: boolean;
  content: any;
  mainStageId: number;
  projectId: number;
}

interface ProjectCardProps {
  project: Project;
  refetchProjects: () => void;
}
export default function ProjectCard({ project, refetchProjects }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const deleteProjectMutation = trpc.projects.delete.useMutation();
  const toggleProjectCompletionMutation = trpc.projects.toggleProjectCompletion.useMutation();
  const updateProjectMutation = trpc.projects.update.useMutation();

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProjectMutation.mutateAsync(project.id);
        refetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const handleToggleCompletion = async () => {
    try {
      await toggleProjectCompletionMutation.mutateAsync({
        id: project.id,
        completed: !project.completed
      });
      refetchProjects();
    } catch (error) {
      console.error('Error toggling project completion:', error);
      alert('Failed to update project status. Please try again.');
    }
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      await updateProjectMutation.mutateAsync(updatedProject);
      refetchProjects();
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
    }
  };

  return (
    <Card className={`w-full ${project.completed ? 'bg-gray-100' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{project.title}</CardTitle>
            <CardDescription>{project.description}</CardDescription>
          </div>
          <Badge variant={project.completed ? "secondary" : "default"}>
            {project.completed ? 'Completed' : 'In Progress'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Created by:</strong> {project.creator.user.name}</p>
          <p><strong>Team:</strong> {project.team.name}</p>
          <p><strong>Duration:</strong> {project.duration}</p>
          <p><strong>Start Date:</strong> {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</p>
          <p><strong>End Date:</strong> {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}</p>
          {isExpanded && (
            <div>
              <strong>Main Stages:</strong>
              <ul className="list-disc pl-5">
                {project.mainStages.map((stage) => (
                  <li key={stage.id}>
                    {stage.name} {stage.starred && '⭐'}
                    {stage.subStages.length > 0 && (
                      <ul className="list-circle pl-5">
                        {stage.subStages.map((subStage) => (
                          <li key={subStage.id}>
                            {subStage.name} {subStage.starred && '⭐'} {!subStage.enabled && '(Disabled)'}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
          {isExpanded ? 'Show Less' : 'Show More'}
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleToggleCompletion}>
            <CheckCircle className="mr-2 h-4 w-4" />
            {project.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
          </Button>
          <Button variant="destructive" onClick={handleDeleteProject}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Link href={`/videos/${project.id}/${slugify(project.title)}`}>
              <Button variant="outline" className="justify-between">
                Expand
              </Button>
            </Link>
        </div>
      </CardFooter>

      <EditProjectModal
        project={project}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleUpdateProject}
      />
    </Card>
  );
}




// "use client"
// import React, { useState, useEffect, useCallback } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
// import { Progress } from "./ui/progress";
// import { Button } from "./ui/button";
// import { motion, AnimatePresence } from "framer-motion";
// import { Switch } from "./ui/switch";
// import { CheckCircle, Plus, X, Circle, ChevronDown, ChevronUp, Send, Edit, Trash2 } from 'lucide-react';
// import { EditProjectModal } from './EditProjectModal';
// import { trpc } from '../utils/trpc';
// import Link from 'next/link';
// import { slugify } from '../utils/slugify';
// import { Input } from "./ui/input";
// import { Checkbox } from "./ui/checkbox";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

// interface Project {
//   id: number;
//   title: string;
//   description: string | null;
//   status: 'active' | 'completed';
//   startDate: string | null;
//   endDate: string | null;
//   creatorId: number;
//   teamId: number;
//   stages: ProjectStage[];
//   tasks?: Task[];
//   completed?: boolean;
// }

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

// interface ProjectStage {
//   id: number;
//   projectId: number;
//   stage: string;
//   completed: boolean;
//   order: number;
// }

// interface ProjectCardProps {
//   project: Project;
//   refetchProjects: () => void;
// }
// type TaskUpdatePayload = {
//   id: number;
//   title: string;
//   status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
//   priority: "LOW" | "MEDIUM" | "HIGH";
//   teamId: number;
//   description?: string | null;
//   dueDate?: string | null;
//   projectId?: number | null;
//   stageId?: number | null;
//   assigneeId?: number | null;
// };


// export default function ProjectCard({ project, refetchProjects }: ProjectCardProps) {
//   const [expanded, setExpanded] = useState(false);
//   const [projectStages, setProjectStages] = useState<ProjectStage[]>([]);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [percentageDone, setPercentageDone] = useState(0);
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [expandedTasks, setExpandedTasks] = useState<number[]>([]);
//   const [showNewTaskForm, setShowNewTaskForm] = useState(false);
//   const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'creatorId' | 'creator'>>({
//     title: '',
//     description: '',
//     status: 'PENDING',
//     priority: 'MEDIUM',
//     dueDate: null,
//     projectId: project.id,
//     stageId: null,
//     teamId: project.teamId,
//     assigneeId: null
//   });

//   const { data: projectWithTasks, error: projectError, refetch } = trpc.projects.getById.useQuery(project.id);
//   const deleteProjectMutation = trpc.projects.delete.useMutation();
//   const updateProjectStageMutation = trpc.projects.updateProjectStage.useMutation();
//   const toggleProjectCompletionMutation = trpc.projects.toggleProjectCompletion.useMutation();
//   const createTaskMutation = trpc.tasks.create.useMutation();
//   const updateTaskMutation = trpc.tasks.update.useMutation();
//   const deleteTaskMutation = trpc.tasks.delete.useMutation();

//   useEffect(() => {
//     if (project.stages) {
//       const sortedStages = [...project.stages].sort((a, b) => {
//         if (a.completed === b.completed) {
//           return a.order - b.order;
//         }
//         return a.completed ? -1 : 1;
//       });
//       setProjectStages(sortedStages);
//     }
//   }, [project.stages]);

//   const updatePercentage = useCallback(() => {
//     const completedStages = projectStages.filter(stage => stage.completed).length;
//     const percentage = (completedStages / projectStages.length) * 100;
//     setPercentageDone(Math.round(percentage));
//   }, [projectStages]);

//   useEffect(() => {
//     updatePercentage();
//   }, [projectStages, updatePercentage]);

//   const toggleStage = async (stage: string) => {
//     const updatedStages = projectStages.map(s => {
//       if (s.stage === stage) {
//         return { ...s, completed: !s.completed };
//       }
//       return s;
//     });

//     setProjectStages(updatedStages);
//     try {
//       await updateProjectStageMutation.mutateAsync({
//         projectId: project.id,
//         stage,
//         completed: !projectStages.find(s => s.stage === stage)?.completed,
//       });
//       refetch();
//       refetchProjects();
//     } catch (error) {
//       console.error('Error updating project stage:', error);
//     }
//   };

//   const toggleProjectCompletion = async (checked: boolean) => {
//     try {
//       await toggleProjectCompletionMutation.mutateAsync({ id: project.id, completed: checked });
//       refetchProjects();
//     } catch (error) {
//       console.error('Error toggling project completion:', error);
//     }
//   };

//   useEffect(() => {
//     if (projectWithTasks?.tasks) {
//       setTasks(projectWithTasks.tasks as Task[]);
//     }
//   }, [projectWithTasks]);

//   const handleCreateTask = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const taskData = {
//         ...newTask,
//         dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
//       };
  
//       await createTaskMutation.mutateAsync(taskData);
//       refetch();
//       setShowNewTaskForm(false);
//       setNewTask({
//         title: '',
//         description: '',
//         status: 'PENDING',
//         priority: 'MEDIUM',
//         dueDate: null,
//         projectId: project.id,
//         stageId: null,
//         teamId: project.teamId,
//         assigneeId: null
//       });
//     } catch (error) {
//       console.error('Error creating task:', error);
//     }
//   };
  
//   const toggleTask = async (taskId: number) => {
//     const taskToUpdate = tasks.find(task => task.id === taskId);
//     if (taskToUpdate) {
//       const updatedTask: TaskUpdatePayload = {
//         id: taskToUpdate.id,
//         title: taskToUpdate.title,
//         status: taskToUpdate.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED',
//         priority: taskToUpdate.priority,
//         teamId: taskToUpdate.teamId,
//         description: taskToUpdate.description,
//         dueDate: taskToUpdate.dueDate,
//         projectId: taskToUpdate.projectId,
//         stageId: taskToUpdate.stageId,
//         assigneeId: taskToUpdate.assigneeId,
//       };
//       try {
//         await updateTaskMutation.mutateAsync(updatedTask);
//         refetch();
//       } catch (error) {
//         console.error('Error updating task:', error);
//       }
//     }
//   };

//   const handleDeleteTask = async (taskId: number) => {
//     if (window.confirm('Are you sure you want to delete this task?')) {
//       try {
//         await deleteTaskMutation.mutateAsync(taskId);
//         refetch();
//       } catch (error) {
//         console.error('Error deleting task:', error);
//       }
//     }
//   };

//   const toggleTaskDescription = (taskId: number) => {
//     setExpandedTasks(prev => 
//       prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
//     );
//   };

//   const formatDate = (dateString: string | null): string => {
//     if (!dateString) return 'Not set';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
//   };

//   const handleDelete = async () => {
//     if (window.confirm('Are you sure you want to delete this project?')) {
//       try {
//         await deleteProjectMutation.mutateAsync(project.id);
//         refetchProjects();
//       } catch (error) {
//         console.error('Error deleting project:', error);
//       }
//     }
//   };

//   if (projectError) {
//     return <div>Error loading project: {projectError.message}</div>;
//   }

//   return (
//     <Card className="w-full shadow-sm mb-4">
//       <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
//         <CardTitle className="text-2xl font-bold">{project.title}</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="flex items-center space-x-2 mt-2">
//           <Switch
//             checked={project.completed}
//             onCheckedChange={toggleProjectCompletion}
//             className=""
//           />
//           <span>{project.completed ? "Completed" : "In Progress"}</span>
//         </div>

//         <div className="mb-4 p-1 pt-4">
//           <p className="inline-block mr-4">Project ID: {project.id}</p>
//           <p className="inline-block mr-4">Team ID: {project.teamId}</p>
//           <p className="inline-block">Creator ID: {project.creatorId}</p>
//         </div>
//         <Button 
//           onClick={() => setExpanded(!expanded)} 
//           variant="outline" 
//           className="w-full justify-between rounded-2xl mb-4"
//         >
//           <span>Details</span>
//           {expanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
//         </Button>
//         <div className="space-y-2">
//           <div className="flex justify-between items-center">
//             <p className='font-semibold'>Current: {project.status}</p>
//             <p>Expected Publish: {formatDate(project.endDate)}</p>
//           </div> 
//           <div className='pt-2'>
//             <Progress value={percentageDone} className="w-full" />
//           </div>
//         </div>

//         <div className="flex justify-between items-center mt-4">
//           <p>{percentageDone}% Complete</p>
//           <div className="flex space-x-2">
//             <Button onClick={() => setIsEditModalOpen(true)} variant="outline" className="border-[1px]">
//               <Edit className="w-4 h-4 mr-2" />
//               Edit
//             </Button>
//             <Button variant="outline" className="">
//               <Send className="w-4 h-4 mr-2" />
//               Publish
//             </Button>
//             <Button onClick={handleDelete} variant="destructive" className="">
//               <Trash2 className="w-4 h-4 mr-2" />
//               Delete
//             </Button>
//             <Link href={`/videos/${project.id}/${slugify(project.title)}`}>
//               <Button variant="outline" className="justify-between">
//                 Expand
//               </Button>
//             </Link>
//           </div>
//         </div>
//         <AnimatePresence>
//           {expanded && (
//             <motion.div
//               initial={{ height: 0, opacity: 0 }}
//               animate={{ height: "auto", opacity: 1 }}
//               exit={{ height: 0, opacity: 0 }}
//               transition={{ duration: 0.3 }}
//               className="mt-4"
//             >
//               <h3 className="font-bold mb-2">Production Stages</h3>
//               <div className="flex items-center space-x-2">
//                 {projectStages.map((stage, index) => (
//                   <React.Fragment key={stage.id}>
//                     <Button
//                       onClick={() => toggleStage(stage.stage)}
//                       className={`w-12 h-12 rounded-full flex items-center justify-center ${
//                         stage.completed ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-600'
//                       }`}
//                     >
//                       {stage.completed ? (
//                         <CheckCircle className="w-8 h-8" />
//                       ) : (
//                         <Circle className="w-6 h-6" />
//                       )}
//                     </Button>
//                     {index < projectStages.length - 1 && (
//                       <div className="flex-grow h-1 bg-pink-100"></div>
//                     )}
//                   </React.Fragment>
//                 ))}
//               </div>
//               <div className="flex justify-between mt-2">
//                 {projectStages.map((stage) => (
//                   <span key={stage.id} className="text-xs">{stage.stage}</span>
//                 ))}
//               </div>
//               <div className="mt-4">
//                 <h3 className="text-lg font-semibold mb-2">Tasks</h3>
//                 <Button 
//                   onClick={() => setShowNewTaskForm(!showNewTaskForm)}
//                   size="sm"
//                   className="mb-2"
//                 >
//                   {showNewTaskForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
//                   {showNewTaskForm ? 'Cancel' : 'Add New Task'}
//                 </Button>
                
//                 {showNewTaskForm && (
//                   <form onSubmit={handleCreateTask} className="space-y-2 mb-4">
//                     <Input
//                       value={newTask.title}
//                       onChange={(e) => setNewTask({...newTask, title: e.target.value})}
//                       placeholder="Task Title"
//                       required
//                     />
//                     <Input
//                       value={newTask.description || ''}
//                       onChange={(e) => setNewTask({...newTask, description: e.target.value})}
//                       placeholder="Description"
//                     />
//                     <Select
//                       value={newTask.status}
//                       onValueChange={(value) => setNewTask({...newTask, status: value as Task['status']})}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="PENDING">Pending</SelectItem>
//                         <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
//                         <SelectItem value="COMPLETED">Completed</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <Select
//                       value={newTask.priority}
//                       onValueChange={(value) => setNewTask({...newTask, priority: value as Task['priority']})}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Priority" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="LOW">Low</SelectItem>
//                         <SelectItem value="MEDIUM">Medium</SelectItem>
//                         <SelectItem value="HIGH">High</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <Input
//                       type="date"
//                       value={newTask.dueDate || ''}
//                       onChange={(e) => setNewTask({...newTask, dueDate: e.target.value || null})}
//                       placeholder="Due Date"
//                     />
//                     <Button type="submit">Add Task</Button>
//                   </form>
//                 )}
                
//                 <div className="space-y-2">
//                   {tasks.map(task => (
//                     <Card key={task.id} className="p-2">
//                       <div className="flex items-center space-x-2">
//                         <Checkbox
//                           checked={task.status === 'COMPLETED'}
//                           onCheckedChange={() => toggleTask(task.id)}
//                         />
//                         <div className="flex-grow">
//                           <p className={`font-medium ${task.status === 'COMPLETED' ? 'line-through text-gray-500' : ''}`}>
//                             {task.title}
//                           </p>
//                           {task.dueDate && <p className="text-sm">Due: {formatDate(task.dueDate)}</p>}
//                           {task.description && (
//                             <p className="text-sm text-gray-600">
//                               {expandedTasks.includes(task.id) 
//                                 ? task.description 
//                                 : `${task.description.slice(0, 40)}${task.description.length > 40 ? '...' : ''}`}
//                             </p>
//                           )}
//                         </div>
//                         {task.description && task.description.length > 40 && (
//                           <Button onClick={() => toggleTaskDescription(task.id)} size="sm" variant="ghost">
//                             {expandedTasks.includes(task.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
//                           </Button>
//                         )}
//                         <Button onClick={() => handleDeleteTask(task.id)} size="sm" variant="destructive">
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </Card>
//                   ))}
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </CardContent>
//       {isEditModalOpen && (
//         <EditProjectModal
//           project={{...project, stages: projectStages}}
//           isOpen={isEditModalOpen}
//           onClose={() => setIsEditModalOpen(false)}
//           onUpdate={() => {
//             refetch();
//             refetchProjects();
//           }}
//         />
//       )}
//     </Card>
//   );
// }





// // "use client"
// // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
// // import { Progress } from "./ui/progress";
// // import { Button } from "./ui/button";
// // import { motion, AnimatePresence } from "framer-motion";
// // import { Switch } from "./ui/switch";
// // import { CheckCircle, Plus, X, Circle, ChevronDown, ChevronUp, Send, Edit, Trash2 } from 'lucide-react';
// // import { EditProjectModal } from './EditProjectModal';
// // import { trpc } from '../trpc/client';
// // import Link from 'next/link';
// // import { slugify } from '../utils/slugify';
// // import { Input } from "./ui/input";
// // import { Checkbox } from "./ui/checkbox";

// // interface Project {
// //   id: number;
// //   title: string;
// //   description: string | null;
// //   status: 'active' | 'completed';
// //   startDate: string | null;
// //   endDate: string | null;
// //   creatorId: number;
// //   teamId: number;
// //   stages: ProjectStage[];
// //   tasks?: Task[];
// //   completed?: boolean;
// // }

// // interface Task {
// //   id: number;
// //   title: string;
// //   description: string | undefined;
// //   status: 'pending' | 'completed';
// //   dueDate: string | null;
// //   projectId: number | null;
// //   teamId: number;
// //   creatorId: number;
// //   assigneeId: number | null;
// //   createdAt: string;
// //   updatedAt: string;
// //   creationOrder: number;
// //   creator: { id: number; user: { id: number; name: string } };
// //   assignee: { id: number; user: { id: number; name: string } } | null;
// // }

// // interface ProjectStage {
// //   id: number;
// //   projectId: number;
// //   stage: string;
// //   completed: boolean;
// //   order: number;
// // }

// // interface ProjectCardProps {
// //   project: Project;
// //   refetchProjects: () => void;
// // }

// // export default function ProjectCard({ project, refetchProjects }: ProjectCardProps) {
// //   const [expanded, setExpanded] = useState(false);
// //   const [projectStages, setProjectStages] = useState<ProjectStage[]>([]);
// //   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
// //   const [percentageDone, setPercentageDone] = useState(0);
// //   const [tasks, setTasks] = useState<Task[]>([]);
// //   const [expandedTasks, setExpandedTasks] = useState<number[]>([]);
// //   const [showNewTaskForm, setShowNewTaskForm] = useState(false);
// //   const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'creationOrder' | 'creator' | 'assignee'>>({
// //     title: '',
// //     description: undefined,
// //     status: 'pending',
// //     dueDate: null,
// //     projectId: project.id,
// //     teamId: project.teamId,
// //     creatorId: project.creatorId,
// //     assigneeId: null
// //   });

// //   const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

// //   const { data: projectWithTasks, error: projectError, refetch } = trpc.projects.getById.useQuery(project.id);
// //   const deleteProjectMutation = trpc.projects.delete.useMutation();
// //   const updateProjectStageMutation = trpc.projects.updateProjectStage.useMutation();
// //   const toggleProjectCompletionMutation = trpc.projects.toggleProjectCompletion.useMutation();
// //   const createTaskMutation = trpc.tasks.create.useMutation();
// //   const updateTaskMutation = trpc.tasks.update.useMutation();
// //   const deleteTaskMutation = trpc.tasks.delete.useMutation();

// //   useEffect(() => {
// //     if (project.stages) {
// //       const sortedStages = [...project.stages].sort((a, b) => {
// //         if (a.completed === b.completed) {
// //           return a.order - b.order;
// //         }
// //         return a.completed ? -1 : 1;
// //       });
// //       setProjectStages(sortedStages);
// //     }
// //   }, [project.stages]);

// //   const updatePercentage = useCallback(() => {
// //     const completedStages = projectStages.filter(stage => stage.completed).length;
// //     const percentage = (completedStages / projectStages.length) * 100;
// //     setPercentageDone(Math.round(percentage));
// //   }, [projectStages]);

// //   useEffect(() => {
// //     updatePercentage();
// //   }, [projectStages, updatePercentage]);

// //   const toggleStage = async (stage: string) => {
// //     const updatedStages = projectStages.map(s => {
// //       if (s.stage === stage) {
// //         return { ...s, completed: !s.completed };
// //       }
// //       return s;
// //     });

// //     const sortedStages = updatedStages.sort((a, b) => {
// //       if (a.completed === b.completed) {
// //         return a.order - b.order;
// //       }
// //       return a.completed ? -1 : 1;
// //     });

// //     setProjectStages(updatedStages);
// //     try {
// //       await updateProjectStageMutation.mutateAsync({
// //         projectId: project.id,
// //         stage,
// //         completed: !projectStages.find(s => s.stage === stage)?.completed,
// //       });
// //       refetch();
// //       refetchProjects();
// //     } catch (error) {
// //       console.error('Error updating project stage:', error);
// //     }
// //   };

// //   const toggleProjectCompletion = async (checked: boolean) => {
// //     try {
// //       await toggleProjectCompletionMutation.mutateAsync({ id: project.id, completed: checked });
// //       refetchProjects();
// //     } catch (error) {
// //       console.error('Error toggling project completion:', error);
// //     }
// //   };

// //   const getCompletedWidth = (): string => {
// //     const completedStages = projectStages.filter(stage => stage.completed).length;
// //     return `${(completedStages / projectStages.length) * 100}%`;
// //   };

// //   useEffect(() => {
// //     if (projectWithTasks?.tasks) {
// //       setTasks(projectWithTasks.tasks.map(task => ({
// //         ...task,
// //         status: task.status as 'pending' | 'completed',
// //         description: task.description || undefined
// //       })));
// //     }
// //   }, [projectWithTasks]);

// //   const handleCreateTask = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     try {
// //       if (!newTask.title || newTask.teamId === undefined) {
// //         throw new Error("Missing required fields");
// //       }
  
// //       const taskData = {
// //         ...newTask,
// //         dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
// //         status: newTask.status as 'pending' | 'completed',
// //         assigneeId: newTask.assigneeId ?? undefined,
// //         teamId: newTask.teamId,
// //         projectId: newTask.projectId ?? undefined,
// //       };
  
// //       await createTaskMutation.mutateAsync(taskData);
// //       refetch();
// //       setShowNewTaskForm(false);
// //       setNewTask({
// //         title: '',
// //         description: '',
// //         status: 'pending',
// //         dueDate: null,
// //         projectId: project.id,
// //         teamId: project.teamId,
// //         creatorId: project.creatorId,
// //         assigneeId: null
// //       });
// //     } catch (error) {
// //       console.error('Error creating task:', error);
// //     }
// //   };
  
// //   const toggleTask = async (taskId: number) => {
// //     const taskToUpdate = tasks.find(task => task.id === taskId);
// //     if (taskToUpdate) {
// //       const updatedTask: Partial<Task> & { id: number } = {
// //         id: taskToUpdate.id,
// //         status: taskToUpdate.status === 'completed' ? 'pending' : 'completed',
// //         description: taskToUpdate.description ?? undefined,
// //         teamId: taskToUpdate.teamId,
// //         title: taskToUpdate.title,
// //         projectId: taskToUpdate.projectId,
// //         assigneeId: taskToUpdate.assigneeId,
// //         dueDate: taskToUpdate.dueDate,
// //       };
// //       try {
// //         await updateTaskMutation.mutateAsync(updatedTask);
// //         refetch();
// //       } catch (error) {
// //         console.error('Error updating task:', error);
// //       }
// //     }
// //   };

// //   const handleDeleteTask = async (taskId: number) => {
// //     if (window.confirm('Are you sure you want to delete this task?')) {
// //       try {
// //         await deleteTaskMutation.mutateAsync(taskId);
// //         refetch();
// //       } catch (error) {
// //         console.error('Error deleting task:', error);
// //       }
// //     }
// //   };

// //   const toggleTaskDescription = (taskId: number) => {
// //     setExpandedTasks(prev => 
// //       prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
// //     );
// //   };

// //   const formatDate = (dateString: string | null): string => {
// //     if (!dateString) return 'Not set';
// //     const date = new Date(dateString);
// //     return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
// //   };

// //   const handleDelete = async () => {
// //     if (window.confirm('Are you sure you want to delete this project?')) {
// //       try {
// //         await deleteProjectMutation.mutateAsync(project.id);
// //         refetchProjects();
// //       } catch (error) {
// //         console.error('Error deleting project:', error);
// //       }
// //     }
// //   };

// //   if (projectError) {
// //     return <div>Error loading project: {projectError.message}</div>;
// //   }

// //   return (
// //     <Card className="w-full shadow-sm mb-4">
// //       <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
// //         <CardTitle className="text-2xl font-bold">{project.title}</CardTitle>
// //       </CardHeader>
// //       <CardContent>
// //         <div className="flex items-center space-x-2 mt-2">
// //           <Switch
// //             checked={project.completed}
// //             onCheckedChange={toggleProjectCompletion}
// //             className=""
// //           />
// //           <span>{project.completed ? "Completed" : "In Progress"}</span>
// //         </div>

// //         <div className="mb-4 p-1 pt-4">
// //           <p className="inline-block mr-4">Project ID: {project.id}</p>
// //           <p className="inline-block mr-4">Team ID: {project.teamId}</p>
// //           <p className="inline-block">Creator ID: {project.creatorId}</p>
// //         </div>
// //         <Button 
// //           onClick={() => setExpanded(!expanded)} 
// //           variant="outline" 
// //           className="w-full justify-between rounded-2xl mb-4"
// //         >
// //           <span>Details</span>
// //           {expanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
// //         </Button>
// //         <div className="space-y-2">
// //           <div className="flex justify-between items-center">
// //             <p className='font-semibold'>Current: {project.status}</p>
// //             <p>Expected Publish: {formatDate(project.endDate)}</p>
// //           </div> 
// //           <div className='pt-2'>
// //             <Progress value={percentageDone} className="w-full" />
// //           </div>
// //         </div>

// //         <div className="flex justify-between items-center mt-4">
// //           <p>{percentageDone}% Complete</p>
// //           <div className="flex space-x-2">
// //             <Button onClick={() => setIsEditModalOpen(true)} variant="outline" className="border-[1px]">
// //               <Edit className="w-4 h-4 mr-2" />
// //               Edit
// //             </Button>
// //             <Button variant="outline" className="">
// //               <Send className="w-4 h-4 mr-2" />
// //               Publish
// //             </Button>
// //             <Button onClick={handleDelete} variant="destructive" className="">
// //               <Trash2 className="w-4 h-4 mr-2" />
// //               Delete
// //             </Button>
// //             <Link href={`/videos/${project.id}/${slugify(project.title)}`}>
// //               <Button variant="outline" className="justify-between">
// //                 Expand
// //               </Button>
// //             </Link>
// //           </div>
// //         </div>
// //         <AnimatePresence>
// //           {expanded && (
// //             <motion.div
// //               initial={{ height: 0, opacity: 0 }}
// //               animate={{ height: "auto", opacity: 1 }}
// //               exit={{ height: 0, opacity: 0 }}
// //               transition={{ duration: 0.3 }}
// //               className="mt-4"
// //             >
// //               <h3 className="font-bold mb-2">Production Stages</h3>
// //               <div className="flex items-center space-x-2">
// //                 {projectStages.map((stage, index) => (
// //                   <React.Fragment key={stage.id}>
// //                     <Button
// //                       onClick={() => toggleStage(stage.stage)}
// //                       className={`w-12 h-12 rounded-full flex items-center justify-center ${
// //                         stage.completed ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-600'
// //                       }`}
// //                     >
// //                       {stage.completed ? (
// //                         <CheckCircle className="w-8 h-8" />
// //                       ) : (
// //                         <Circle className="w-6 h-6" />
// //                       )}
// //                     </Button>
// //                     {index < projectStages.length - 1 && (
// //                       <div className="flex-grow h-1 bg-pink-100"></div>
// //                     )}
// //                   </React.Fragment>
// //                 ))}
// //               </div>
// //               <div className="flex justify-between mt-2">
// //                 {projectStages.map((stage) => (
// //                   <span key={stage.id} className="text-xs">{stage.stage}</span>
// //                 ))}
// //               </div>
// //               <div className="mt-4">
// //                 <h3 className="text-lg font-semibold mb-2">Tasks</h3>
// //                 <Button 
// //                   onClick={() => setShowNewTaskForm(!showNewTaskForm)}
// //                   size="sm"
// //                   className="mb-2"
// //                 >
// //                   {showNewTaskForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
// //                   {showNewTaskForm ? 'Cancel' : 'Add New Task'}
// //                 </Button>
                
// //                 {showNewTaskForm && (
// //                   <form onSubmit={handleCreateTask} className="space-y-2 mb-4">
// //                     <Input
// //                       value={newTask.title}
// //                       onChange={(e) => setNewTask({...newTask, title: e.target.value})}
// //                       placeholder="Task Title"
// //                       required
// //                     />
// //                     <Input
// //                           value={newTask.description || ''}
// //                           onChange={(e) => setNewTask({...newTask, description: e.target.value})}
// //                           placeholder="Description"
// //                         />
// //                         <Input
// //                           type="date"
// //                           value={newTask.dueDate || ''}
// //                           onChange={(e) => setNewTask({...newTask, dueDate: e.target.value || null})}
// //                           placeholder="Due Date"
// //                         />
// //                         <Button type="submit">Add Task</Button>
// //                       </form>
// //                     )}
                    
// //                     <div className="space-y-2">
// //                       {tasks.map(task => (
// //                         <Card key={task.id} className="p-2">
// //                           <div className="flex items-center space-x-2">
// //                             <Checkbox
// //                               checked={task.status === 'completed'}
// //                               onCheckedChange={() => toggleTask(task.id)}
// //                             />
// //                             <div className="flex-grow">
// //                               <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
// //                                 {task.title}
// //                               </p>
// //                               {task.dueDate && <p className="text-sm">Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
// //                               {task.description && (
// //                                 <p className="text-sm text-gray-600">
// //                                   {expandedTasks.includes(task.id) 
// //                                     ? task.description 
// //                                     : `${task.description.slice(0, 40)}${task.description.length > 40 ? '...' : ''}`}
// //                                 </p>
// //                               )}
// //                             </div>
// //                             {task.description && task.description.length > 40 && (
// //                               <Button onClick={() => toggleTaskDescription(task.id)} size="sm" variant="ghost">
// //                                 {expandedTasks.includes(task.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
// //                               </Button>
// //                             )}
// //                             <Button onClick={() => handleDeleteTask(task.id)} size="sm" variant="destructive">
// //                               <Trash2 className="h-4 w-4" />
// //                             </Button>
// //                           </div>
// //                         </Card>
// //                       ))}
// //                     </div>
// //                     </div>
// //                     </motion.div>
// //                     )}
// //                     </AnimatePresence>
                    
// //                     </CardContent>
// //                     {isEditModalOpen && (
// //                     <EditProjectModal
// //                     project={{...project, stages: projectStages}}
// //                     isOpen={isEditModalOpen}
// //                     onClose={() => setIsEditModalOpen(false)}
// //                     onUpdate={() => {
// //                     refetch();
// //                     refetchProjects();
// //                     }}
// //                     />
// //                     )}
// //                     </Card>
// //                     );
// //                     }