"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "./ui/switch";
import { CheckCircle, Plus, X, Circle, ChevronDown, ChevronUp, Send, Edit, Trash2 } from 'lucide-react';
import { EditProjectModal } from './EditProjectModal';
import { trpc } from '../trpc/client';
import Link from 'next/link';
import { slugify } from '../utils/slugify';
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";

interface Project {
  id: number;
  title: string;
  description: string | null;
  status: 'active' | 'completed';
  startDate: string | null;
  endDate: string | null;
  creatorId: number;
  teamId: number;
  stages: ProjectStage[];
  tasks?: Task[];
  completed?: boolean;
}

interface Task {
  id: number;
  title: string;
  description: string | undefined;
  status: 'pending' | 'completed';
  dueDate: string | null;
  projectId: number | null;
  teamId: number;
  creatorId: number;
  assigneeId: number | null;
  createdAt: string;
  updatedAt: string;
  creationOrder: number;
  creator: { id: number; user: { id: number; name: string } };
  assignee: { id: number; user: { id: number; name: string } } | null;
}
interface ProjectStage {
  id: number;
  projectId: number;
  stage: string;
  completed: boolean;
  order: number;
}
interface ProjectCardProps {
  project: Project;
  refetchProjects: () => void;
}

export default function ProjectCard({ project, refetchProjects }: ProjectCardProps) {


    const [expanded, setExpanded] = useState(false);
    const [projectStages, setProjectStages] = useState<ProjectStage[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [percentageDone, setPercentageDone] = useState(0);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [expandedTasks, setExpandedTasks] = useState<number[]>([]);
    const [showNewTaskForm, setShowNewTaskForm] = useState(false);
    const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'creationOrder' | 'creator' | 'assignee'>>({
      title: '',
      description: undefined,
      status: 'pending',
      dueDate: null,
      projectId: project.id,
      teamId: project.teamId,
      creatorId: project.creatorId,
      assigneeId: null
    });

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const { data: projectWithTasks, refetch } = trpc.projects.getById.useQuery(project.id);
    const deleteProjectMutation = trpc.projects.delete.useMutation();
    const updateProjectStageMutation = trpc.projects.updateProjectStage.useMutation({
      onSuccess: () => {
        refetch();
        refetchProjects();
      },
    });


    useEffect(() => {
      if (project.stages) {
        const sortedStages = [...project.stages].sort((a, b) => {
          if (a.completed === b.completed) {
            return a.order - b.order;
          }
          return a.completed ? -1 : 1;
        });
        setProjectStages(sortedStages);
      }
    }, [project.stages]);

    const updatePercentage = useCallback(() => {
      const completedStages = projectStages.filter(stage => stage.completed).length;
      const percentage = (completedStages / projectStages.length) * 100;
      setPercentageDone(Math.round(percentage));
    }, [projectStages]);

    useEffect(() => {
      updatePercentage();
    }, [projectStages, updatePercentage]);

    const toggleStage = (stage: string) => {
      const updatedStages = projectStages.map(s => {
        if (s.stage === stage) {
          return { ...s, completed: !s.completed };
        }
        return s;
      });

    const sortedStages = updatedStages.sort((a, b) => {
      if (a.completed === b.completed) {
        return a.order - b.order;
      }
      return a.completed ? -1 : 1;
    });

        setProjectStages(updatedStages);
        updateProjectStageMutation.mutate({
          projectId: project.id,
          stage,
          completed: !projectStages.find(s => s.stage === stage)?.completed,
        });
      };

      const toggleProjectCompletion = trpc.projects.toggleProjectCompletion.useMutation({
        onSuccess: () => {
          refetchProjects();
        },
      });

      const getCompletedWidth = (): string => {
        const completedStages = projectStages.filter(stage => stage.completed).length;
        return `${(completedStages / projectStages.length) * 100}%`;
      };

      const createTaskMutation = trpc.tasks.create.useMutation({
        onSuccess: () => {
          refetch();
          setShowNewTaskForm(false);
          setNewTask({
            title: '',
            description: '',
            status: 'pending',
            dueDate: null,
            projectId: project.id,
            teamId: project.teamId,
            creatorId: project.creatorId,
            assigneeId: null
          });
        },
      });
      const updateTaskMutation = trpc.tasks.update.useMutation({
        onSuccess: () => refetch(),
      });
      const deleteTaskMutation = trpc.tasks.delete.useMutation({
        onSuccess: () => refetch(),
      });


      useEffect(() => {
        if (projectWithTasks?.tasks) {
          setTasks(projectWithTasks.tasks.map(task => ({
            ...task,
            status: task.status as 'pending' | 'completed',
            description: task.description || undefined
          })));
        }
      }, [projectWithTasks]);

      const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          if (!newTask.title || newTask.teamId === undefined) {
            throw new Error("Missing required fields");
          }
      
          const taskData = {
            ...newTask,
            dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
            status: newTask.status as 'pending' | 'completed',
            assigneeId: newTask.assigneeId ?? undefined,
            teamId: newTask.teamId, // This is now guaranteed to be a number
            projectId: newTask.projectId ?? undefined, // Ensure this is undefined if null
          };
      
          await createTaskMutation.mutateAsync(taskData);
        } catch (error) {
          console.error('Error creating task:', error);
        }
      };
      
      const toggleTask = async (taskId: number) => {
        const taskToUpdate = tasks.find(task => task.id === taskId);
        if (taskToUpdate) {
          const updatedTask: Partial<Task> & { id: number } = {
            id: taskToUpdate.id,
            status: taskToUpdate.status === 'completed' ? 'pending' : 'completed',
            description: taskToUpdate.description ?? undefined, // Convert null to undefined
            teamId: taskToUpdate.teamId,
            title: taskToUpdate.title,
            projectId: taskToUpdate.projectId,
            assigneeId: taskToUpdate.assigneeId,
            dueDate: taskToUpdate.dueDate,
          };
          await updateTaskMutation.mutateAsync(updatedTask);
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

      const toggleTaskDescription = (taskId: number) => {
        setExpandedTasks(prev => 
          prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
        );
      };
          const formatDate = (dateString: string | null): string => {
            if (!dateString) return 'Not set';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          };

      const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this project?')) {
          try {
            await deleteProjectMutation.mutateAsync(project.id);
            refetchProjects();
          } catch (error) {
            console.error('Error deleting project:', error);
          }
        }
      };

      return (
        <Card className="w-full  shadow-sm mb-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-2xl font-bold">{project.title}</CardTitle>
           
          </CardHeader>
          <CardContent>
            

          <div className="flex items-center space-x-2 mt-2">
      <Switch
        checked={project.completed}
        onCheckedChange={(checked) => {
          toggleProjectCompletion.mutate({ id: project.id, completed: checked });
        }}
        className=""
      />
      <span>{project.completed ? "Completed" : "In Progress"}</span>
    </div>


    <div className="mb-4 p-1 pt-4">
  <p className="inline-block mr-4">Project ID: {project.id}</p>
  <p className="inline-block mr-4">Team ID: {project.teamId}</p>
  <p className="inline-block">Creator ID: {project.creatorId}</p>
</div>
            <Button 
              onClick={() => setExpanded(!expanded)} 
              variant="outline" 
              className="w-full  justify-between rounded-2xl mb-4"
            >
              <span>Details</span>
              {expanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </Button>
          <div className="space-y-2">
             <div className="flex justify-between items-center">
                <p className='font-semibold'>Current: {project.status}</p>
               <p>Expected Publish: {formatDate(project.endDate)}</p>
 
              </div > 
        <div className='pt-2'> <Progress value={percentageDone} className="w-full" />
       </div>
        </div>

    <div className="flex justify-between items-center mt-4">
      
           <p>{percentageDone}% Complete</p>
          <div className="flex space-x-2">
            <Button onClick={() => setIsEditModalOpen(true)} variant="outline" className=" border-[1px] ">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" className="">
              <Send className="w-4 h-4 mr-2" />
              Publish
            </Button>
            <Button onClick={handleDelete} variant="destructive" className="">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Link href={`/videos/${project.id}/${slugify(project.title)}`}>
              <Button variant="outline" className="justify-between">
                Expand
              </Button>
            </Link>
          </div>
        </div>
            <AnimatePresence>
              {expanded && (
                 <motion.div
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: "auto", opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 transition={{ duration: 0.3 }}
                 className="mt-4"
               >
                  <h3 className="font-bold mb-2">Production Stages</h3>
                  <div className="flex items-center space-x-2">
                    {projectStages.map((stage, index) => (
                      <React.Fragment key={stage.id}>
                        <Button
                          onClick={() => toggleStage(stage.stage)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            stage.completed ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {stage.completed ? (
                            <CheckCircle className="w-8 h-8" />
                          ) : (
                            <Circle className="w-6 h-6" />
                          )}
                        </Button>
                        {index < projectStages.length - 1 && (
                          <div className="flex-grow h-1 bg-pink-100"></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {projectStages.map((stage) => (
                      <span key={stage.id} className="text-xs">{stage.stage}</span>
                    ))}
                  </div>
                  <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Tasks</h3>
              <Button 
                onClick={() => setShowNewTaskForm(!showNewTaskForm)}
                size="sm"
                className="mb-2"
              >
                {showNewTaskForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {showNewTaskForm ? 'Cancel' : 'Add New Task'}
              </Button>
              
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
                    placeholder="Due Date"
                  />
                  <Button type="submit">Add Task</Button>
                </form>
              )}
              
              <div className="space-y-2">
                {tasks.map(task => (
                  <Card key={task.id} className="p-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={task.status === 'completed'}
                        onCheckedChange={() => toggleTask(task.id)}
                      />
                      <div className="flex-grow">
                        <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
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
                      {task.description && task.description.length > 40 && (
                        <Button onClick={() => toggleTaskDescription(task.id)} size="sm" variant="ghost">
                          {expandedTasks.includes(task.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      )}
                      <Button onClick={() => handleDeleteTask(task.id)} size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

          </CardContent>
          {isEditModalOpen && (
      <EditProjectModal
        project={{...project, stages: projectStages}}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={() => {
          refetch();
          refetchProjects();
        }}
      />
    )}
        </Card>
      );
    }












//       return (
//         <Card className="w-full bg-[#f8f8f8] border-0 shadow-sm rounded-2xl mb-4">
//           <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
//             <CardTitle className="text-2xl font-bold">{project.title}</CardTitle>
           
//           </CardHeader>
//           <CardContent>
            

//           <div className="flex items-center space-x-2 mt-2">
//       <Switch
//         checked={project.completed}
//         onCheckedChange={(checked) => {
//           toggleProjectCompletion.mutate({ id: project.id, completed: checked });
//         }}
//         className=""
//       />
//       <span>{project.completed ? "Completed" : "In Progress"}</span>
//     </div>


//     <div className="mb-4 p-1 pt-4">
//   <p className="inline-block mr-4">Project ID: {project.id}</p>
//   <p className="inline-block mr-4">Team ID: {project.teamId}</p>
//   <p className="inline-block">Creator ID: {project.creatorId}</p>
// </div>
//             <Button 
//               onClick={() => setExpanded(!expanded)} 
//               variant="outline" 
//               className="w-full bg-[#F0F8FF] justify-between rounded-2xl mb-4"
//             >
//               <span>Details</span>
//               {expanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
//             </Button>
//           <div className="space-y-2">
//              <div className="flex justify-between items-center">
//                 <p className='font-semibold'>Current: {project.status}</p>
//                <p>Expected Publish: {formatDate(project.endDate)}</p>
 
//               </div > 
//         <div className='pt-2'> <Progress value={percentageDone} className="w-full" />
//        </div>
//         </div>

//     <div className="flex justify-between items-center mt-4">
      
//            <p>{percentageDone}% Complete</p>
//           <div className="flex space-x-2">
//             <Button onClick={() => setIsEditModalOpen(true)} variant="outline" className=" border-[1px] border-[#B3CCEB] rounded-3xl">
//               <Edit className="w-4 h-4 mr-2" />
//               Edit
//             </Button>
//             <Button variant="outline" className="bg-[#B3E5FC] rounded-3xl">
//               <Send className="w-4 h-4 mr-2" />
//               Publish
//             </Button>
//             <Button onClick={handleDelete} variant="outline" className="rounded-3xl bg-[#ec6058]">
//               <Trash2 className="w-4 h-4 mr-2" />
//               Delete
//             </Button>
//             <Link href={`/projects/${project.id}/${slugify(project.title)}`}>
//               <Button variant="outline" className="justify-between bg-gray-100  rounded-3xl">
//                 Expand
//               </Button>
//             </Link>
//           </div>
//         </div>
//             <AnimatePresence>
//               {expanded && (
//                  <motion.div
//                  initial={{ height: 0, opacity: 0 }}
//                  animate={{ height: "auto", opacity: 1 }}
//                  exit={{ height: 0, opacity: 0 }}
//                  transition={{ duration: 0.3 }}
//                  className="mt-4"
//                >
//                   <h3 className="font-bold mb-2">Production Stages</h3>
//                   <div className="flex items-center space-x-2">
//                     {projectStages.map((stage, index) => (
//                       <React.Fragment key={stage.id}>
//                         <Button
//                           onClick={() => toggleStage(stage.stage)}
//                           className={`w-12 h-12 rounded-full flex items-center justify-center ${
//                             stage.completed ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-600'
//                           }`}
//                         >
//                           {stage.completed ? (
//                             <CheckCircle className="w-8 h-8" />
//                           ) : (
//                             <Circle className="w-6 h-6" />
//                           )}
//                         </Button>
//                         {index < projectStages.length - 1 && (
//                           <div className="flex-grow h-1 bg-pink-100"></div>
//                         )}
//                       </React.Fragment>
//                     ))}
//                   </div>
//                   <div className="flex justify-between mt-2">
//                     {projectStages.map((stage) => (
//                       <span key={stage.id} className="text-xs">{stage.stage}</span>
//                     ))}
//                   </div>
//                   <div className="mt-4">
//               <h3 className="text-lg font-semibold mb-2">Tasks</h3>
//               <Button 
//                 onClick={() => setShowNewTaskForm(!showNewTaskForm)}
//                 size="sm"
//                 className="mb-2"
//               >
//                 {showNewTaskForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
//                 {showNewTaskForm ? 'Cancel' : 'Add New Task'}
//               </Button>
              
//               {showNewTaskForm && (
//                 <form onSubmit={handleCreateTask} className="space-y-2 mb-4">
//                   <Input
//                     value={newTask.title}
//                     onChange={(e) => setNewTask({...newTask, title: e.target.value})}
//                     placeholder="Task Title"
//                     required
//                   />
//                   <Input
//                     value={newTask.description || ''}
//                     onChange={(e) => setNewTask({...newTask, description: e.target.value})}
//                     placeholder="Description"
//                   />
//                   <Input
//                     type="date"
//                     value={newTask.dueDate || ''}
//                     onChange={(e) => setNewTask({...newTask, dueDate: e.target.value || null})}
//                     placeholder="Due Date"
//                   />
//                   <Button type="submit">Add Task</Button>
//                 </form>
//               )}
              
//               <div className="space-y-2">
//                 {tasks.map(task => (
//                   <Card key={task.id} className="p-2">
//                     <div className="flex items-center space-x-2">
//                       <Checkbox
//                         checked={task.status === 'completed'}
//                         onCheckedChange={() => toggleTask(task.id)}
//                       />
//                       <div className="flex-grow">
//                         <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
//                           {task.title}
//                         </p>
//                         {task.dueDate && <p className="text-sm">Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
//                         {task.description && (
//                           <p className="text-sm text-gray-600">
//                             {expandedTasks.includes(task.id) 
//                               ? task.description 
//                               : `${task.description.slice(0, 40)}${task.description.length > 40 ? '...' : ''}`}
//                           </p>
//                         )}
//                       </div>
//                       {task.description && task.description.length > 40 && (
//                         <Button onClick={() => toggleTaskDescription(task.id)} size="sm" variant="ghost">
//                           {expandedTasks.includes(task.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
//                         </Button>
//                       )}
//                       <Button onClick={() => handleDeleteTask(task.id)} size="sm" variant="destructive">
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </Card>
//                 ))}
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//           </CardContent>
//           {isEditModalOpen && (
//       <EditProjectModal
//         project={{...project, stages: projectStages}}
//         isOpen={isEditModalOpen}
//         onClose={() => setIsEditModalOpen(false)}
//         onUpdate={() => {
//           refetch();
//           refetchProjects();
//         }}
//       />
//     )}
//         </Card>
//       );
//     }