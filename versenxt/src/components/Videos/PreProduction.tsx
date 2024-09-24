import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X, ImageIcon } from 'lucide-react'
import { trpc } from '@/trpc/client'
import Image from 'next/image'

interface Equipment {
  id: number;
  name: string;
  checked: boolean;
}

interface StoryboardFrame {
  id: number;
  imageUrl: string;
  scene: number;
}

interface Project {
  id: number;
  script: string | null;  // Change this to allow null
  equipment: Equipment[];
  storyboard: StoryboardFrame[];
  // Add other properties that are present in the project data
  title: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  teamId: number;
  creatorId: number;
  creationOrder: number;
  completed: boolean;
  concept: string | null;
  productionNotes: string | null;
 // stages: ProjectStage[];
  // Add any other properties that are part of your project data
}

interface PreProductionProps {
  project: Project;
}

export default function PreProduction({ project }: PreProductionProps) {
  const [newEquipment, setNewEquipment] = useState('')
  const [script, setScript] = useState(project.script || '')

  const updateProject = trpc.projectPage.updateProjectDetails.useMutation()
  const addEquipment = trpc.projectPage.addEquipment.useMutation()
  const updateEquipment = trpc.projectPage.updateEquipment.useMutation()
  const deleteEquipment = trpc.projectPage.deleteEquipment.useMutation()
  const addStoryboardFrame = trpc.projectPage.addStoryboardFrame.useMutation()
  const deleteStoryboardFrame = trpc.projectPage.deleteStoryboardFrame.useMutation()

  const handleScriptChange = async (newScript: string) => {
    setScript(newScript);
    await updateProject.mutateAsync({
      id: project.id,
      script: newScript,
    });
  }
  
  const handleAddEquipment = async () => {
    if (newEquipment.trim()) {
      await addEquipment.mutateAsync({
        projectId: project.id,
        name: newEquipment,
      })
      setNewEquipment('')
    }
  }

  const handleUpdateEquipment = async (id: number, checked: boolean) => {
    await updateEquipment.mutateAsync({
      id,
      checked,
    })
  }

  const handleDeleteEquipment = async (id: number) => {
    await deleteEquipment.mutateAsync(id)
  }

  const handleAddStoryboardFrame = async () => {
    // In a real application, you'd handle file upload here
    const imageUrl = 'placeholder-image-url'
    await addStoryboardFrame.mutateAsync({
      projectId: project.id,
      imageUrl,
      scene: project.storyboard.length + 1,
    })
  }

  const handleDeleteStoryboardFrame = async (id: number) => {
    await deleteStoryboardFrame.mutateAsync(id)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Script</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Write your script here..." 
            className="min-h-[300px]"
            value={script}
            onChange={(e) => handleScriptChange(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Equipment Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <ul className="space-y-2">
                {project.equipment.map((item) => (
                  <li key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`equipment-${item.id}`}
                        checked={item.checked}
                        onCheckedChange={(checked) => handleUpdateEquipment(item.id, checked as boolean)}
                      />
                      <label htmlFor={`equipment-${item.id}`} className="text-sm">{item.name}</label>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteEquipment(item.id)}>
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
                className="flex-1 mr-2"
              />
              <Button onClick={handleAddEquipment}>Add</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storyboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {project.storyboard.map((frame) => (
                <div key={frame.id} className="relative">
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
                    onClick={() => handleDeleteStoryboardFrame(frame.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={handleAddStoryboardFrame} className="h-24 flex flex-col items-center justify-center">
                <ImageIcon className="h-8 w-8 mb-2" />
                <span>Add Frame</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}