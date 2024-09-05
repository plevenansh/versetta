// AnimationComponent.tsx
"use client"

import React from 'react';
import Lottie from 'lottie-react';
import animationData from './animation.json'; // You'll need to add your Lottie JSON file

const AnimationComponent: React.FC = () => {
  return (
    <div style={{ width: '90%', height: '90%' }}>
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default AnimationComponent;