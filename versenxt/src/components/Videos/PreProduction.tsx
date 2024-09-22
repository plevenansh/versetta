import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, ImageIcon } from 'lucide-react'

export default function PreProduction() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Script</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea placeholder="Write your script here..." className="min-h-[300px]" />
          <div className="flex justify-between mt-4">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Import from File
            </Button>
            <Button>
              Save Draft
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Keyword Research</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <div className="space-y-2">
                {[
                  "coffee brewing techniques",
                  "perfect coffee recipe",
                  "coffee to water ratio",
                  "best coffee beans",
                  "coffee grind size",
                  "pour over vs french press",
                  "coffee flavor profiles",
                  "coffee roast levels",
                  "coffee brewing temperature",
                  "specialty coffee guide"
                ].map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>{keyword}</span>
                    <Badge variant="secondary">High Volume</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex items-center mt-4">
              <Input placeholder="Add new keyword" className="flex-1 mr-2" />
              <Button>Add</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Equipment Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <div className="space-y-2">
                {[
                  "Camera",
                  "Lighting Kit",
                  "Microphone",
                  "Tripod",
                  "Coffee Maker",
                  "Coffee Grinder",
                  "Coffee Beans",
                  "Water Kettle",
                  "Scale",
                  "Various Coffee Cups"
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox id={`item-${index}`} />
                    <label htmlFor={`item-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {item}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex items-center mt-4">
              <Input placeholder="Add new equipment" className="flex-1 mr-2" />
              <Button>Add</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Storyboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="aspect-video bg-muted rounded-lg flex items-center justify-center relative">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <div className="absolute bottom-2 left-2 text-xs font-medium bg-background/80 px-2 py-1 rounded">
                  Scene {item}
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Storyboard Frame
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}