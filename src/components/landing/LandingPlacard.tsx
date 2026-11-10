'use client';

import React from 'react';
import Link from 'next/link';
import { useDdearTranslation, useSceneStore } from '@/lib/ddear-runtime';

export const LandingPlacard: React.FC = () => {
  const t = useDdearTranslation();
  const lang = t.lang || 'vi';
  const stage = useSceneStore((s) => s.stage);
  const actions = useSceneStore((s) => s.actions);

  const copy = {
    vi: {
      frontTitle: 'Xưởng thư tín kỹ thuật số',
      frontDesc:
        'Giấy mộc ép cạnh, nét mực sumi lắng đọng và con dấu sáp chữ I intaglio cho những dòng thư riêng tư.',
      frontCta: 'Bắt đầu viết thư',
      frontOpen: 'Mở lá thư mẫu',
      openedTitle: 'Con dấu sáp đã mở',
      openedDesc: 'Lá thư bên trong đang đợi bạn mở ra đọc.',
      openedExtract: 'Đọc toàn bộ thư',
      openedClose: 'Đóng phong bì lại',
      readingTitle: 'Thư tín từ Inkwell',
      readingDesc:
        'Nét mực thủ công lắng đọng trên nền giấy mộc. Hãy bắt đầu tự tay tạo bức thư của riêng bạn.',
      readingCta: 'Tự viết lá thư của bạn',
      readingFold: 'Gấp phong bì lại',
    },
    en: {
      frontTitle: 'Digital Correspondence Atelier',
      frontDesc:
        'Handcrafted stationery, sumi carbon ink, and an intaglio Roman wax seal for words meant to endure.',
      frontCta: 'Begin Correspondence',
      frontOpen: 'Unseal Sample Letter',
      openedTitle: 'Wax Seal Broken',
      openedDesc: 'The correspondence inside is ready to be unfolded and read.',
      openedExtract: 'Unfold & Read',
      openedClose: 'Fold back',
      readingTitle: 'Correspondence from Inkwell',
      readingDesc:
        'Handcrafted ink resting upon washi parchment. Begin composing your own bespoke letter.',
      readingCta: 'Compose Your Letter',
      readingFold: 'Seal & Put Away',
    },
  }[lang as 'vi' | 'en'] || {
    frontTitle: 'Digital Correspondence Atelier',
    frontDesc:
      'Handcrafted stationery, sumi carbon ink, and an intaglio Roman wax seal for words meant to endure.',
    frontCta: 'Begin Correspondence',
    frontOpen: 'Unseal Sample Letter',
    openedTitle: 'Wax Seal Broken',
    openedDesc: 'The correspondence inside is ready to be unfolded and read.',
    openedExtract: 'Unfold & Read',
    openedClose: 'Fold back',
    readingTitle: 'Correspondence from Inkwell',
    readingDesc:
      'Handcrafted ink resting upon washi parchment. Begin composing your own bespoke letter.',
    readingCta: 'Compose Your Letter',
    readingFold: 'Seal & Put Away',
  };

  const isReading = stage === 'reading' || stage === 'unfolding';
  const isOpened = stage === 'opened' || stage === 'extracting';

  let title = copy.frontTitle;
  let desc = copy.frontDesc;

  if (isReading) {
    title = copy.readingTitle;
    desc = copy.readingDesc;
  } else if (isOpened) {
    title = copy.openedTitle;
    desc = copy.openedDesc;
  }

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
        {title}
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
        {desc}
      </p>

      <div className="actions" style={{ margin: 0, gap: '10px' }}>
        {isReading ? (
          <>
            <Link
              href="/create"
              className="btn"
              style={{ minHeight: '38px', padding: '0 18px', fontSize: '13px' }}
            >
              <span>{copy.readingCta}</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
            <button
              type="button"
              className="link"
              onClick={() => actions?.putAway?.()}
              style={{ fontSize: '12px', color: 'var(--mute)' }}
            >
              {copy.readingFold}
            </button>
          </>
        ) : isOpened ? (
          <>
            <button
              type="button"
              className="btn"
              onClick={() => actions?.extract?.()}
              style={{ minHeight: '38px', padding: '0 18px', fontSize: '13px' }}
            >
              <span>{copy.openedExtract}</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
            <button
              type="button"
              className="link"
              onClick={() => actions?.putAway?.()}
              style={{ fontSize: '12px', color: 'var(--mute)' }}
            >
              {copy.openedClose}
            </button>
          </>
        ) : (
          <>
            <Link
              href="/create"
              className="btn"
              style={{ minHeight: '38px', padding: '0 18px', fontSize: '13px' }}
            >
              <span>{copy.frontCta}</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
            <button
              type="button"
              className="link"
              onClick={() => actions?.open?.()}
              style={{ fontSize: '12px', color: 'var(--mute)' }}
            >
              {copy.frontOpen}
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default LandingPlacard;
