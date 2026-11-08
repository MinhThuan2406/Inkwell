'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDdearTranslation, useSceneStore } from '@/lib/ddear-runtime';

type ViewStage = 'front' | 'seal' | 'opened';

export const LandingPlacard: React.FC = () => {
  const t = useDdearTranslation();
  const lang = t.lang || 'vi';
  const actions = useSceneStore((s) => s.actions);
  const [activeStage, setActiveStage] = useState<ViewStage>('front');

  const switchStage = (stage: ViewStage) => {
    setActiveStage(stage);
    actions?.set?.({ stage });
  };

  const copy = {
    vi: {
      tag: 'Inkwell Atelier',
      title: 'Xưởng thư tín kỹ thuật số',
      desc: 'Giấy mộc ép cạnh, nét mực sumi lắng đọng và con dấu sáp chữ I intaglio bảo chứng cho những dòng thư riêng tư.',
      viewEnvelope: 'Phong bì',
      viewSeal: 'Con dấu sáp',
      viewLetter: 'Thư viết',
      cta: 'Bắt đầu viết thư',
    },
    en: {
      tag: 'Inkwell Atelier',
      title: 'Digital Correspondence Atelier',
      desc: 'Handcrafted stationery, sumi carbon ink, and an intaglio Roman wax seal for words meant to endure.',
      viewEnvelope: 'Envelope',
      viewSeal: 'Wax Seal',
      viewLetter: 'Stationery',
      cta: 'Begin Correspondence',
    },
  }[lang as 'vi' | 'en'] || {
    tag: 'Inkwell Atelier',
    title: 'Digital Correspondence Atelier',
    desc: 'Handcrafted stationery, sumi carbon ink, and an intaglio Roman wax seal for words meant to endure.',
    viewEnvelope: 'Envelope',
    viewSeal: 'Wax Seal',
    viewLetter: 'Stationery',
    cta: 'Begin Correspondence',
  };

  return (
    <section className="placard" aria-label="Atelier Introduction">
      <span
        style={{
          display: 'inline-block',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--dot)',
          marginBottom: '6px',
        }}
      >
        {copy.tag}
      </span>

      <h1
        style={{
          fontSize: '26px',
          fontWeight: 600,
          lineHeight: 1.2,
          margin: '0 0 8px',
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
          margin: '0 0 16px',
          textWrap: 'pretty',
        }}
      >
        {copy.desc}
      </p>

      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '18px',
          background: 'var(--well)',
          padding: '3px',
          borderRadius: '999px',
          width: 'fit-content',
        }}
        role="group"
        aria-label="Camera inspection viewpoints"
      >
        {(
          [
            ['front', copy.viewEnvelope],
            ['seal', copy.viewSeal],
            ['opened', copy.viewLetter],
          ] as const
        ).map(([stage, label]) => {
          const isActive = activeStage === stage;
          return (
            <button
              key={stage}
              type="button"
              onClick={() => switchStage(stage)}
              aria-pressed={isActive}
              style={{
                border: 0,
                background: isActive ? 'var(--card)' : 'transparent',
                color: isActive ? 'var(--ink)' : 'var(--mute)',
                fontWeight: isActive ? 600 : 500,
                padding: '5px 11px',
                fontSize: '12px',
                borderRadius: '999px',
                cursor: 'pointer',
                boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="actions" style={{ margin: 0 }}>
        <Link href="/create" className="btn" style={{ minWidth: '160px' }}>
          <span>{copy.cta}</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </section>
  );
};

export default LandingPlacard;

