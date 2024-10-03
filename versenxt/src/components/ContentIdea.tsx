// components/ContentIdea.tsx
import React from 'react';

interface ContentIdeaProps {
  idea: string;
}

export const ContentIdea: React.FC<ContentIdeaProps> = ({ idea }) => {
  const [title, ...details] = idea.split(':');

  return (
    <div className="bg-blue-100 p-3 text-black rounded-md">
      <h3 className="font-bold">{title.trim()}</h3>
      <p>{details.join(':').trim()}</p>
    </div>
  );
};