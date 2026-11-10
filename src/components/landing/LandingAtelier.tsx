'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  createSampleDoc,
  formatDate,
  formatPostmark,
  ToastNotice,
  useDdearTranslation,
  useSceneStore,
} from '@/lib/ddear-runtime';
import LandingHeader from './LandingHeader';
import LandingStage from './LandingStage';
import LandingPlacard from './LandingPlacard';
import ThemeDrawer from './ThemeDrawer';

interface LandingAtelierProps {
  user?: any;
  enabled?: boolean;
  notice?: string | null;
}

export const LandingAtelier: React.FC<LandingAtelierProps> = ({
  user,
  enabled = true,
  notice,
}) => {
  const t = useDdearTranslation();
  const lang = t.lang || 'vi';
  const stage = useSceneStore((s) => s.stage);
  const actions = useSceneStore((s) => s.actions);
  const [selectedThemeId, setSelectedThemeId] = useState<string>('vintage');

  const today = useMemo(() => new Date(), []);
  const doc = useMemo(() => {
    return createSampleDoc(selectedThemeId, lang);
  }, [selectedThemeId, lang]);

  const dateStr = useMemo(() => formatDate(today, lang), [today, lang]);
  const postmarkStr = useMemo(() => formatPostmark(today), [today]);

  // Spatial scrollytelling wheel trigger
  const lastWheelTime = useRef<number>(0);
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime.current < 900) return;

      if (e.deltaY > 35) {
        if (stage === 'front') {
          lastWheelTime.current = now;
          actions?.open?.();
        } else if (stage === 'opened') {
          lastWheelTime.current = now;
          actions?.extract?.();
        }
      } else if (e.deltaY < -35) {
        if (stage === 'reading') {
          lastWheelTime.current = now;
          actions?.putAway?.();
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [stage, actions]);

  const hintText = useMemo(() => {
    if (stage === 'front') {
      return lang === 'vi'
        ? 'Kéo để xoay phong bì · chạm vào con dấu hoặc cuộn để mở'
        : 'Drag to inspect · tap seal or scroll down to open';
    }
    if (stage === 'opened') {
      return lang === 'vi'
        ? 'Chạm vào lá thư để mở ra đọc'
        : 'Tap the letter to unfold and read';
    }
    return null;
  }, [stage, lang]);

  return (
    <main
      className="landing"
      style={{
        height: '100dvh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <LandingStage doc={doc} date={dateStr} postmark={postmarkStr} />
      <LandingHeader user={user} enabled={enabled} />
      <LandingPlacard />

      {hintText && (
        <div
          className="hint"
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {hintText}
        </div>
      )}

      <ThemeDrawer
        activeThemeId={selectedThemeId}
        onSelectTheme={setSelectedThemeId}
      />
      <ToastNotice code={notice} />
    </main>
  );
};

export default LandingAtelier;
