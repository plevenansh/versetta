

"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { trpc } from "@/trpc/client"
import { useRouter } from 'next/navigation'
import CalendarComponent from '@/components/Calendar'
import { PlusCircle, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { format } from "date-fns"

export default function CalendarPage() {
  const router = useRouter()
  const [selectedTeamId, setSelectedTeamId] = React.useState<string>('')
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [newTask, setNewTask] = React.useState({ title: '', dueDate: new Date() })
  const [newEvent, setNewEvent] = React.useState({ title: '', date: new Date(), description: '' })

  const { data: user, isLoading: userLoading } = trpc.users.getOrCreateUser.useQuery()
  const { data: userTeams, isLoading: teamsLoading } = trpc.teams.getUserTeams.useQuery(undefined, {
    enabled: !!user
  })

  const handleMonthChange = (increment: number) => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth)
      newMonth.setMonth(newMonth.getMonth() + increment)
      return newMonth
    })
  }

  const handleAddTask = () => {
    // Here you would typically call a mutation to add the task
    console.log('Adding task:', newTask)
    setNewTask({ title: '', dueDate: new Date() })
  }

  const handleAddEvent = () => {
    // Here you would typically call a mutation to add the event
    console.log('Adding event:', newEvent)
    setNewEvent({ title: '', date: new Date(), description: '' })
  }

  if (userLoading || teamsLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user || !userTeams || userTeams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">No teams available</h2>
        <Button onClick={() => router.push('/teams')}>Create a Team</Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full p-2 sm:p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#2f66dd]">Content Calendar</h1>
        <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a team" />
          </SelectTrigger>
          <SelectContent>
            {userTeams.map((team) => (
              <SelectItem key={team.id} value={team.id.toString()}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={() => handleMonthChange(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleMonthChange(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedTeamId ? (
                <CalendarComponent teamId={parseInt(selectedTeamId)} />
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Please select a team to view the calendar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Add</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">New Task</h3>
                  <Input
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                  <div className="mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newTask.dueDate ? format(newTask.dueDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newTask.dueDate}
                          onSelect={(date) => date && setNewTask({ ...newTask, dueDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button className="w-full mt-2" onClick={handleAddTask}>Add Task</Button>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">New Event</h3>
                  <Input
                    placeholder="Event title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="mb-2"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal mb-2">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newEvent.date ? format(newEvent.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newEvent.date}
                        onSelect={(date) => date && setNewEvent({ ...newEvent, date: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Textarea
                    placeholder="Event description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="mb-2"
                  />
                  <Button className="w-full" onClick={handleAddEvent}>Add Event</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks(Examples)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span>Write script for Project Alpha</span>
                  <span className="text-muted-foreground">Due tomorrow</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Review footage for Project Beta</span>
                  <span className="text-muted-foreground">Due in 3 days</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Create thumbnail for Project Gamma</span>
                  <span className="text-muted-foreground">Due next week</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events(Examples)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span>Team Meeting</span>
                  <span className="text-muted-foreground">Today, 2:00 PM</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Project Alpha Launch</span>
                  <span className="text-muted-foreground">Jun 15, 10:00 AM</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Content Planning Session</span>
                  <span className="text-muted-foreground">Jun 20, 1:00 PM</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => router.push('/projects/new')}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
        </Button>
      </div>
    </div>
  )
}