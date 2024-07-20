"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Circle, ChevronDown, ChevronUp, Send, Edit, Trash2 } from 'lucide-react';
import { EditProjectModal } from './EditProjectModal';
import { trpc } from '@/trpc/client';

interface ProjectCardProps {
  project: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    startDate: string | null;
    endDate: string | null;
    userId: number;
  };
  refetchProjects: () => void;
}

export default function ProjectCard({ project, refetchProjects }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [stages, setStages] = useState(['Ideation', 'Scripting', 'Shooting', 'Editing', 'Subtitles', 'Thumbnail', 'Tags', 'Description']);
  const [completedStages, setCompletedStages] = useState(new Set());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [percentageDone, setPercentageDone] = useState(0);

  const { data: projectWithTasks, refetch } = trpc.projects.getById.useQuery(project.id);
  const deleteProjectMutation = trpc.projects.delete.useMutation();

  useEffect(() => {
    const initialCompletedStages = new Set(stages.slice(0, stages.indexOf(project.status) + 1));
    setCompletedStages(initialCompletedStages);
    updatePercentage(initialCompletedStages);
  }, [project.status, stages]);

  const updatePercentage = (completedSet: Set<string>) => {
    const percentage = (completedSet.size / stages.length) * 100;
    setPercentageDone(Math.round(percentage));
  };

  const toggleStage = (stage: string) => {
    setCompletedStages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stage)) {
        newSet.delete(stage);
      } else {
        newSet.add(stage);
      }
      updatePercentage(newSet);
      return newSet;
    });
  };

  const getCompletedWidth = (): string => {
    const lastCompletedIndex = stages.findLastIndex(stage => completedStages.has(stage));
    return `${(lastCompletedIndex + 1) / stages.length * 100}%`;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProjectMutation.mutateAsync(project.id);
        refetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50">
        <div>
          <CardTitle className="text-xl font-bold text-gray-800">{project.title}</CardTitle>
          <p className="text-sm text-gray-600">Project ID: {project.id}</p>
          <p className="text-sm text-gray-600">User ID: {project.userId}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)} className="text-blue-600 border-blue-600 hover:bg-blue-50">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
            <Send className="w-4 h-4 mr-2" />
            Publish
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDelete} 
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button variant="ghost" onClick={() => setExpanded(!expanded)} className="text-gray-600">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-700">Current: {project.status}</span>
          <span className="text-sm font-medium text-gray-700">{percentageDone}% Complete</span>
        </div>
        <Progress value={percentageDone} className="mb-4 bg-gray-200" indicatorClassName="bg-blue-500" />
        <p className="text-sm text-gray-600 mb-4">Expected Publish: {formatDate(project.endDate)}</p>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Production Stages</h4>
              <div className="flex justify-between items-center relative">
                {stages.map((stage, index) => (
                  <motion.div 
                    key={stage} 
                    className="flex flex-col items-center z-10"
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleStage(stage)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        completedStages.has(stage) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {completedStages.has(stage) ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    </motion.button>
                    <span className="text-xs mt-2 text-gray-600">{stage}</span>
                  </motion.div>
                ))}
                <motion.div 
                  className="absolute top-5 left-5 right-5 h-0.5 bg-blue-500"
                  style={{ width: getCompletedWidth() }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              {projectWithTasks && projectWithTasks.tasks && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Tasks</h4>
                  <ul className="list-disc pl-5">
                    {projectWithTasks.tasks.map((task) => (
                      <li key={task.id} className="text-sm text-gray-600">
                        {task.title} - {task.status}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      
      {isEditModalOpen && (
        <EditProjectModal
          project={projectWithTasks || project}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={() => {
            refetch();
            refetchProjects();
          }}
        />
      )}
    </Card>
  );
}
