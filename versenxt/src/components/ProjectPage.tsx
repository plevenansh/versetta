// import React, { useState } from 'react';
// import { trpc } from '../utils/trpc';
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Textarea } from "./ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
// import { useRouter } from 'next/navigation';


// interface ProjectPageProps {
//   projectId: number;
// }

// const ProjectSection: React.FC = () => {
//   const router = useRouter();
//   const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
//   const [newProject, setNewProject] = useState({
//     title: '',
//     description: '',
//     status: 'active',
//     startDate: '',
//     endDate: '',
//     duration: '',
//     teamId: 0, // This should be set to the current team's ID
//     mainStages: [
//       {
//         name: 'IDEATION',
//         subStages: [
//           { name: 'Concept', enabled: true, starred: false },
//           { name: 'Key Points', enabled: true, starred: false },
//           { name: 'Research and Reference', enabled: true, starred: false },
//           { name: 'Inspiration Board', enabled: true, starred: false },
//         ]
//       },
//       {
//         name: 'PRE_PRODUCTION',
//         subStages: [
//           { name: 'Script', enabled: true, starred: false },
//           { name: 'Keyword Research', enabled: true, starred: false },
//           { name: 'Equipment Checklist', enabled: true, starred: false },
//           { name: 'Storyboard', enabled: true, starred: false },
//         ]
//       },
//       {
//         name: 'PRODUCTION',
//         subStages: [
//           { name: 'Filming Schedule', enabled: true, starred: false },
//           { name: 'B-Roll Ideas', enabled: true, starred: false },
//           { name: 'Shot List', enabled: true, starred: false },
//           { name: 'Production Notes', enabled: true, starred: false },
//         ]
//       },
//       {
//         name: 'POST_PRODUCTION',
//         subStages: [
//           { name: 'Editing Progress', enabled: true, starred: false },
//           { name: 'Thumbnail Creator', enabled: true, starred: false },
//           { name: 'Subtitle', enabled: true, starred: false },
//           { name: 'Export Settings', enabled: true, starred: false },
//         ]
//       },
//       {
//         name: 'PUBLISHING',
//         subStages: [
//           { name: 'Video Details', enabled: true, starred: false },
//           { name: 'Publishing Schedule', enabled: true, starred: false },
//           { name: 'Subtitles', enabled: true, starred: false },
//           { name: 'Cross Platform Sharing', enabled: true, starred: false },
//           { name: 'Monetization', enabled: true, starred: false },
//         ]
//       },
//     ]
//   });

//   const { data: projects, isLoading, error, refetch } = trpc.projects.getAll.useQuery();
//   const createProject = trpc.projects.create.useMutation({
//     onSuccess: () => {
//       refetch();
//       setIsCreateDialogOpen(false);
//       setNewProject({
//         ...newProject,
//         title: '',
//         description: '',
//         startDate: '',
//         endDate: '',
//         duration: '',
//       });
//     },
//   });

//   const handleCreateProject = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await createProject.mutateAsync(newProject);
//     } catch (error) {
//       console.error('Failed to create project:', error);
//     }
//   };

//   if (isLoading) return <div>Loading projects...</div>;
//   if (error) return <div>Error loading projects: {error.message}</div>;

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-2xl font-bold">Projects</h2>
//         <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
//           <DialogTrigger asChild>
//             <Button>Create New Project</Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Create New Project</DialogTitle>
//             </DialogHeader>
//             <form onSubmit={handleCreateProject} className="space-y-4">
//               <Input
//                 placeholder="Project Title"
//                 value={newProject.title}
//                 onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
//                 required
//               />
//               <Textarea
//                 placeholder="Project Description"
//                 value={newProject.description}
//                 onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
//               />
//               <Select
//                 value={newProject.status}
//                 onValueChange={(value) => setNewProject({ ...newProject, status: value })}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="active">Active</SelectItem>
//                   <SelectItem value="completed">Completed</SelectItem>
//                   <SelectItem value="on_hold">On Hold</SelectItem>
//                 </SelectContent>
//               </Select>
//               <Input
//                 type="date"
//                 placeholder="Start Date"
//                 value={newProject.startDate}
//                 onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
//               />
//               <Input
//                 type="date"
//                 placeholder="End Date"
//                 value={newProject.endDate}
//                 onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
//               />
//               <Input
//                 placeholder="Duration (e.g., 2 weeks)"
//                 value={newProject.duration}
//                 onChange={(e) => setNewProject({ ...newProject, duration: e.target.value })}
//               />
//               <Button type="submit">Create Project</Button>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {projects?.map((project) => (
//           <Card key={project.id} className="cursor-pointer" onClick={() => router.push(`/projects/${project.id}`)}>
//             <CardHeader>
//               <CardTitle>{project.title}</CardTitle>
//               <CardDescription>{project.status}</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <p>{project.description}</p>
//               <p>Start Date: {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</p>
//               <p>End Date: {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}</p>
//               <p>Duration: {project.duration}</p>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ProjectSection;



