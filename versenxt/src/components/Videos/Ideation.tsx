import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { ScrollArea } from "../ui/scroll-area"
import { Checkbox } from "../ui/checkbox"
import { Plus, X, Image as ImageIcon } from 'lucide-react'
import { trpc } from '../../trpc/client'
import Image from 'next/image'

interface Project {
  id: number;
  concept: string | null;
  keyPoints: Array<{ id: number; content: string; completed: boolean }>;
  references: Array<{ id: number; title: string; link?: string | null }>;
  inspirations: Array<{ id: number; imageUrl: string }>;
}

interface IdeationProps {
  project: Project;
}

export default function Ideation({ project }: IdeationProps) {
  const [newKeyPoint, setNewKeyPoint] = useState('')
  const [newReferenceTitle, setNewReferenceTitle] = useState('')
  const [newReferenceLink, setNewReferenceLink] = useState('')
  const [newInspirationUrl, setNewInspirationUrl] = useState('')

  const utils = trpc.useContext();

  const updateProject = trpc.projectPage.updateProjectDetails.useMutation({
    onSuccess: () => utils.projectPage.getProjectDetails.invalidate(project.id)
  });
  const addKeyPoint = trpc.projectPage.addKeyPoint.useMutation({
    onSuccess: () => utils.projectPage.getProjectDetails.invalidate(project.id)
  });
  const updateKeyPoint = trpc.projectPage.updateKeyPoint.useMutation({
    onSuccess: () => utils.projectPage.getProjectDetails.invalidate(project.id)
  });
  const deleteKeyPoint = trpc.projectPage.deleteKeyPoint.useMutation({
    onSuccess: () => utils.projectPage.getProjectDetails.invalidate(project.id)
  });
  const addReference = trpc.projectPage.addReference.useMutation({
    onSuccess: () => utils.projectPage.getProjectDetails.invalidate(project.id)
  });
  const deleteReference = trpc.projectPage.deleteReference.useMutation({
    onSuccess: () => utils.projectPage.getProjectDetails.invalidate(project.id)
  });
  const addInspiration = trpc.projectPage.addInspiration.useMutation({
    onSuccess: () => utils.projectPage.getProjectDetails.invalidate(project.id)
  });
  const deleteInspiration = trpc.projectPage.deleteInspiration.useMutation({
    onSuccess: () => utils.projectPage.getProjectDetails.invalidate(project.id)
  });

  const handleConceptChange = async (concept: string) => {
    try {
      await updateProject.mutateAsync({
        id: project.id,
        concept,
      })
    } catch (error) {
      console.error('Error updating concept:', error)
    }
  }

  const handleAddKeyPoint = async () => {
    if (newKeyPoint.trim()) {
      try {
        await addKeyPoint.mutateAsync({
          projectId: project.id,
          content: newKeyPoint,
        })
        setNewKeyPoint('')
      } catch (error) {
        console.error('Error adding key point:', error)
      }
    }
  }

  const handleUpdateKeyPoint = async (id: number, completed: boolean) => {
    try {
      await updateKeyPoint.mutateAsync({
        id,
        completed,
      })
    } catch (error) {
      console.error('Error updating key point:', error)
    }
  }

  const handleDeleteKeyPoint = async (id: number) => {
    try {
      await deleteKeyPoint.mutateAsync(id)
    } catch (error) {
      console.error('Error deleting key point:', error)
    }
  }

  const handleAddReference = async () => {
    if (newReferenceTitle.trim()) {
      try {
        await addReference.mutateAsync({
          projectId: project.id,
          title: newReferenceTitle,
          link: newReferenceLink,
        })
        setNewReferenceTitle('')
        setNewReferenceLink('')
      } catch (error) {
        console.error('Error adding reference:', error)
      }
    }
  }

  const handleDeleteReference = async (id: number) => {
    try {
      await deleteReference.mutateAsync(id)
    } catch (error) {
      console.error('Error deleting reference:', error)
    }
  }

  const handleAddInspiration = async () => {
    if (newInspirationUrl.trim()) {
      try {
        await addInspiration.mutateAsync({
          projectId: project.id,
          imageUrl: newInspirationUrl,
        })
        setNewInspirationUrl('')
      } catch (error) {
        console.error('Error adding inspiration:', error)
      }
    }
  }

  const handleDeleteInspiration = async (id: number) => {
    try {
      await deleteInspiration.mutateAsync(id)
    } catch (error) {
      console.error('Error deleting inspiration:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Concept</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Describe your video concept here..." 
            className="min-h-[150px]"
            defaultValue={project.concept || ''}
            onChange={(e) => handleConceptChange(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Points</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full">
            <ul className="space-y-2 pr-4">
              {project.keyPoints.map((point) => (
                <li key={point.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`point-${point.id}`}
                      checked={point.completed}
                      onCheckedChange={(checked) => handleUpdateKeyPoint(point.id, checked as boolean)}
                    />
                    <label htmlFor={`point-${point.id}`} className="text-sm">{point.content}</label>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteKeyPoint(point.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
          <div className="flex items-center mt-4">
            <Input 
              placeholder="Add new key point" 
              value={newKeyPoint}
              onChange={(e) => setNewKeyPoint(e.target.value)}
              className="flex-1 mr-2"
            />
            <Button onClick={handleAddKeyPoint}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Research & References</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full">
            <ul className="space-y-2 pr-4">
              {project.references.map((ref) => (
                <li key={ref.id} className="flex items-center justify-between">
                  <span className="text-sm">
                    {ref.link ? (
                      <a href={ref.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {ref.title}
                      </a>
                    ) : (
                      ref.title
                    )}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteReference(ref.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
          <div className="flex flex-col space-y-2 mt-4">
            <Input 
              placeholder="Reference title" 
              value={newReferenceTitle}
              onChange={(e) => setNewReferenceTitle(e.target.value)}
            />
            <Input 
              placeholder="Reference link (optional)" 
              value={newReferenceLink}
              onChange={(e) => setNewReferenceLink(e.target.value)}
            />
            <Button onClick={handleAddReference}>Add Reference</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inspiration Board</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] w-full">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-4">
              {project.inspirations.map((inspiration) => (
                <div key={inspiration.id} className="relative group">
                  <Image 
                    src={inspiration.imageUrl} 
                    alt="Inspiration" 
                    width={300}
                    height={128}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteInspiration(inspiration.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center justify-center w-full h-32 bg-gray-100 rounded-md">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <label htmlFor="file-upload" className="mt-2 cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                  </label>
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="flex items-center mt-4">
            <Input 
              placeholder="Image URL" 
              value={newInspirationUrl}
              onChange={(e) => setNewInspirationUrl(e.target.value)}
              className="flex-1 mr-2"
            />
            <Button onClick={handleAddInspiration}>Add Image</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}