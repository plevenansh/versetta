import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Edit3, Video, Users, Activity, Star } from 'lucide-react';
import { trpc } from '../../utils/trpc';
import { Progress } from "../ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { CommentSection } from '../CommentSection'; // Import the CommentSection component

interface SubStage {
  id: number;
  name: string;
  enabled: boolean;
  starred: boolean;
  content: any;
}

interface MainStage {
  id: number;
  name: string;
  starred: boolean;
  subStages: SubStage[];
}

interface Project {
  id: number;
  title: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  teamId: number;
  creatorId: number;
  completed: boolean;
  mainStages: MainStage[];
}

interface OverviewProps {
  project: Project;
}

export default function Overview({ project }: OverviewProps) {
  const utils = trpc.useUtils();

  // Dummy function to calculate progress (replace with actual logic later)
  const calculateProgress = (stage: MainStage | SubStage) => {
    return Math.floor(Math.random() * 101); // Returns a random number between 0 and 100
  };

  const starredSubStages = project.mainStages.flatMap(stage => 
    stage.subStages.filter(subStage => subStage.starred)
  );

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
                <span>{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Current Status:</span>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">{project.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Video Form:</span>
                <span>{project.description?.includes('Short') ? 'Short' : 'Long form'}</span>
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
              Tasks
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {project.mainStages.map((stage, index) => (
              <AccordionItem value={`item-${index}`} key={stage.id}>
                <AccordionTrigger>
                  <div className="flex justify-between items-center w-full pr-4">
                    <span>{stage.name}</span>
                    <Progress value={calculateProgress(stage)} className="w-1/3" />
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-4 space-y-2">
                    {stage.subStages.map((subStage) => (
                      <div key={subStage.id} className="flex justify-between items-center">
                        <span>{subStage.name}</span>
                        <Progress value={calculateProgress(subStage)} className="w-1/3" />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Starred Sub-Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {starredSubStages.map((subStage) => (
              <div key={subStage.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-2 fill-yellow-400" />
                  <span>{subStage.name}</span>
                </div>
                <Progress value={calculateProgress(subStage)} className="w-1/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project-wide Comment Section */}
      <Card>
        <CardHeader>
          <CardTitle>Project Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <CommentSection
            projectId={project.id}
            contextName={project.title}
          />
        </CardContent>
      </Card>
    </div>
  );
}