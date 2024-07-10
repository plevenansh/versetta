
"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';

const stages = ['Ideation', 'Scripting', 'Shooting', 'Editing', 'Subtitles', 'Thumbnail', 'Tags', 'Description'];

export default function ProjectCard({ name, currentStage, percentageDone, expectedPublishDate, expanded: initialExpanded }) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [completedStages, setCompletedStages] = useState(stages.indexOf(currentStage) + 1);

  const toggleStage = (index) => {
    setCompletedStages(index + 1);
  };

  return (
    <motion.div
      layout
      className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-6 shadow-lg"
    >
      <motion.h3 layout="position" className="text-xl font-bold text-white mb-4">{name}</motion.h3>
      <motion.div layout="position" className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-white">{currentStage}</span>
        <span className="text-sm font-medium text-white">{percentageDone}% Complete</span>
      </motion.div>
      <motion.div
        layout="position"
        className="w-full h-2 bg-white bg-opacity-20 rounded-full mb-4"
      >
        <motion.div
          className="h-full bg-green-400 rounded-full"
          style={{ width: `${percentageDone}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${percentageDone}%` }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
      <motion.div layout="position" className="text-sm text-white mb-4">Expected Publish: {expectedPublishDate}</motion.div>
      <motion.button
        layout="position"
        onClick={() => setExpanded(!expanded)}
        className="text-white underline"
      >
        {expanded ? 'Hide Details' : 'Show Details'}
      </motion.button>
      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mt-4 space-y-4"
        >
          <h4 className="text-sm font-semibold text-white mb-2">Production Stages</h4>
          <div className="flex justify-between">
            {stages.map((stage, index) => (
              <motion.button
                key={stage}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index < completedStages ? 'bg-green-400' : 'bg-white bg-opacity-20'
                } text-white`}
                onClick={() => toggleStage(index)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {index < completedStages ? '✓' : ''}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
