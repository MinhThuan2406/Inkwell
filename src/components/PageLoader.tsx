'use client';

import React from 'react';

export default function PageLoader({ text = 'Đang tải' }: { text?: string }) {
  return (
    <div className="scene-loader" role="status" aria-live="polite">
      <svg
        className="loader-envelope"
        width="84"
        height="84"
        viewBox="0 0 80 80"
        aria-hidden="true"
      >
        <path d="M10 33h60v32a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4Z" />
        <path className="loader-flap-back" d="M10 33 40 11 70 33Z" />
        <svg x="10" y="0" width="60" height="69" viewBox="10 0 60 69" overflow="hidden">
          <g className="loader-letter">
            <rect x="21" y="11" width="38" height="46" rx="3" />
            <path d="M29 22h22M29 29h22M29 36h14" fill="none" />
          </g>
        </svg>
        <path d="m10 33 27 19a5 5 0 0 0 6 0l27-19v32a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4Z" />
        <path d="m12 66 19-17m37 17L49 49" fill="none" />
        <path className="loader-flap-front" d="m10 33 27 19a5 5 0 0 0 6 0l27-19Z" />
      </svg>
      <span className="loader-text">
        {text}
        <span className="dots" aria-hidden="true">
          <i>.</i>
          <i>.</i>
          <i>.</i>
        </span>
      </span>
      <span className="loader-bar" aria-hidden="true">
        <i style={{ transform: 'scaleX(0.75)' }} />
      </span>
    </div>
  );
}
