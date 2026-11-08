'use client';

import React, { useMemo, useState } from 'react';
import {
  createSampleDoc,
  formatDate,
  formatPostmark,
  ToastNotice,
  useDdearTranslation,
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
  const [selectedThemeId, setSelectedThemeId] = useState<string>('vintage');

  const today = useMemo(() => new Date(), []);
  const doc = useMemo(() => {
    return createSampleDoc(selectedThemeId, lang);
  }, [selectedThemeId, lang]);

  const dateStr = useMemo(() => formatDate(today, lang), [today, lang]);
  const postmarkStr = useMemo(() => formatPostmark(today), [today]);

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
      <ThemeDrawer
        activeThemeId={selectedThemeId}
        onSelectTheme={setSelectedThemeId}
      />
      <ToastNotice code={notice} />
    </main>
  );
};

export default LandingAtelier;

