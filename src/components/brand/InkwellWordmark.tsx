import React from 'react';
import { InkwellMonogram } from './InkwellMonogram';
import {
  INKWELL_CAPS_PATH,
  INKWELL_CAPS_WIDTH,
  INKWELL_CAPS_HEIGHT,
  INKWELL_TITLE_PATH,
  INKWELL_TITLE_WIDTH,
  INKWELL_TITLE_HEIGHT,
} from './wordmark-paths';

export interface InkwellWordmarkTextProps {
  height?: number;
  variant?: 'title' | 'caps';
  color?: string;
  className?: string;
  'aria-hidden'?: boolean;
}

export const InkwellWordmarkText: React.FC<InkwellWordmarkTextProps> = ({
  height = 19,
  variant = 'title',
  color = 'currentColor',
  className,
  'aria-hidden': ariaHidden = true,
}) => {
  const isCaps = variant === 'caps';
  const width = isCaps ? INKWELL_CAPS_WIDTH : INKWELL_TITLE_WIDTH;
  const originalHeight = isCaps ? INKWELL_CAPS_HEIGHT : INKWELL_TITLE_HEIGHT;
  const path = isCaps ? INKWELL_CAPS_PATH : INKWELL_TITLE_PATH;
  const calculatedWidth = (width * height) / originalHeight;

  return (
    <svg
      height={height}
      width={calculatedWidth}
      viewBox={`0 0 ${width} ${originalHeight}`}
      fill="none"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d={path} fill={color} />
    </svg>
  );
};

export interface InkwellWordmarkProps {
  sealSize?: number;
  textHeight?: number;
  variant?: 'title' | 'caps';
  textColor?: string;
  className?: string;
}

export const InkwellWordmark: React.FC<InkwellWordmarkProps> = ({
  sealSize = 28,
  textHeight = 19,
  variant = 'title',
  textColor = 'currentColor',
  className,
}) => {
  const content = (
    <>
      <InkwellMonogram size={sealSize} />
      <InkwellWordmarkText
        height={textHeight}
        variant={variant}
        color={textColor}
      />
    </>
  );

  if (className) {
    return <span className={className}>{content}</span>;
  }

  return content;
};

export default InkwellWordmark;
