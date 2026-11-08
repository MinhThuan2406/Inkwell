'use client';

import React from 'react';
import Link from 'next/link';
import { useDdearTranslation } from '@/lib/ddear-runtime';

export const LandingPlacard: React.FC = () => {
  const t = useDdearTranslation();
  const lang = t.lang || 'vi';

  const copy = {
    vi: {
      title: 'Xưởng thư tín kỹ thuật số',
      desc: 'Giấy mộc ép cạnh, nét mực sumi lắng đọng và con dấu sáp chữ I intaglio cho những dòng thư riêng tư.',
      cta: 'Bắt đầu viết thư',
    },
    en: {
      title: 'Digital Correspondence Atelier',
      desc: 'Handcrafted stationery, sumi carbon ink, and an intaglio Roman wax seal for words meant to endure.',
      cta: 'Begin Correspondence',
    },
  }[lang as 'vi' | 'en'] || {
    title: 'Digital Correspondence Atelier',
    desc: 'Handcrafted stationery, sumi carbon ink, and an intaglio Roman wax seal for words meant to endure.',
    cta: 'Begin Correspondence',
  };

  return (
    <section className="placard landing-placard" aria-label="Atelier Introduction">
      <h1
        style={{
          fontSize: 'clamp(20px, 2.2vw, 24px)',
          fontWeight: 600,
          lineHeight: 1.25,
          margin: '0 0 6px',
          letterSpacing: '-0.015em',
          textWrap: 'balance',
          color: 'var(--ink)',
        }}
      >
        {copy.title}
      </h1>

      <p
        style={{
          fontSize: '13px',
          lineHeight: 1.5,
          color: 'var(--mute)',
          margin: '0 0 14px',
          textWrap: 'pretty',
        }}
      >
        {copy.desc}
      </p>

      <div className="actions" style={{ margin: 0 }}>
        <Link href="/create" className="btn" style={{ minHeight: '38px', padding: '0 18px', fontSize: '13px' }}>
          <span>{copy.cta}</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </section>
  );
};

export default LandingPlacard;
