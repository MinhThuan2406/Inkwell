'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getClientUser } from '@/lib/ddear-runtime';
import { LandingAtelier } from '@/components/landing';
import PageLoader from '@/components/PageLoader';

function HomeContent() {
  const searchParams = useSearchParams();
  const notice = searchParams.get('notice');
  const [user, setUser] = useState<any>(() => getClientUser());

  useEffect(() => {
    setUser(getClientUser());
  }, [notice]);

  return <LandingAtelier user={user} enabled={true} notice={notice} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <HomeContent />
    </Suspense>
  );
}
