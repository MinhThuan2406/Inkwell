'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Editor, getClientUser } from '@/lib/ddear-runtime';
import PageLoader from '@/components/PageLoader';

function CreateStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const draftId = searchParams.get('draft');
  const replyId = searchParams.get('reply');
  const claim = searchParams.get('claim') === '1';

  const [user, setUser] = useState<any>(() => getClientUser());
  const [draftObj, setDraftObj] = useState<any>(null);
  const [replyObj, setReplyObj] = useState<any>(null);
  const [loaded, setLoaded] = useState<boolean>(!draftId && !replyId);

  useEffect(() => {
    setUser(getClientUser());
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (draftId) {
          const res = await fetch(`/api/drafts/${encodeURIComponent(draftId)}`);
          if (res.status === 404) {
            if (active) router.replace('/letters?notice=draft_missing');
            return;
          }
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'sent') {
              if (active) router.replace(`/l/${encodeURIComponent(data.id)}`);
              return;
            }
            if (active) setDraftObj(data);
          }
        }
        if (replyId) {
          const res = await fetch(`/api/letters/${encodeURIComponent(replyId)}`);
          if (res.ok) {
            const data = await res.json();
            if (active && data.doc) {
              setReplyObj({
                id: data.id,
                theme: data.doc?.theme || 'vintage',
                to: data.doc?.from || '',
                from: data.doc?.to || '',
              });
            }
          }
        }
      } finally {
        if (active) setLoaded(true);
      }
    }
    if (draftId || replyId) {
      setLoaded(false);
      load();
    } else {
      setDraftObj(null);
      setReplyObj(null);
      setLoaded(true);
    }
    return () => {
      active = false;
    };
  }, [draftId, replyId, router]);

  if (!loaded) return <PageLoader text="Đang tải studio" />;

  return (
    <Editor
      theme={theme}
      user={user}
      enabled={true}
      draft={draftObj}
      reply={replyObj}
      claim={claim}
    />
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<PageLoader text="Đang tải studio" />}>
      <CreateStudioContent />
    </Suspense>
  );
}
