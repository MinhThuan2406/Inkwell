'use client';

import React from 'react';
import Link from 'next/link';
import { InkwellWordmark } from '@/components/brand';
import { LanguageSwitch, UserMenu, useDdearTranslation } from '@/lib/ddear-runtime';

interface LandingHeaderProps {
  user?: any;
  enabled?: boolean;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ user, enabled = true }) => {
  const t = useDdearTranslation();

  return (
    <header className="top" role="banner">
      <Link href="/" className="wordmark" aria-label="Inkwell">
        <InkwellWordmark />
      </Link>
      <div className="tools">
        <LanguageSwitch />
        <UserMenu user={user} enabled={enabled} next="/" />
        <Link href="/create" className="btn">
          {t('cta')}
        </Link>
      </div>
    </header>
  );
};

export default LandingHeader;

