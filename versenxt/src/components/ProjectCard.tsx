
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Circle, ChevronDown, ChevronUp, Send } from 'lucide-react';

const initialStages: string[] = ['Ideation', 'Scripting', 'Shooting', 'Editing', 'Subtitles', 'Thumbnail', 'Tags', 'Description'];

interface ProjectCardProps {
  name: string;
  initialStage: string;
  expectedPublishDate: string;
  expanded: boolean;
}

export default function ProjectCard({ name, initialStage, expectedPublishDate, expanded: initialExpanded }: ProjectCardProps) {
  const [expanded, setExpanded] = useState<boolean>(initialExpanded);
  const [stages, setStages] = useState<string[]>(initialStages);
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());
  const [currentStage, setCurrentStage] = useState<string>(initialStage);
  const [percentageDone, setPercentageDone] = useState<number>(0);

  useEffect(() => {
    const initialCompletedStages = new Set(initialStages.slice(0, initialStages.indexOf(initialStage)));
    setCompletedStages(initialCompletedStages);
    updatePercentage(initialCompletedStages);
  }, [initialStage]);

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

    // Reorder stages
    setStages(prevStages => {
      const completedStagesArray = prevStages.filter(s => completedStages.has(s) || s === stage);
      const incompleteStagesArray = prevStages.filter(s => !completedStages.has(s) && s !== stage);
      return [...completedStagesArray, ...incompleteStagesArray];
    });

    // Update current stage
    const nextIncompleteStage = stages.find(s => !completedStages.has(s) && s !== stage);
    setCurrentStage(nextIncompleteStage || stages[stages.length - 1]);
  };

  const getCompletedWidth = (): string => {
    const lastCompletedIndex = stages.findLastIndex(stage => completedStages.has(stage));
    return `${(lastCompletedIndex + 1) / stages.length * 100}%`;
  };

  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50">
        <CardTitle className="text-xl font-bold text-gray-800">{name}</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
            <Send className="w-4 h-4 mr-2" />
            Publish
          </Button>
          <Button variant="ghost" onClick={() => setExpanded(!expanded)} className="text-gray-600">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-700">Current: {currentStage}</span>
          <span className="text-sm font-medium text-gray-700">{percentageDone}% Complete</span>
        </div>
        <Progress value={percentageDone} className="mb-4 bg-gray-200" indicatorClassName="bg-blue-500" />
        <p className="text-sm text-gray-600 mb-4">Expected Publish: {expectedPublishDate}</p>
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
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}