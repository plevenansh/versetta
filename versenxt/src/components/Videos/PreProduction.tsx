import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { ScrollArea } from "../ui/scroll-area"
import { Checkbox } from "../ui/checkbox"
import { Plus, X, ImageIcon } from 'lucide-react'
import { trpc } from '../../utils/trpc'
import Image from 'next/image'
import { FileUploader } from '../FileUploader'
import { FileList } from '../FileList'

interface SubStage {
  id: number;
  name: string;
  enabled: boolean;
  starred: boolean;
  content: any;
}

interface MainStage {
  id: number;
  name: string;
  starred: boolean;
  subStages: SubStage[];
}

interface Project {
  id: number;
  title: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  teamId: number;
  creatorId: number;
  completed: boolean;
  mainStages: MainStage[];
}

interface PreProductionProps {
  project: Project;
  mainStage: MainStage;
}

export default function PreProduction({ project, mainStage }: PreProductionProps) {
  const utils = trpc.useUtils();

  const updateSubStageMutation = trpc.projectPage.updateSubStage.useMutation({
    onSuccess: () => utils.projectPage.getProjectDetails.invalidate(project.id)
  });

  const handleUpdateSubStage = async (subStage: SubStage, newContent: any) => {
    try {
      await updateSubStageMutation.mutateAsync({
        id: subStage.id,
        content: newContent,
      });
    } catch (error) {
      console.error('Error updating sub-stage:', error);
    }
  };

  const renderSubStage = (subStage: SubStage) => {
    switch (subStage.name) {
      case 'Script':
        return (
          <Card key={subStage.id}>
            <CardHeader>
              <CardTitle>Script</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Write your script here..." 
                className="min-h-[300px]"
                value={subStage.content?.script || ''}
                onChange={(e) => handleUpdateSubStage(subStage, { ...subStage.content, script: e.target.value })}
              />
            </CardContent>
          </Card>
        );
      case 'Equipment Checklist':
        return (
          <Card key={subStage.id}>
            <CardHeader>
              <CardTitle>Equipment Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <EquipmentChecklistComponent subStage={subStage} onUpdate={handleUpdateSubStage} />
            </CardContent>
          </Card>
        );
      case 'Storyboard':
        return (
          <Card key={subStage.id}>
            <CardHeader>
              <CardTitle>Storyboard</CardTitle>
            </CardHeader>
            <CardContent>
              <StoryboardComponent subStage={subStage} onUpdate={handleUpdateSubStage} projectId={project.id} />
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {mainStage.subStages.map(renderSubStage)}
    </div>
  );
}

interface SubComponentProps {
  subStage: SubStage;
  onUpdate: (subStage: SubStage, newContent: any) => Promise<void>;
}

const EquipmentChecklistComponent: React.FC<SubComponentProps> = ({ subStage, onUpdate }) => {
  const [newEquipment, setNewEquipment] = useState('');

  const handleAddEquipment = () => {
    if (newEquipment.trim()) {
      const updatedEquipment = [...(subStage.content?.equipment || []), { name: newEquipment, checked: false }];
      onUpdate(subStage, { ...subStage.content, equipment: updatedEquipment });
      setNewEquipment('');
    }
  };

  const handleUpdateEquipment = (index: number, checked: boolean) => {
    const updatedEquipment = subStage.content?.equipment.map((item: any, i: number) => 
      i === index ? { ...item, checked } : item
    );
    onUpdate(subStage, { ...subStage.content, equipment: updatedEquipment });
  };

  const handleDeleteEquipment = (index: number) => {
    const updatedEquipment = subStage.content?.equipment.filter((_: any, i: number) => i !== index);
    onUpdate(subStage, { ...subStage.content, equipment: updatedEquipment });
  };

  return (
    <div>
      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
        <ul className="space-y-2">
          {subStage.content?.equipment?.map((item: any, index: number) => (
            <li key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`equipment-${index}`}
                  checked={item.checked}
                  onCheckedChange={(checked) => handleUpdateEquipment(index, checked as boolean)}
                />
                <label htmlFor={`equipment-${index}`} className="text-sm">{item.name}</label>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteEquipment(index)}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <div className="flex items-center mt-4">
        <Input 
          placeholder="Add new equipment" 
          value={newEquipment}
          onChange={(e) => setNewEquipment(e.target.value)}
          className="flex-grow mr-2"
        />
        <Button onClick={handleAddEquipment}>Add</Button>
      </div>
    </div>
  );
};

interface StoryboardComponentProps extends SubComponentProps {
  projectId: number;
}

const StoryboardComponent: React.FC<StoryboardComponentProps> = ({ subStage, onUpdate, projectId }) => {
  const handleAddStoryboardFrame = (fileUrl: string) => {
    const updatedStoryboard = [...(subStage.content?.storyboard || []), { imageUrl: fileUrl, scene: subStage.content?.storyboard?.length + 1 || 1 }];
    onUpdate(subStage, { ...subStage.content, storyboard: updatedStoryboard });
  };

  const handleDeleteStoryboardFrame = (index: number) => {
    const updatedStoryboard = subStage.content?.storyboard.filter((_: any, i: number) => i !== index);
    onUpdate(subStage, { ...subStage.content, storyboard: updatedStoryboard });
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {subStage.content?.storyboard?.map((frame: any, index: number) => (
          <div key={index} className="relative">
            <Image 
              src={frame.imageUrl} 
              alt={`Scene ${frame.scene}`} 
              width={200} 
              height={150} 
              layout="responsive"
              className="rounded"
            />
            <Button 
              variant="destructive" 
              size="sm" 
              className="absolute top-1 right-1"
              onClick={() => handleDeleteStoryboardFrame(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <FileUploader 
        teamId={projectId} 
        projectId={projectId} 
        subStageId={subStage.id}
        onUploadComplete={(fileUrl) => handleAddStoryboardFrame(fileUrl)}
      />
      <FileList 
        teamId={projectId} 
        projectId={projectId} 
        subStageId={subStage.id}
      />
    </div>
  );
};




// import React, { useState } from 'react'
// import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
// import { Button } from "../ui/button"
// import { Input } from "../ui/input"
// import { Textarea } from "../ui/textarea"
// import { ScrollArea } from "../ui/scroll-area"
// import { Checkbox } from "../ui/checkbox"
// import { Plus, X, ImageIcon } from 'lucide-react'
// import { trpc } from '../../utils/trpc'
// import Image from 'next/image'

// interface Equipment {
//   id: number;
//   name: string;
//   checked: boolean;
// }

// interface StoryboardFrame {
//   id: number;
//   imageUrl: string;
//   scene: number;
// }

// interface Project {
//   id: number;
//   script: string | null;
//   equipment: Equipment[];
//   storyboard: StoryboardFrame[];
//   title: string;
//   description: string | null;
//   status: string;
//   startDate: string | null;
//   endDate: string | null;
//   createdAt: string;
//   updatedAt: string;
//   teamId: number;
//   creatorId: number;
//   creationOrder: number;
//   completed: boolean;
//   concept: string | null;
//   productionNotes: string | null;
// }

// interface PreProductionProps {
//   project: Project;
// }

// export default function PreProduction({ project }: PreProductionProps) {
//   const [newEquipment, setNewEquipment] = useState('')
//   const [script, setScript] = useState(project.script || '')

//   const utils = trpc.useUtils();

//   const updateProject = trpc.projectPage.updateProjectDetails.useMutation({
//     onSuccess: () => {
//       utils.projectPage.getProjectDetails.invalidate(project.id);
//     }
//   });

//   const addEquipment = trpc.projectPage.addEquipment.useMutation({
//     onSuccess: () => {
//       utils.projectPage.getProjectDetails.invalidate(project.id);
//     }
//   });

//   const updateEquipment = trpc.projectPage.updateEquipment.useMutation({
//     onSuccess: () => {
//       utils.projectPage.getProjectDetails.invalidate(project.id);
//     }
//   });

//   const deleteEquipment = trpc.projectPage.deleteEquipment.useMutation({
//     onSuccess: () => {
//       utils.projectPage.getProjectDetails.invalidate(project.id);
//     }
//   });

//   const addStoryboardFrame = trpc.projectPage.addStoryboardFrame.useMutation({
//     onSuccess: () => {
//       utils.projectPage.getProjectDetails.invalidate(project.id);
//     }
//   });

//   const deleteStoryboardFrame = trpc.projectPage.deleteStoryboardFrame.useMutation({
//     onSuccess: () => {
//       utils.projectPage.getProjectDetails.invalidate(project.id);
//     }
//   });

//   const handleScriptChange = async (newScript: string) => {
//     setScript(newScript);
//     try {
//       await updateProject.mutateAsync({
//         id: project.id,
//         script: newScript,
//       });
//     } catch (error) {
//       console.error('Failed to update script:', error);
//       // Handle error (e.g., show error message to user)
//     }
//   }
  
//   const handleAddEquipment = async () => {
//     if (newEquipment.trim()) {
//       try {
//         await addEquipment.mutateAsync({
//           projectId: project.id,
//           name: newEquipment,
//         });
//         setNewEquipment('');
//       } catch (error) {
//         console.error('Failed to add equipment:', error);
//         // Handle error
//       }
//     }
//   }

//   const handleUpdateEquipment = async (id: number, checked: boolean) => {
//     try {
//       await updateEquipment.mutateAsync({
//         id,
//         checked,
//       });
//     } catch (error) {
//       console.error('Failed to update equipment:', error);
//       // Handle error
//     }
//   }

//   const handleDeleteEquipment = async (id: number) => {
//     try {
//       await deleteEquipment.mutateAsync(id);
//     } catch (error) {
//       console.error('Failed to delete equipment:', error);
//       // Handle error
//     }
//   }

//   const handleAddStoryboardFrame = async () => {
//     // In a real application, you'd handle file upload here
//     const imageUrl = 'placeholder-image-url';
//     try {
//       await addStoryboardFrame.mutateAsync({
//         projectId: project.id,
//         imageUrl,
//         scene: project.storyboard.length + 1,
//       });
//     } catch (error) {
//       console.error('Failed to add storyboard frame:', error);
//       // Handle error
//     }
//   }

//   const handleDeleteStoryboardFrame = async (id: number) => {
//     try {
//       await deleteStoryboardFrame.mutateAsync(id);
//     } catch (error) {
//       console.error('Failed to delete storyboard frame:', error);
//       // Handle error
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Script</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Textarea 
//             placeholder="Write your script here..." 
//             className="min-h-[300px]"
//             value={script}
//             onChange={(e) => handleScriptChange(e.target.value)}
//           />
//         </CardContent>
//       </Card>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Equipment Checklist</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ScrollArea className="h-[200px] w-full rounded-md border p-4">
//               <ul className="space-y-2">
//                 {project.equipment.map((item) => (
//                   <li key={item.id} className="flex items-center justify-between">
//                     <div className="flex items-center space-x-2">
//                       <Checkbox 
//                         id={`equipment-${item.id}`}
//                         checked={item.checked}
//                         onCheckedChange={(checked) => handleUpdateEquipment(item.id, checked as boolean)}
//                       />
//                       <label htmlFor={`equipment-${item.id}`} className="text-sm">{item.name}</label>
//                     </div>
//                     <Button variant="ghost" size="sm" onClick={() => handleDeleteEquipment(item.id)}>
//                       <X className="h-4 w-4" />
//                     </Button>
//                   </li>
//                 ))}
//               </ul>
//             </ScrollArea>
//             <div className="flex items-center mt-4">
//               <Input 
//                 placeholder="Add new equipment" 
//                 value={newEquipment}
//                 onChange={(e) => setNewEquipment(e.target.value)}
//                 className="flex-1 mr-2"
//               />
//               <Button onClick={handleAddEquipment}>Add</Button>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Storyboard</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//               {project.storyboard.map((frame) => (
//                 <div key={frame.id} className="relative">
//                   <Image 
//                     src={frame.imageUrl} 
//                     alt={`Scene ${frame.scene}`} 
//                     width={200} 
//                     height={150} 
//                     layout="responsive"
//                     className="rounded"
//                   />
//                   <Button 
//                     variant="destructive" 
//                     size="sm" 
//                     className="absolute top-1 right-1"
//                     onClick={() => handleDeleteStoryboardFrame(frame.id)}
//                   >
//                     <X className="h-4 w-4" />
//                   </Button>
//                 </div>
//               ))}
//               <Button onClick={handleAddStoryboardFrame} className="h-24 flex flex-col items-center justify-center">
//                 <ImageIcon className="h-8 w-8 mb-2" />
//                 <span>Add Frame</span>
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }