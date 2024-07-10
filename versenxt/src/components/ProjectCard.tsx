
"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronDown, ChevronUp } from 'lucide-react'

type ProjectCardProps = {
  name: string
  currentStage: string
  percentageDone: number
  expectedPublishDate: string
  expanded: boolean
}

const stages = ['Ideation', 'Scripting', 'Shooting', 'Editing', 'Subtitles', 'Thumbnail', 'Tags', 'Description']

export default function ProjectCard({ name, currentStage, percentageDone, expectedPublishDate, expanded: initialExpanded }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(initialExpanded)

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{name}</CardTitle>
        <button onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </button>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">{currentStage}</span>
          <span className="text-sm font-medium">{percentageDone}% Complete</span>
        </div>
        <Progress value={percentageDone} className="mb-2" />
        <div className="text-sm text-gray-500">Expected Publish: {expectedPublishDate}</div>
        {expanded && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Production Stages</h4>
            <div className="flex justify-between">
              {stages.map((stage, index) => (
                <div key={stage} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= stages.indexOf(currentStage) ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                    {index <= stages.indexOf(currentStage) ? '✓' : ''}
                  </div>
                  <span className="text-xs mt-1">{stage}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}