// ProjectSection.tsx
"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Checkbox } from "./ui/checkbox";
import ProjectCard from './ProjectCard';
import { trpc } from '../utils/trpc';
import { Plus,Trash2, Minus } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description?: string | null;
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

interface NewProject {
  title: string;
  description: string;
  endDate: string;
  teamId: number;
  duration: string;
  mainStages: MainStage[];
}

const defaultMainStages: MainStage[] = [
  {
    id: 0,
    projectId: 0,
    name: 'Ideation',
    starred: false,
    subStages: [
      { id: 0, mainStageId: 0, projectId: 0, name: 'Concept', enabled: true, starred: false, content: null },
      { id: 0, mainStageId: 0, projectId: 0, name: 'Key Points', enabled: true, starred: false, content: null },
      { id: 0, mainStageId: 0, projectId: 0, name: 'Research & Reference', enabled: true, starred: false, content: null },
      { id: 0, mainStageId: 0, projectId: 0, name: 'Inspiration Board', enabled: true, starred: false, content: null },
    ]
  },
  {
    id: 0,
    projectId: 0,
    name: 'Pre-Production',
    starred: false,
    subStages: [
      { id: 0, mainStageId: 0, projectId: 0, name: 'Script', enabled: true, starred: false, content: null },
      { id: 0, mainStageId: 0, projectId: 0, name: 'Keyword Research', enabled: true, starred: false, content: null },
      { id: 0, mainStageId: 0, projectId: 0, name: 'Equipment Checklist', enabled: true, starred: false, content: null },
      { id: 0, mainStageId: 0, projectId: 0, name: 'Storyboard', enabled: true, starred: false, content: null },
    ]
  },
  {
    id: 0,
    projectId: 0,
    name: 'Production',
    starred: false,
    subStages: [
      { id: 0, mainStageId: 0, projectId: 0, name: 'Filming Schedule', enabled: true, starred: false, content: null },
      { id: 0, mainStageId: 0, projectId: 0, name: 'B-roll Ideas', enabled: true, starred: false, content: null },
      { id: 0, mainStageId: 0, projectId: 0, name: 'Shot List', enabled: true, starred: false, content: null },
      { id: 0, mainStageId: 0, projectId: 0, name: 'Production Notes', enabled: true, starred: false, content: null },
    ]
  },
  {
    id: 0,
    projectId: 0,
    name: 'Post-Production',
    starred: false,
    subStages: [
      { id: 0, mainStageId: 0, projectId: 0, name: 'Editing Progress', enabled: true, starred: false, content: null },
      { id: 0, mainStageId: 0, projectId: 0, name: 'Thumbnail Creator', enabled: true, starred: false, content: null },
      { id: 0, mainStageId: 0, projectId: 0, name: 'Subtitles', enabled: true, starred: false, content: null },
      { id: 0, mainStageId: 0, projectId: 0, name: 'Feedback and Revisions', enabled: true, starred: false, content: null },
      { id: 0, mainStageId: 0, projectId: 0, name: 'Export Settings', enabled: true, starred: false, content: null },
    ]
  },
  {
    id: 0,
    projectId: 0,
    name: 'Publishing',
    starred: false,
    subStages: [
      { id: 0, mainStageId: 0, projectId: 0, name: 'Video Details', enabled: true, starred: false, content: null },
      { id: 0, mainStageId: 0, projectId: 0, name: 'Thumbnails', enabled: true, starred: false, content: null },
      { id: 0, mainStageId: 0, projectId: 0, name: 'Publishing Schedule', enabled: true, starred: false, content: null },
      { id: 0, mainStageId: 0, projectId: 0, name: 'Subtitles', enabled: true, starred: false, content: null },
      { id: 0, mainStageId: 0, projectId: 0, name: 'Cross-Platform Sharing', enabled: true, starred: false, content: null },
      { id: 0, mainStageId: 0, projectId: 0, name: 'Monetization', enabled: true, starred: false, content: null },
    ]
  }
];

export default function ProjectSection() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  
  const [newProject, setNewProject] = useState<NewProject>({
    title: '',
    description: '',
    endDate: '',
    teamId: 0,
    duration: '',
    mainStages: defaultMainStages
  });

  const { data: user, isLoading: isUserLoading, error: userError } = trpc.users.getUser.useQuery();
  const { data: userTeams, isLoading: isTeamsLoading, error: teamsError } = trpc.users.getUserTeams.useQuery(undefined, { enabled: !!user });
  const { data: fetchedProjects, isLoading: isProjectsLoading, error: projectsError, refetch } = trpc.projects.getByTeamId.useQuery(
    selectedTeamId || -1,
    { enabled: !!selectedTeamId }
  );

  const createProjectMutation = trpc.projects.create.useMutation();
  const addMainStageMutation = trpc.projects.addMainStage.useMutation();
  const addSubStageMutation = trpc.projects.addSubStage.useMutation();
  const updateMainStageMutation = trpc.projects.updateMainStage.useMutation();
  const updateSubStageMutation = trpc.projects.updateSubStage.useMutation();
  const deleteMainStageMutation = trpc.projects.deleteMainStage.useMutation();
  const deleteSubStageMutation = trpc.projects.deleteSubStage.useMutation();

  useEffect(() => {
    if (userTeams && userTeams.length > 0) {
      setSelectedTeamId(userTeams[0].id);
    }
  }, [userTeams]);

  // useEffect(() => {
  //   if (fetchedProjects) {
  //     const sortedProjects = [...fetchedProjects].sort((a, b) => {
  //       if (a.completed && !b.completed) return 1;
  //       if (!a.completed && b.completed) return -1;
  //       if (a.endDate && b.endDate) {
  //         return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
  //       } else if (a.endDate) {
  //         return -1;
  //       } else if (b.endDate) {
  //         return 1;
  //       } else {
  //         return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  //       }
  //     });
  //     setProjects(sortedProjects);
  //   }
  // }, [fetchedProjects]);

  const handleAddProject = () => {
    setIsAddModalOpen(true);
  };

  const handleCreateProject = async () => {
    if (!selectedTeamId) {
      alert('Please select a team.');
      return;
    }
    try {
      await createProjectMutation.mutateAsync({
        ...newProject,
        teamId: selectedTeamId,
        startDate: new Date().toISOString(),
      });
      refetch();
      setIsAddModalOpen(false);
      setNewProject({
        title: '',
        description: '',
        teamId: 0,
        endDate: '',
        duration: '',
        mainStages: defaultMainStages
      });
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };
  const handleAddMainStage = async () => {
    if (!selectedTeamId) {
      alert('Please select a team.');
      return;
    }
    try {
      await addMainStageMutation.mutateAsync({
        projectId: selectedTeamId,
        name: 'New Main Stage',
        starred: false,
      });
      refetch();
    } catch (error) {
      console.error('Error adding main stage:', error);
      alert('Failed to add main stage. Please try again.');
    }
  };

  const handleAddSubStage = async (mainStageId: number) => {
    try {
      await addSubStageMutation.mutateAsync({
        mainStageId,
        name: 'New Sub Stage',
        enabled: true,
        starred: false,
      });
      refetch();
    } catch (error) {
      console.error('Error adding sub stage:', error);
      alert('Failed to add sub stage. Please try again.');
    }
  };

  const handleUpdateMainStage = async (id: number, name: string, starred: boolean) => {
    try {
      await updateMainStageMutation.mutateAsync({ id, name, starred });
      refetch();
    } catch (error) {
      console.error('Error updating main stage:', error);
      alert('Failed to update main stage. Please try again.');
    }
  };

  const handleUpdateSubStage = async (id: number, name: string, enabled: boolean, starred: boolean) => {
    try {
      await updateSubStageMutation.mutateAsync({ id, name, enabled, starred });
      refetch();
    } catch (error) {
      console.error('Error updating sub stage:', error);
      alert('Failed to update sub stage. Please try again.');
    }
  };

  const handleDeleteMainStage = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this main stage?')) {
      try {
        await deleteMainStageMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error('Error deleting main stage:', error);
        alert('Failed to delete main stage. Please try again.');
      }
    }
  };

  const handleDeleteSubStage = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this sub stage?')) {
      try {
        await deleteSubStageMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error('Error deleting sub stage:', error);
        alert('Failed to delete sub stage. Please try again.');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else {
        handleCreateProject();
      }
    } else if (e.ctrlKey && e.key === 'Enter') {
      handleCreateProject();
    }
  };

  const toggleSubStage = (mainStageIndex: number, subStageIndex: number) => {
    setNewProject(prev => {
      const updatedMainStages = [...prev.mainStages];
      updatedMainStages[mainStageIndex].subStages[subStageIndex].enabled = 
        !updatedMainStages[mainStageIndex].subStages[subStageIndex].enabled;
      return { ...prev, mainStages: updatedMainStages };
    });
  };

  if (isUserLoading || isTeamsLoading) {
    return <div>Loading...</div>;
  }

  if (userError || teamsError) {
    return <div>Error loading user data. Please try again.</div>;
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <CardTitle className="text-2xl font-bold">Projects</CardTitle>
            <Select
              value={selectedTeamId?.toString() || ''}
              onValueChange={(value) => setSelectedTeamId(Number(value))}
            >
              <SelectTrigger className="w-[120px] h-[30px] ">
                <SelectValue placeholder="Select Team" />
              </SelectTrigger>
              <SelectContent>
                {userTeams?.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleAddProject} 
            size="sm" 
            className=""
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Project
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isProjectsLoading ? (
          <p className="text-gray-600 text-center py-4">Loading projects...</p>
        ) : projectsError ? (
          <p className="text-red-600 text-center py-4">Error loading projects. Please try again.</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-600 text-center py-4">No projects exist for this team. Create a new project to get started!</p>
        ) : (
          <div className="h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide hover:scrollbar-default focus-within:scrollbar-default">
            <div className="space-y-4">
              {projects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  refetchProjects={refetch}
                />
              ))}
            </div>
          </div>
        )}

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Project Title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, 0)}
                ref={(el) => {inputRefs.current[0] = el}}
              />
              <Textarea
                placeholder="Project Description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
              <Input
                type="date"
                placeholder="End Date"
                value={newProject.endDate}
                onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, 2)}
                ref={(el) => {inputRefs.current[2] = el}}
              />
              <Input
                placeholder="Duration (e.g., 2 weeks, 1 month)"
                value={newProject.duration}
                onChange={(e) => setNewProject({ ...newProject, duration: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, 3)}
                ref={(el) => {inputRefs.current[3] = el}}
              />
              <Select
                value={selectedTeamId?.toString() || ''}
                onValueChange={(value) => setSelectedTeamId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Team" />
                </SelectTrigger>
                <SelectContent>
                  {userTeams?.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Accordion type="single" collapsible className="w-full">
      {newProject.mainStages.map((mainStage, mainIndex) => (
        <AccordionItem value={`item-${mainIndex}`} key={mainIndex}>
          <AccordionTrigger>{mainStage.name}</AccordionTrigger>
          <AccordionContent>
            {mainStage.subStages.map((subStage, subIndex) => (
              <div key={subIndex} className="flex items-center space-x-2">
                <Checkbox
                  id={`${mainStage.name}-${subStage.name}`}
                  checked={subStage.enabled}
                  onCheckedChange={() => handleUpdateSubStage(subStage.id, subStage.name, !subStage.enabled, subStage.starred)}
                />
                <label
                  htmlFor={`${mainStage.name}-${subStage.name}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {subStage.name}
                </label>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteSubStage(subStage.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => handleAddSubStage(mainStage.id)}>
              <Plus className="h-4 w-4 mr-2" /> Add Sub Stage
            </Button>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
    <Button variant="outline" onClick={handleAddMainStage}>
      <Plus className="h-4 w-4 mr-2" /> Add Main Stage
    </Button>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}




// "use client"
// import React, { useState, useEffect, useRef } from 'react';
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
// import ProjectCard from './ProjectCard';
// import { trpc } from '../trpc/client';
// import { Plus } from 'lucide-react';

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
//   isopen?: boolean;
//   completed?: boolean;
//   createdAt: string;
//   updatedAt: string;
//   team: {
//     name: string;
//     id: number;
//     createdAt: string;
//     updatedAt: string;
//     description: string | null;
//     creatorId: number;
//   };
//   creationOrder: number;
// }

// interface Team {
//   id: number;
//   name: string;
//   createdAt: string;
//   updatedAt: string;
//   description: string | null;
//   workOsOrgId: string;
//   creatorId: number;
// }
// interface NewProject {
//   title: string;
//   description: string;
//   endDate: string;
//   teamId: number;
// }

// interface ProjectStage {
//   id: number;
//   projectId: number;
//   stage: string;
//   completed: boolean;
//   order: number;
// }

// export default function ProjectSection() {
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
//   const [availableStages, setAvailableStages] = useState(['Ideation', 'Scripting', 'Shooting', 'Editing', 'Subtitles', 'Thumbnail', 'Tags', 'Description']);
//   const [selectedStages, setSelectedStages] = useState<string[]>([]);
//   const [newStage, setNewStage] = useState('');
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  
//   const [newProject, setNewProject] = useState<NewProject>({
//     title: '',
//     description: '',
//     endDate: '',
//     teamId: 0,
//   });

//   const { data: user, isLoading: isUserLoading, error: userError } = trpc.users.getUser.useQuery();
// const { data: userTeams, isLoading: isTeamsLoading, error: teamsError } = trpc.users.getUserTeams.useQuery(undefined, { enabled: !!user });
//   const { data: fetchedProjects, isLoading: isProjectsLoading, error: projectsError, refetch } = trpc.projects.getByTeamId.useQuery(
//     selectedTeamId || -1,
//     { enabled: !!selectedTeamId }
//   );

//   const createProjectMutation = trpc.projects.create.useMutation();

//   useEffect(() => {
//     if (userTeams && userTeams.length > 0) {
//       setSelectedTeamId(userTeams[0].id);
//     }
//   }, [userTeams]);

//   useEffect(() => {
//     if (fetchedProjects) {
//       const sortedProjects = [...fetchedProjects].sort((a, b) => {
//         if (a.completed && !b.completed) return 1;
//         if (!a.completed && b.completed) return -1;
//         if (a.endDate && b.endDate) {
//           return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
//         } else if (a.endDate) {
//           return -1;
//         } else if (b.endDate) {
//           return 1;
//         } else {
//           return a.creationOrder - b.creationOrder;
//         }
//       }) as Project[];
//       setProjects(sortedProjects);
//     }
//   }, [fetchedProjects]);

//   const handleAddProject = () => {
//     setIsAddModalOpen(true);
//   };

//   const handleCreateProject = async () => {
//     if (!selectedTeamId) {
//       alert('Please select a team.');
//       return;
//     }
//     try {
//       await createProjectMutation.mutateAsync({
//         ...newProject,
//         teamId: selectedTeamId,
//         startDate: new Date().toISOString(),
//         stages: selectedStages,   
//       });
//       refetch();
//       setIsAddModalOpen(false);
//       setNewProject({ title: '', description: '', teamId: 0, endDate: '' });
//     } catch (error) {
//       console.error('Error creating project:', error);
//       alert('Failed to create project. Please try again.');
//     }
//   };

//   const handleStageSelect = (stage: string) => {
//     setSelectedStages(prev => prev.includes(stage) ? prev.filter(s => s !== stage) : [...prev, stage]);
//   };

//   const handleAddNewStage = () => {
//     if (newStage && !availableStages.includes(newStage)) {
//       setAvailableStages(prev => [...prev, newStage]);
//       setSelectedStages(prev => [...prev, newStage]);
//       setNewStage('');
//     }
//   };

//   const handleAddAllStages = () => {
//     setSelectedStages([...new Set([...selectedStages, ...availableStages])]);
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       if (index < inputRefs.current.length - 1) {
//         inputRefs.current[index + 1]?.focus();
//       } else {
//         handleCreateProject();
//       }
//     } else if (e.ctrlKey && e.key === 'Enter') {
//       handleCreateProject();
//     }
//   };

//   if (isUserLoading || isTeamsLoading) {
//     return <div>Loading...</div>;
//   }

//   if (userError || teamsError) {
//     return <div>Error loading user data. Please try again.</div>;
//   }

//   return (
//     <Card className="w-full shadow-sm">
//       <CardHeader className="pb-2">
//         <div className="flex justify-between items-center">
//           <div className="flex items-center space-x-4">
//             <CardTitle className="text-2xl font-bold">Projects</CardTitle>
//             <Select
//               value={selectedTeamId?.toString() || ''}
//               onValueChange={(value) => setSelectedTeamId(Number(value))}
//             >
//               <SelectTrigger className="w-[120px] h-[30px] ">
//                 <SelectValue placeholder="Select Team" />
//               </SelectTrigger>
//               <SelectContent>
//                 {userTeams?.map((team) => (
//                   <SelectItem key={team.id} value={team.id.toString()}>
//                     {team.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//           <Button 
//             onClick={handleAddProject} 
//             size="sm" 
//             className=""
//           >
//             <Plus className="h-4 w-4 mr-2" />
//             Add New Project
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent>
//         {isProjectsLoading ? (
//           <p className="text-gray-600 text-center py-4">Loading projects...</p>
//         ) : projectsError ? (
//           <p className="text-red-600 text-center py-4">Error loading projects. Please try again.</p>
//         ) : projects.length === 0 ? (
//           <p className="text-gray-600 text-center py-4">No projects exist for this team. Create a new project to get started!</p>
//         ) : (
//           <div className="h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide hover:scrollbar-default focus-within:scrollbar-default">
//             <div className="space-y-4">
//               {projects.map(project => (
//                 <ProjectCard
//                   key={project.id}
//                   project={project}
//                   refetchProjects={refetch}
//                 />
//               ))}
//             </div>
//           </div>
//         )}

//         <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Add New Project</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4">
//               <Input
//                 placeholder="Project Title"
//                 value={newProject.title}
//                 onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
//                 onKeyDown={(e) => handleKeyDown(e, 0)}
//                 ref={(el) => {inputRefs.current[0] = el}}
//               />
//               <Input
//                 placeholder="Project Description"
//                 value={newProject.description}
//                 onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
//                 onKeyDown={(e) => handleKeyDown(e, 1)}
//                 ref={(el) => {inputRefs.current[1] = el}}
//               />
//               <Input
//                 type="date"
//                 placeholder="End Date"
//                 value={newProject.endDate}
//                 onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
//                 onKeyDown={(e) => handleKeyDown(e, 2)}
//                 ref={(el) => {inputRefs.current[2] = el}}
//               />
//               <Select
//                 value={selectedTeamId?.toString() || ''}
//                 onValueChange={(value) => setSelectedTeamId(Number(value))}
//               >
//                 <SelectTrigger className="w-[465px] h-[42px] rounded-2xl">
//                   <SelectValue placeholder="Select Team" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {userTeams?.map((team) => (
//                     <SelectItem key={team.id} value={team.id.toString()}>
//                       {team.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <div>
//                 <h3 className="text-sm font-medium mb-2">Select Stages:</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {availableStages.map(stage => (
//                     <Button
//                       key={stage}
//                       variant={selectedStages.includes(stage) ? "default" : "outline"}
//                       size="sm"
//                       onClick={() => handleStageSelect(stage)}
//                     >
//                       {stage}
//                     </Button>
//                   ))}
//                 </div>
//               </div>
//               <div className="flex gap-2">
//                 <Input
//                   placeholder="Add New Stage"
//                   value={newStage}
//                   onChange={(e) => setNewStage(e.target.value)}
//                 />
//                 <Button onClick={handleAddNewStage}>Add</Button>
//                 <Button onClick={handleAddAllStages}>Add All</Button>
//               </div>
//             </div>
//             <DialogFooter>
//               <Button onClick={handleCreateProject}>Create Project</Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </CardContent>
//     </Card>
//   );
// }