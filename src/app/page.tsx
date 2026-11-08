'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getClientUser, Landing } from '@/lib/ddear-runtime';
import PageLoader from '@/components/PageLoader';

function HomeContent() {
  const searchParams = useSearchParams();
  const notice = searchParams.get('notice');
  const [user, setUser] = useState<any>(() => getClientUser());

  useEffect(() => {
    setUser(getClientUser());
  }, [notice]);

  return <Landing user={user} enabled={true} notice={notice} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <HomeContent />
    </Suspense>
  );
}
