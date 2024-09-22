import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus } from 'lucide-react'

export default function Production() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filming Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            <div className="space-y-4">
              {[
                { scene: "Introduction", time: "9:00 AM - 10:00 AM", location: "Home Kitchen" },
                { scene: "Choosing Coffee Beans", time: "10:15 AM - 11:15 AM", location: "Local Coffee Shop" },
                { scene: "Grinding Process", time: "11:30 AM - 12:30 PM", location: "Home Kitchen" },
                { scene: "Brewing Techniques", time: "2:00 PM - 3:30 PM", location: "Home Kitchen" },
                { scene: "Tasting and Conclusion", time: "3:45 PM - 4:45 PM", location: "Living Room" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">{`Scene ${index + 1}`}</Badge>
                    <span>{item.scene}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{item.time}</p>
                    <p className="text-xs text-muted-foreground">{item.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <Button className="w-full mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Filming Session
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>B-Roll Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <div className="space-y-2">
                {[
                  "Close-up of coffee beans",
                  "Steam rising from freshly brewed coffee",
                  "Slow-motion coffee pour",
                  "Time-lapse of coffee brewing process",
                  "Various coffee preparation tools",
                  "Latte art creation",
                  "Coffee farm scenery",
                  "Roasting process",
                  "Cupping session",
                  "Barista techniques"
                ].map((idea, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>{idea}</span>
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex items-center mt-4">
              <Input placeholder="Add new B-roll idea" className="flex-1 mr-2" />
              <Button>Add</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Shot List</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <div className="space-y-2">
                {[
                  "Wide shot of kitchen setup",
                  "Medium shot of coffee grinder in action",
                  "Close-up of water being poured over coffee grounds",
                  "Over-the-shoulder shot of barista preparing coffee",
                  "Extreme close-up of coffee dripping into cup",
                  "Tracking shot following steam from cup",
                  "Low angle shot of coffee being stirred",
                  "High angle shot of completed coffee presentation"
                ].map((shot, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox id={`shot-${index}`} />
                    <label htmlFor={`shot-${index}`} className="text-sm">{shot}</label>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex items-center mt-4">
              <Input placeholder="Add new shot" className="flex-1 mr-2" />
              <Button>Add</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Production Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea placeholder="Add any production notes, reminders, or special instructions here..." className="min-h-[150px]" />
          <Button className="w-full mt-4">Save Notes</Button>
        </CardContent>
      </Card>
    </div>
  )
}