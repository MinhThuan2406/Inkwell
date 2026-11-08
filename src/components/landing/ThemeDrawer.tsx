'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getThemeList, useDdearTranslation } from '@/lib/ddear-runtime';

interface ThemeDrawerProps {
  activeThemeId: string;
  onSelectTheme: (themeId: string) => void;
}

export const ThemeDrawer: React.FC<ThemeDrawerProps> = ({
  activeThemeId,
  onSelectTheme,
}) => {
  const t = useDdearTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const themes = getThemeList();
  const lang = t.lang || 'vi';

  return (
    <details
      className="collection"
      open={isOpen}
      onToggle={(e) => setIsOpen(e.currentTarget.open)}
    >
      <summary title={t('collectionToggle')}>
        <span>{t('collection')}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </summary>
      <nav aria-label={t('collection')}>
        {themes.map((theme: any) => {
          const isSelected = theme.id === activeThemeId;
          const themeName = theme.name?.[lang] || theme.name?.vi || theme.id;
          return (
            <div
              key={theme.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 2px',
              }}
            >
              <button
                type="button"
                onClick={() => onSelectTheme(theme.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: isSelected ? 'var(--well)' : 'transparent',
                  border: 0,
                  borderRadius: 'var(--r-sm)',
                  padding: '6px 8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  flex: 1,
                  textAlign: 'left',
                  fontWeight: isSelected ? 600 : 400,
                  color: 'var(--ink)',
                }}
                aria-pressed={isSelected}
              >
                <i
                  style={{
                    display: 'inline-block',
                    width: '20px',
                    height: '14px',
                    borderRadius: '3px',
                    background: theme.swatch?.[0] || 'var(--card)',
                    position: 'relative',
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: theme.swatch?.[1] || 'var(--dot)',
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                    }}
                  />
                </i>
                <span>{themeName}</span>
              </button>
              <Link
                href={`/create?theme=${theme.id}`}
                title={`${t('cta')} · ${themeName}`}
                style={{
                  fontSize: '11px',
                  color: 'var(--mute)',
                  textDecoration: 'none',
                  padding: '4px 6px',
                  borderRadius: 'var(--r-sm)',
                }}
              >
                &rarr;
              </Link>
            </div>
          );
        })}
      </nav>
    </details>
  );
};

export default ThemeDrawer;

