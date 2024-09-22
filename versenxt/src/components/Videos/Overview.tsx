// Overview.tsx
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit3, Video, Users, Activity } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus } from 'lucide-react'

export default function Overview({  }) {
  const tasks = [
    { id: 1, title: "Write script outline", assignee: "John Doe", status: "Completed" },
    { id: 2, title: "Research coffee brewing methods", assignee: "Jane Smith", status: "In Progress" },
    { id: 3, title: "Set up lighting for shoot", assignee: "Mike Johnson", status: "Pending" },
    { id: 4, title: "Edit intro sequence", assignee: "Sarah Lee", status: "In Progress" },
    { id: 5, title: "Design thumbnail options", assignee: "Chris Brown", status: "Pending" }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Target Publish Date:</span>
                <span>July 15, 2023</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Current Status:</span>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">In Production</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Video Duration:</span>
                <span>10-12 minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="w-full">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Script
            </Button>
            <Button variant="outline" className="w-full">
              <Video className="w-4 h-4 mr-2" />
              Upload Footage
            </Button>
            <Button variant="outline" className="w-full">
              <Users className="w-4 h-4 mr-2" />
              Team Chat
            </Button>
            <Button variant="outline" className="w-full">
              <Activity className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Stages</CardTitle>
        </CardHeader>
        {/* <CardContent>
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
        </CardContent> */}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id={`task-${task.id}`} />
                    <label htmlFor={`task-${task.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {task.title}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{task.status}</Badge>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{task.assignee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <Button className="w-full mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add New Task
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}