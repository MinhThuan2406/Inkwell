'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  getSchemaModule,
  getThemesModule,
  LetterUnlock,
  Viewer,
} from '@/lib/ddear-runtime';
import NotFoundPage from '@/app/not-found';
import PageLoader from '@/components/PageLoader';

export default function LetterViewerPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || 'romantic';
  const [state, setState] = useState<{
    status: 'loading' | 'unlock' | 'ready' | 'not_found';
    letter?: any;
    replyFrom?: string | null;
  }>({ status: 'loading' });

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/letters/${encodeURIComponent(id)}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.passwordRequired) {
          setState({ status: 'unlock' });
          return;
        }
        const isLockedByDate = Boolean(
          data.openAt && new Date(data.openAt).getTime() > Date.now()
        );
        setState({
          status: 'ready',
          replyFrom: data.replyFrom || null,
          letter: {
            id: data.id,
            doc: data.doc,
            createdAt: data.createdAt || new Date().toISOString(),
            openAt: data.openAt || null,
            locked: isLockedByDate,
            replyTo: data.replyTo || null,
          },
        });
        return;
      }
    } catch {}

    const themesMod = getThemesModule();
    const schemaMod = getSchemaModule();
    const themeKey = id === 'first-love' ? 'romantic' : id;
    const matchedPreset = themesMod.z?.find((t: any) => t.id === themeKey);
    if (!matchedPreset) {
      setState({ status: 'not_found' });
      return;
    }

    const doc = {
      ...themesMod.C(schemaMod._(), matchedPreset),
      text: matchedPreset.sample.vi,
      from: 'Dear',
      to: 'Gửi bạn',
    };
    setState({
      status: 'ready',
      replyFrom: null,
      letter: {
        id,
        doc,
        createdAt: new Date().toISOString(),
        openAt: null,
        locked: false,
        replyTo: null,
      },
    });
  }, [id]);

  useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener('dear:refresh', onRefresh);
    return () => {
      window.removeEventListener('dear:refresh', onRefresh);
    };
  }, [load]);

  if (state.status === 'loading') return <PageLoader text="Đang mở lá thư" />;
  if (state.status === 'not_found') return <NotFoundPage />;
  if (state.status === 'unlock') return <LetterUnlock id={id} />;

  return (
    <Viewer
      letter={state.letter}
      replyFrom={state.replyFrom ?? null}
      reportEnabled={true}
    />
  );
}
