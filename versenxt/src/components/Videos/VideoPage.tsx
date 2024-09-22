'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus } from 'lucide-react'
import Overview from './Overview'
import Ideation from './Ideation'
import PreProduction from './PreProduction'
import Production from './Production'
import PostProduction from './PostProduction'
import Publishing from './Publishing'
//import Analytics from './Analytics'

export default function VideoPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("How to Make the Perfect Cup of Coffee")
  const [description, setDescription] = useState("A step-by-step guide for coffee enthusiasts")
  const [progress, setProgress] = useState(65)

  const stages = [
    { name: "Ideation", progress: 100 },
    { name: "Script", progress: 100 },
    { name: "Shoot", progress: 80 },
    { name: "Editing", progress: 40 },
    { name: "Thumbnail", progress: 20 },
    { name: "Publishing", progress: 0 }
  ]

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-8">
        <div className="space-y-2 flex-1">
          {isEditing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-3xl font-bold"
            />
          ) : (
            <h1 className="text-3xl font-bold">{title}</h1>
          )}
          {isEditing ? (
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-muted-foreground"
            />
          ) : (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Save' : 'Edit'}
          </Button>
          <Button variant="default">Publish</Button>
        </div>
      </header>

      <div className="flex items-center space-x-4 mb-6">
        <Progress value={progress} className="w-full" />
        <span className="text-sm font-medium whitespace-nowrap">{progress}% Complete</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8">
        <Avatar>
          <AvatarImage src="/placeholder-avatar.jpg" alt="@johndoe" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="/placeholder-avatar-2.jpg" alt="@janedoe" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium">{stage.name}</div>
                <div className="flex-1">
                  <Progress value={stage.progress} className="h-2" />
                </div>
                <div className="w-16 text-sm text-right">
                  {stage.progress === 100 ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>
                  ) : (
                    `${stage.progress}%`
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ideation">Ideation</TabsTrigger>
          <TabsTrigger value="pre-production">Pre-Production</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="post-production">Post-Production</TabsTrigger>
          <TabsTrigger value="publishing">Publishing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Overview />
        </TabsContent>

        <TabsContent value="ideation">
          <Ideation />
        </TabsContent>

        <TabsContent value="pre-production">
          <PreProduction />
        </TabsContent>

        <TabsContent value="production">
          <Production />
        </TabsContent>

        <TabsContent value="post-production">
          <PostProduction />
        </TabsContent>

        <TabsContent value="publishing">
          <Publishing />
        </TabsContent>

        <TabsContent value="analytics">
          {/* <Analytics /> */}
        </TabsContent>
      </Tabs>
    </div>
  )
}