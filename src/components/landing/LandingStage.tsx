'use client';

import React, { useEffect, useRef } from 'react';
import { Stage3D } from '@/lib/ddear-runtime';

interface LandingStageProps {
  doc: any;
  date: string;
  postmark: string;
}

export const LandingStage: React.FC<LandingStageProps> = ({ doc, date, postmark }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 0;

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      // Only react if width changed by > 10px (ignore iOS Safari address bar height shifts)
      if (Math.abs(currentWidth - lastWidth) > 10) {
        lastWidth = currentWidth;
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="canvas-wrap fade-in"
      style={{
        touchAction: 'pan-y',
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
      }}
    >
      <Stage3D doc={doc} mode="viewer" date={date} postmark={postmark} />
    </div>
  );
};

export default LandingStage;
