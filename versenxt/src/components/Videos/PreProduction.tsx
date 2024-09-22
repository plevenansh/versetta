import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, X, ImageIcon } from 'lucide-react'
import { trpc } from '@/trpc/client';
//import { trpc } from '@/utils/trpc'

export default function PreProduction({ project }) {
  const [newEquipment, setNewEquipment] = useState('')
  const [script, setScript] = useState(project.script || '')

  const updateProject = trpc.projectPage.updateProjectDetails.useMutation()
  const addEquipment = trpc.projectPage.addEquipment.useMutation()
  const updateEquipment = trpc.projectPage.updateEquipment.useMutation()
  const deleteEquipment = trpc.projectPage.deleteEquipment.useMutation()
  const addStoryboardFrame = trpc.projectPage.addStoryboardFrame.useMutation()
  const deleteStoryboardFrame = trpc.projectPage.deleteStoryboardFrame.useMutation()

  const handleScriptChange = async (newScript) => {
    setScript(newScript)
    await updateProject.mutateAsync({
      id: project.id,
      script: newScript,
    })
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

  const handleUpdateEquipment = async (id, checked) => {
    await updateEquipment.mutateAsync({
      id,
      checked,
    })
  }

  const handleDeleteEquipment = async (id) => {
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

  const handleDeleteStoryboardFrame = async (id) => {
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
                        onCheckedChange={(checked) => handleUpdateEquipment(item.id, checked)}
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
                  <img src={frame.imageUrl} alt={`Scene ${frame.scene}`} className="w-full h-auto rounded" />
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