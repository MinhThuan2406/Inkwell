'use client';

import React from 'react';
import Link from 'next/link';
import {
  BrandWordmark,
  LanguageSwitch,
  useDdearTranslation,
} from '@/lib/ddear-runtime';

export default function NotFoundPage() {
  const t = useDdearTranslation();
  const isVi = t.lang === 'vi';

  return (
    <main className="mine letter-gate">
      <header className="top">
        <Link href="/" className="wordmark" aria-label="Inkwell">
          <BrandWordmark />
        </Link>
        <LanguageSwitch />
      </header>
      <section className="placard letter-unlock" style={{ textAlign: 'center' }}>
        <div className="letter-unlock-head">
          <h1>{isVi ? 'Không tìm thấy lá thư này' : 'Letter not found'}</h1>
          <p>
            {isVi
              ? 'Đường link có thể đã sai hoặc lá thư không còn tồn tại.'
              : 'This link may be incorrect or the letter is no longer available.'}
          </p>
        </div>
        <div className="actions" style={{ justifyContent: 'center', marginTop: 22 }}>
          <Link href="/" className="btn ghost">
            {isVi ? 'Về trang chủ' : 'Back home'}
          </Link>
          <Link href="/create" className="btn">
            {t('cta')}
          </Link>
        </div>
      </section>
    </main>
  );
}
