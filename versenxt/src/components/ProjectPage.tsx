import React, { useState } from 'react';
import { trpc } from '../utils/trpc';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useRouter } from 'next/navigation';

const ProjectSection: React.FC = () => {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    status: 'active',
    startDate: '',
    endDate: '',
    duration: '',
    teamId: 0, // This should be set to the current team's ID
    mainStages: [
      {
        name: 'IDEATION',
        subStages: [
          { name: 'Concept', enabled: true, starred: false },
          { name: 'Key Points', enabled: true, starred: false },
          { name: 'Research and Reference', enabled: true, starred: false },
          { name: 'Inspiration Board', enabled: true, starred: false },
        ]
      },
      {
        name: 'PRE_PRODUCTION',
        subStages: [
          { name: 'Script', enabled: true, starred: false },
          { name: 'Keyword Research', enabled: true, starred: false },
          { name: 'Equipment Checklist', enabled: true, starred: false },
          { name: 'Storyboard', enabled: true, starred: false },
        ]
      },
      {
        name: 'PRODUCTION',
        subStages: [
          { name: 'Filming Schedule', enabled: true, starred: false },
          { name: 'B-Roll Ideas', enabled: true, starred: false },
          { name: 'Shot List', enabled: true, starred: false },
          { name: 'Production Notes', enabled: true, starred: false },
        ]
      },
      {
        name: 'POST_PRODUCTION',
        subStages: [
          { name: 'Editing Progress', enabled: true, starred: false },
          { name: 'Thumbnail Creator', enabled: true, starred: false },
          { name: 'Subtitle', enabled: true, starred: false },
          { name: 'Export Settings', enabled: true, starred: false },
        ]
      },
      {
        name: 'PUBLISHING',
        subStages: [
          { name: 'Video Details', enabled: true, starred: false },
          { name: 'Publishing Schedule', enabled: true, starred: false },
          { name: 'Subtitles', enabled: true, starred: false },
          { name: 'Cross Platform Sharing', enabled: true, starred: false },
          { name: 'Monetization', enabled: true, starred: false },
        ]
      },
    ]
  });

  const { data: projects, isLoading, error, refetch } = trpc.projects.getAll.useQuery();
  const createProject = trpc.projects.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreateDialogOpen(false);
      setNewProject({
        ...newProject,
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        duration: '',
      });
    },
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject.mutateAsync(newProject);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  if (isLoading) return <div>Loading projects...</div>;
  if (error) return <div>Error loading projects: {error.message}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <Input
                placeholder="Project Title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                required
              />
              <Textarea
                placeholder="Project Description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
              <Select
                value={newProject.status}
                onValueChange={(value) => setNewProject({ ...newProject, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                placeholder="Start Date"
                value={newProject.startDate}
                onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
              />
              <Input
                type="date"
                placeholder="End Date"
                value={newProject.endDate}
                onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
              />
              <Input
                placeholder="Duration (e.g., 2 weeks)"
                value={newProject.duration}
                onChange={(e) => setNewProject({ ...newProject, duration: e.target.value })}
              />
              <Button type="submit">Create Project</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map((project) => (
          <Card key={project.id} className="cursor-pointer" onClick={() => router.push(`/projects/${project.id}`)}>
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>{project.status}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{project.description}</p>
              <p>Start Date: {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</p>
              <p>End Date: {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}</p>
              <p>Duration: {project.duration}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProjectSection;




// // components/ProjectPage.tsx
// "use client"

// import React, { useState, useEffect } from 'react';
// import { trpc } from '../trpc/client';
// import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
// import { Progress } from "./ui/progress";
// import { CheckCircle, Circle, Calendar, Users, User } from 'lucide-react';

// interface ProjectStage {
//   id: number;
//   projectId: number;
//   stage: string;
//   completed: boolean;
//   order: number;
// }

// interface Task {
//   id: number;
//   title: string;
//   status: 'pending' | 'completed';
//   description: string | undefined;
//   dueDate: string | null;
//   projectId: number | null;
//   teamId: number| undefined;
//   creatorId: number;
//   assigneeId: number | null;
// }

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

// interface ProjectPageProps {
//   projectId: number;
// }

// const ProjectPage: React.FC<ProjectPageProps> = ({ projectId }) => {
//   const { data: project, isLoading, refetch } = trpc.projects.getById.useQuery(projectId);
//   const [projectStages, setProjectStages] = useState<ProjectStage[]>([]);
//   const [percentageDone, setPercentageDone] = useState(0);

//   const updateProjectStageMutation = trpc.projects.updateProjectStage.useMutation({
//     onSuccess: () => {
//       refetch();
//     },
//   });

//   useEffect(() => {
//     if (project?.stages) {
//       const sortedStages = [...project.stages].sort((a, b) => {
//         if (a.completed === b.completed) {
//           return a.order - b.order;
//         }
//         return a.completed ? -1 : 1;
//       });
//       setProjectStages(sortedStages);
//     }
//   }, [project]);

//   useEffect(() => {
//     const completedStages = projectStages.filter(stage => stage.completed).length;
//     const percentage = (completedStages / projectStages.length) * 100;
//     setPercentageDone(Math.round(percentage));
//   }, [projectStages]);

//   const toggleStage = (stageId: number) => {
//     const updatedStages = projectStages.map(s => {
//       if (s.id === stageId) {
//         return { ...s, completed: !s.completed };
//       }
//       return s;
//     });
//     setProjectStages(updatedStages);

//     const stage = updatedStages.find(s => s.id === stageId);
//     if (stage) {
//       updateProjectStageMutation.mutate({
//         projectId: projectId,
//         stage: stage.stage,
//         completed: stage.completed,
//       });
//     }
//   };

//   if (isLoading) return <div>Loading...</div>;
//   if (!project) return <div>Project not found</div>;

//   const formatDate = (dateString: string | null): string => {
//     if (!dateString) return 'Not set';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
//   };

//   return (
//     <div className="container mx-auto p-1">
//       <Card className="mb-4">
//         <CardHeader>
//           <CardTitle>{project.title}</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="text-gray-600 mb-4">{project.description}</p>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <p><strong>Status:</strong> {project.status}</p>
//               <p><strong>Start Date:</strong> {formatDate(project.startDate)}</p>
//               <p><strong>End Date:</strong> {formatDate(project.endDate)}</p>
//             </div>
//             <div>
//               <p><strong>Project ID:</strong> {project.id}</p>
//               <p><strong>Team ID:</strong> {project.teamId}</p>
//               <p><strong>Creator ID:</strong> {project.creatorId}</p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* <Card className="mb-6">
//         <CardHeader>
//           <CardTitle>Progress</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Progress value={percentageDone} className="w-full" />
//           <p className="text-center mt-2">{percentageDone}% Complete</p>
//         </CardContent>
//       </Card> */}

//       <Card className="mb-4">
//         <CardHeader>
//           <CardTitle>Production Stages</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex flex-wrap gap-4">
//             {projectStages.map((stage, index) => (
//               <div key={stage.id} className="flex items-center">
//                 <div
//                   onClick={() => toggleStage(stage.id)}
//                   className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer ${
//                     stage.completed ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
//                   }`}
//                 >
//                   {stage.completed ? <CheckCircle /> : <Circle />}
//                 </div>
//                 <span className="ml-2">{stage.stage}</span>
//                 {index < projectStages.length - 1 && (
//                   <div className="w-8 h-0.5 bg-gray-300 mx-2" />
//                 )}
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       {project.tasks && project.tasks.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Tasks</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ul className="list-disc pl-5">
//               {project.tasks.map((task) => (
//                 <li key={task.id} className="mb-2">
//                   <div className="flex justify-between items-center">
//                     <span>{task.title} - {task.status}</span>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// };

// export default ProjectPage;
