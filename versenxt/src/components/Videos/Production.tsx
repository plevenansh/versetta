import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { ScrollArea } from "../ui/scroll-area"
import { Checkbox } from "../ui/checkbox"
import { Badge } from "../ui/badge"
import { Plus, X } from 'lucide-react'
import { trpc } from '../../trpc/client'

interface FilmingSession {
  id: number
  scene: string
  time: string
  location: string
}

interface BRollIdea {
  id: number
  idea: string
}

interface Shot {
  id: number
  description: string
  completed: boolean
}

interface Project {
  id: number;
  productionNotes: string | null;
  filmingSchedule: FilmingSession[];
  bRollIdeas: BRollIdea[];
  shotList: Shot[];
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
  script: string | null;
  // Add any other properties that are present in your project data
}

export default function Production({ project }: { project: Project }) {
  const [newFilmingSession, setNewFilmingSession] = useState({ scene: '', time: '', location: '' })
  const [newBRollIdea, setNewBRollIdea] = useState('')
  const [newShot, setNewShot] = useState('')
  const [productionNotes, setProductionNotes] = useState(project.productionNotes || '')

  const updateProject = trpc.projectPage.updateProjectDetails.useMutation()
  const addFilmingSession = trpc.projectPage.addFilmingSession.useMutation()
  const deleteFilmingSession = trpc.projectPage.deleteFilmingSession.useMutation()
  const addBRollIdea = trpc.projectPage.addBRollIdea.useMutation()
  const deleteBRollIdea = trpc.projectPage.deleteBRollIdea.useMutation()
  const addShot = trpc.projectPage.addShot.useMutation()
  const updateShot = trpc.projectPage.updateShot.useMutation()
  const deleteShot = trpc.projectPage.deleteShot.useMutation()

  const handleProductionNotesChange = async (notes: string) => {
    setProductionNotes(notes)
    await updateProject.mutateAsync({
      id: project.id,
      productionNotes: notes,
    })
  }

  const handleAddFilmingSession = async () => {
    if (newFilmingSession.scene.trim() && newFilmingSession.time.trim() && newFilmingSession.location.trim()) {
      await addFilmingSession.mutateAsync({
        projectId: project.id,
        ...newFilmingSession,
      })
      setNewFilmingSession({ scene: '', time: '', location: '' })
    }
  }

  const handleDeleteFilmingSession = async (id: number) => {
    await deleteFilmingSession.mutateAsync(id)
  }

  const handleAddBRollIdea = async () => {
    if (newBRollIdea.trim()) {
      await addBRollIdea.mutateAsync({
        projectId: project.id,
        idea: newBRollIdea,
      })
      setNewBRollIdea('')
    }
  }

  const handleDeleteBRollIdea = async (id: number) => {
    await deleteBRollIdea.mutateAsync(id)
  }

  const handleAddShot = async () => {
    if (newShot.trim()) {
      await addShot.mutateAsync({
        projectId: project.id,
        description: newShot,
      })
      setNewShot('')
    }
  }

  const handleUpdateShot = async (id: number, completed: boolean) => {
    await updateShot.mutateAsync({
      id,
      completed,
    })
  }

  const handleDeleteShot = async (id: number) => {
    await deleteShot.mutateAsync(id)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filming Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            {project.filmingSchedule.map((session: FilmingSession) => (
              <div key={session.id} className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium">{session.scene}</p>
                  <p className="text-sm text-muted-foreground">{session.time} - {session.location}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteFilmingSession(session.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </ScrollArea>
          <div className="flex flex-col space-y-2 mt-4">
            <Input 
              placeholder="Scene" 
              value={newFilmingSession.scene}
              onChange={(e) => setNewFilmingSession({...newFilmingSession, scene: e.target.value})}
            />
            <Input 
              placeholder="Time" 
              value={newFilmingSession.time}
              onChange={(e) => setNewFilmingSession({...newFilmingSession, time: e.target.value})}
            />
            <Input 
              placeholder="Location" 
              value={newFilmingSession.location}
              onChange={(e) => setNewFilmingSession({...newFilmingSession, location: e.target.value})}
            />
            <Button onClick={handleAddFilmingSession}>Add Filming Session</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>B-Roll Ideas</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            {project.bRollIdeas.map((idea: BRollIdea) => (
              <div key={idea.id} className="flex items-center justify-between mb-2">
                <p>{idea.idea}</p>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteBRollIdea(idea.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </ScrollArea>
          <div className="flex items-center mt-4">
            <Input 
              placeholder="Add new B-roll idea" 
              value={newBRollIdea}
              onChange={(e) => setNewBRollIdea(e.target.value)}
              className="flex-1 mr-2"
            />
            <Button onClick={handleAddBRollIdea}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shot List</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            {project.shotList.map((shot: Shot) => (
              <div key={shot.id} className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Checkbox 
                    id={`shot-${shot.id}`}
                    checked={shot.completed}
                    onCheckedChange={(checked) => handleUpdateShot(shot.id, checked as boolean)}
                  />
                  <label htmlFor={`shot-${shot.id}`} className="ml-2">{shot.description}</label>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteShot(shot.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </ScrollArea>
          <div className="flex items-center mt-4">
            <Input 
              placeholder="Add new shot" 
              value={newShot}
              onChange={(e) => setNewShot(e.target.value)}
              className="flex-1 mr-2"
            />
            <Button onClick={handleAddShot}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Production Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Add any production notes, reminders, or special instructions here..." 
            value={productionNotes}
            onChange={(e) => handleProductionNotesChange(e.target.value)}
            className="min-h-[150px]"
          />
        </CardContent>
      </Card>
    </div>
  )
}