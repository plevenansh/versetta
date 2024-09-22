// Ideation.tsx
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { ImageIcon, Plus, X } from 'lucide-react'
import { Image } from 'lucide-react'
export default function Ideation() {
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
            defaultValue="Create a comprehensive guide on brewing the perfect cup of coffee, covering various methods and tips for achieving the best flavor."
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
                <li className="flex items-center space-x-2">
                  <Checkbox id="point-1" />
                  <label htmlFor="point-1" className="text-sm">Choosing the right coffee beans</label>
                </li>
                <li className="flex items-center space-x-2">
                  <Checkbox id="point-2" />
                  <label htmlFor="point-2" className="text-sm">Proper grinding techniques</label>
                </li>
                <li className="flex items-center space-x-2">
                  <Checkbox id="point-3" />
                  <label htmlFor="point-3" className="text-sm">Water temperature and quality</label>
                </li>
                <li className="flex items-center space-x-2">
                  <Checkbox id="point-4" />
                  <label htmlFor="point-4" className="text-sm">Different brewing methods (pour-over, French press, etc.)</label>
                </li>
                <li className="flex items-center space-x-2">
                  <Checkbox id="point-5" />
                  <label htmlFor="point-5" className="text-sm">Timing and measurements</label>
                </li>
              </ul>
            </ScrollArea>
            <Button variant="outline" className="w-full mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Add Key Point
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Research & References</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <span className="text-sm">Coffee Brewing Techniques (Article)</span>
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-sm">World Barista Championship Videos</span>
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-sm">Scientific Study on Coffee Extraction</span>
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              </ul>
            </ScrollArea>
            <div className="flex items-center mt-4">
              <Input placeholder="Add reference link or title" className="flex-1 mr-2" />
              <Button>Add</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inspiration Board</CardTitle>
        </CardHeader>
        {/* <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground"
              </div>
            ))}
          </div>
          <Button className="w-full mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Inspiration Image
          </Button>
        </CardContent> */}
      </Card>
    </div>
  )
}