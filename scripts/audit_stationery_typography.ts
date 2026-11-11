import fs from 'fs';
import path from 'path';
import { getThemesModule, getSchemaModule } from '../src/lib/ddear-runtime';

function luminance(hex: string): number {
  const clean = hex.replace('#', '');
  const rgb = [
    parseInt(clean.slice(0, 2), 16) / 255,
    parseInt(clean.slice(2, 4), 16) / 255,
    parseInt(clean.slice(4, 6), 16) / 255,
  ].map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));

  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrast(hex1: string, hex2: string): number {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const bright = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (bright + 0.05) / (dark + 0.05);
}

async function runAudit() {
  console.log('📜 Auditing Stationery Paper Textures, Materials & Typography...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // SECTION 1: Font Files Existence & Decoding
  // ----------------------------------------------------
  console.log('📌 Section 1: Typography Assets & File Integrity');

  const requiredFonts = [
    { name: 'Dancing Script', file: 'public/fonts/DancingScript.ttf' },
    { name: 'Great Vibes', file: 'public/fonts/GreatVibes.ttf' },
    { name: 'Playfair Italic', file: 'public/fonts/PlayfairItalic.ttf' },
    { name: 'Patrick Hand', file: 'public/fonts/PatrickHand.ttf' },
    { name: 'Charm', file: 'public/fonts/Charm.ttf' },
    { name: 'Cormorant Garamond', file: 'public/fonts/CormorantGaramond-Bold.ttf' },
  ];

  for (const font of requiredFonts) {
    const filePath = path.join(process.cwd(), font.file);
    const exists = fs.existsSync(filePath);
    const size = exists ? fs.statSync(filePath).size : 0;
    assert(exists && size > 50000, `Font "${font.name}" exists and is valid (${Math.round(size / 1024)} KB)`);
  }

  // ----------------------------------------------------
  // SECTION 2: 3D Paper Textures & Normal Maps
  // ----------------------------------------------------
  console.log('\n📌 Section 2: 3D Surface Textures (Normal & Roughness Maps)');

  const paperTextureMaps = [
    'paper001_hra.webp',
    'paper001_n.webp',
    'paper004_hra.webp',
    'paper004_n.webp',
    'paper006_hra.webp',
    'paper006_n.webp',
  ];

  for (const tex of paperTextureMaps) {
    const texPath = path.join(process.cwd(), 'public/textures/paper', tex);
    const exists = fs.existsSync(texPath);
    const size = exists ? fs.statSync(texPath).size : 0;
    assert(exists && size > 10000, `Texture map "${tex}" exists on disk (${Math.round(size / 1024)} KB)`);
  }

  // ----------------------------------------------------
  // SECTION 3: All 13 Themes Configuration & Contrast Ratios
  // ----------------------------------------------------
  console.log('\n📌 Section 3: All 13 Themes Visual & Typography Standards');

  const themesMod = getThemesModule();
  const schemaMod = getSchemaModule();
  const themes = themesMod.z;

  assert(Array.isArray(themes) && themes.length === 13, 'Theme catalogue has all 13 themes');

  for (const theme of themes) {
    const doc = themesMod.C(schemaMod._(), theme);
    const paper = doc.paper;
    const ink = doc.ink;
    const font = doc.font;
    const lighting = doc.lighting;

    // Check paper & ink exist
    assert(Boolean(paper?.type && paper?.tint), `[Theme: ${theme.id}] Has valid paper type (${paper?.type})`);
    assert(Boolean(ink?.color), `[Theme: ${theme.id}] Has valid ink color (${ink?.color})`);
    assert(Boolean(font), `[Theme: ${theme.id}] Has valid font (${font})`);
    assert(Boolean(lighting), `[Theme: ${theme.id}] Has valid lighting (${lighting})`);

    // Check WCAG AA contrast ratio (minimum 4.5:1)
    const ratio = contrast(paper.tint, ink.color);
    const isWcagPass = ratio >= 4.5;
    assert(
      isWcagPass,
      `[Theme: ${theme.id}] Contrast ratio ${ratio.toFixed(2)}:1 passes WCAG AA (>= 4.5:1)`,
      `tint: ${paper.tint}, ink: ${ink.color}`
    );
  }

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n=========================================');
  console.log(`Stationery Audit: ${passed} Passed, ${failed} Failed`);
  console.log('=========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
