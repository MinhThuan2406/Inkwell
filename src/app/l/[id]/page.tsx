'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  getSchemaModule,
  getThemesModule,
  LetterUnlock,
  useDdearTranslation,
  Viewer,
} from '@/lib/ddear-runtime';
import NotFoundPage from '@/app/not-found';
import PageLoader from '@/components/PageLoader';

export default function LetterViewerPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || 'romantic';
  const t = useDdearTranslation();
  const lang = t.lang || 'vi';
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
      text: matchedPreset.sample?.[lang] || matchedPreset.sample?.vi || '',
      from: 'Inkwell',
      to: lang === 'vi' ? 'Gửi bạn' : 'For you',
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
  }, [id, lang]);

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
