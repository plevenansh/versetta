import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Image as ImageIcon } from 'lucide-react'
import { trpc } from '@/trpc/client'
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

  const updateProject = trpc.projectPage.updateProjectDetails.useMutation()
  const addKeyPoint = trpc.projectPage.addKeyPoint.useMutation()
  const updateKeyPoint = trpc.projectPage.updateKeyPoint.useMutation()
  const deleteKeyPoint = trpc.projectPage.deleteKeyPoint.useMutation()
  const addReference = trpc.projectPage.addReference.useMutation()
  const deleteReference = trpc.projectPage.deleteReference.useMutation()
  const addInspiration = trpc.projectPage.addInspiration.useMutation()
  const deleteInspiration = trpc.projectPage.deleteInspiration.useMutation()

  const handleConceptChange = async (concept: string) => {
    await updateProject.mutateAsync({
      id: project.id,
      concept,
    })
  }

  const handleAddKeyPoint = async () => {
    if (newKeyPoint.trim()) {
      await addKeyPoint.mutateAsync({
        projectId: project.id,
        content: newKeyPoint,
      })
      setNewKeyPoint('')
    }
  }

  const handleUpdateKeyPoint = async (id: number, completed: boolean) => {
    await updateKeyPoint.mutateAsync({
      id,
      completed,
    })
  }

  const handleDeleteKeyPoint = async (id: number) => {
    await deleteKeyPoint.mutateAsync(id)
  }

  const handleAddReference = async () => {
    if (newReferenceTitle.trim()) {
      await addReference.mutateAsync({
        projectId: project.id,
        title: newReferenceTitle,
        link: newReferenceLink,
      })
      setNewReferenceTitle('')
      setNewReferenceLink('')
    }
  }

  const handleDeleteReference = async (id: number) => {
    await deleteReference.mutateAsync(id)
  }

  const handleAddInspiration = async () => {
    if (newInspirationUrl.trim()) {
      await addInspiration.mutateAsync({
        projectId: project.id,
        imageUrl: newInspirationUrl,
      })
      setNewInspirationUrl('')
    }
  }

  const handleDeleteInspiration = async (id: number) => {
    await deleteInspiration.mutateAsync(id)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Concept</CardTitle>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

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