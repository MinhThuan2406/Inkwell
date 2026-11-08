'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getClientUser, MyLetters } from '@/lib/ddear-runtime';
import PageLoader from '@/components/PageLoader';

function MyLettersContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') === 'sent' ? 'sent' : 'drafts';
  const notice = searchParams.get('notice');
  const [user, setUser] = useState<any>(() => getClientUser());
  const [letters, setLetters] = useState<any[] | null>(null);

  const load = useCallback(() => {
    setUser(getClientUser());
    fetch('/api/letters', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        setLetters(data.items ?? []);
      })
      .catch(() => {
        setLetters([]);
      });
  }, []);

  useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener('inkwell:refresh', onRefresh);
    window.addEventListener('dear:refresh', onRefresh);
    return () => {
      window.removeEventListener('inkwell:refresh', onRefresh);
      window.removeEventListener('dear:refresh', onRefresh);
    };
  }, [load]);

  if (!letters) return <PageLoader text="Đang tải thư của bạn" />;

  return (
    <MyLetters
      user={user}
      enabled={true}
      letters={letters}
      tab={tab}
      notice={notice}
    />
  );
}

export default function LettersPage() {
  return (
    <Suspense fallback={<PageLoader text="Đang tải thư của bạn" />}>
      <MyLettersContent />
    </Suspense>
  );
}
