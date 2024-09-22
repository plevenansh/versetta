import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from 'lucide-react'
import { trpc } from '@/trpc/client';

export default function Ideation({ project }) {
  const [newKeyPoint, setNewKeyPoint] = useState('')
  const [newReferenceTitle, setNewReferenceTitle] = useState('')
  const [newReferenceLink, setNewReferenceLink] = useState('')

  const updateProject = trpc.projectPage.updateProjectDetails.useMutation()
  const addKeyPoint = trpc.projectPage.addKeyPoint.useMutation()
  const updateKeyPoint = trpc.projectPage.updateKeyPoint.useMutation()
  const deleteKeyPoint = trpc.projectPage.deleteKeyPoint.useMutation()
  const addReference = trpc.projectPage.addReference.useMutation()
  const deleteReference = trpc.projectPage.deleteReference.useMutation()

  const handleConceptChange = async (concept) => {
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

  const handleUpdateKeyPoint = async (id, completed) => {
    await updateKeyPoint.mutateAsync({
      id,
      completed,
    })
  }

  const handleDeleteKeyPoint = async (id) => {
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

  const handleDeleteReference = async (id) => {
    await deleteReference.mutateAsync(id)
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
            defaultValue={project.concept}
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
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <ul className="space-y-2">
                {project.keyPoints.map((point) => (
                  <li key={point.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`point-${point.id}`}
                        checked={point.completed}
                        onCheckedChange={(checked) => handleUpdateKeyPoint(point.id, checked)}
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
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <ul className="space-y-2">
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
    </div>
  )
}