import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { ScrollArea } from "../ui/scroll-area"
import { Checkbox } from "../ui/checkbox"
import { Upload, X } from 'lucide-react'
import { trpc } from '../../trpc/client'
import Image from 'next/image'

interface Project {
  id: number;
  videoAssets: VideoAsset[];
  thumbnails: Thumbnail[];
}

interface VideoAsset {
  id: number;
  title: string;
  url: string;
  type: string;
}

interface Thumbnail {
  id: number;
  imageUrl: string;
  selected: boolean;
}

interface NewVideoAsset {
  title: string;
  url: string;
  type: string;
}

interface NewThumbnail {
  imageUrl: string;
}

export default function PostProduction({ project }: { project: Project }) {
  const [newVideoAsset, setNewVideoAsset] = useState<NewVideoAsset>({ title: '', url: '', type: '' })
  const [newThumbnail, setNewThumbnail] = useState<NewThumbnail>({ imageUrl: '' })
  const [feedback, setFeedback] = useState('')

  const addVideoAsset = trpc.projectPage.addVideoAsset.useMutation()
  const deleteVideoAsset = trpc.projectPage.deleteVideoAsset.useMutation()
  const addThumbnail = trpc.projectPage.addThumbnail.useMutation()
  const updateThumbnail = trpc.projectPage.updateThumbnail.useMutation()
  const deleteThumbnail = trpc.projectPage.deleteThumbnail.useMutation()
  const updateProject = trpc.projectPage.updateProjectDetails.useMutation()

  const handleAddVideoAsset = async () => {
    if (newVideoAsset.title.trim() && newVideoAsset.url.trim() && newVideoAsset.type.trim()) {
      await addVideoAsset.mutateAsync({
        projectId: project.id,
        ...newVideoAsset,
      })
      setNewVideoAsset({ title: '', url: '', type: '' })
    }
  }

  const handleDeleteVideoAsset = async (id: number) => {
    await deleteVideoAsset.mutateAsync(id)
  }

  const handleAddThumbnail = async () => {
    if (newThumbnail.imageUrl.trim()) {
      await addThumbnail.mutateAsync({
        projectId: project.id,
        ...newThumbnail,
      })
      setNewThumbnail({ imageUrl: '' })
    }
  }

  const handleUpdateThumbnail = async (id: number, selected: boolean) => {
    await updateThumbnail.mutateAsync({
      id,
      selected,
    })
  }

  const handleDeleteThumbnail = async (id: number) => {
    await deleteThumbnail.mutateAsync(id)
  }

  const handleFeedbackChange = async (newFeedback: string) => {
    setFeedback(newFeedback)
    await updateProject.mutateAsync({
      id: project.id,
      productionNotes: newFeedback, // Assuming 'productionNotes' is the correct field for feedback
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            {project.videoAssets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium">{asset.title}</p>
                  <p className="text-sm text-muted-foreground">{asset.type}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteVideoAsset(asset.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </ScrollArea>
          <div className="flex flex-col space-y-2 mt-4">
            <Input 
              placeholder="Asset Title" 
              value={newVideoAsset.title}
              onChange={(e) => setNewVideoAsset({...newVideoAsset, title: e.target.value})}
            />
            <Input 
              placeholder="Asset URL" 
              value={newVideoAsset.url}
              onChange={(e) => setNewVideoAsset({...newVideoAsset, url: e.target.value})}
            />
            <Input 
              placeholder="Asset Type (e.g., raw, edited, final)" 
              value={newVideoAsset.type}
              onChange={(e) => setNewVideoAsset({...newVideoAsset, type: e.target.value})}
            />
            <Button onClick={handleAddVideoAsset}>Add Video Asset</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thumbnails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {project.thumbnails.map((thumbnail) => (
              <div key={thumbnail.id} className="relative">
                <Image 
                  src={thumbnail.imageUrl} 
                  alt="Thumbnail" 
                  width={200} 
                  height={150} 
                  layout="responsive"
                  className="rounded"
                />
                <div className="absolute top-2 right-2 space-x-2">
                  <Checkbox 
                    checked={thumbnail.selected}
                    onCheckedChange={(checked) => handleUpdateThumbnail(thumbnail.id, checked as boolean)}
                  />
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteThumbnail(thumbnail.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center mt-4">
            <Input 
              placeholder="Thumbnail Image URL" 
              value={newThumbnail.imageUrl}
              onChange={(e) => setNewThumbnail({...newThumbnail, imageUrl: e.target.value})}
              className="flex-1 mr-2"
            />
            <Button onClick={handleAddThumbnail}>Add Thumbnail</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feedback and Revisions</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Add feedback or revision notes here..." 
            value={feedback}
            onChange={(e) => handleFeedbackChange(e.target.value)}
            className="min-h-[150px]"
          />
        </CardContent>
      </Card>
    </div>
  )
}