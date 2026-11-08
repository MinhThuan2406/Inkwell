/**
 * Inkwell Font Guard Layer
 * Eliminates WebGL/Canvas2D texture baking race conditions.
 * Ensures custom calligraphy and atelier typography are decoded into browser memory
 * before procedural canvas textures bake onto GPU materials.
 */

export const ATELIER_FONTS = [
  // Primary Inkwell identifiers
  'inkwell-dancing',
  'inkwell-greatvibes',
  'inkwell-playfair',
  'inkwell-patrick',
  'inkwell-charm',
  'Cormorant Garamond',
  // Backward-compatible aliases for legacy letters
  'dear-dancing',
  'dear-greatvibes',
  'dear-playfair',
  'dear-patrick',
  'dear-charm',
] as const;

export type AtelierFontName = (typeof ATELIER_FONTS)[number];

let fontsReadyPromise: Promise<void> | null = null;
const trackedTextures = new Set<WeakRef<{ needsUpdate: boolean }>>();
let isListeningToFontEvents = false;

function setupFontLoadingListener() {
  if (typeof document === 'undefined' || !('fonts' in document) || isListeningToFontEvents) {
    return;
  }

  isListeningToFontEvents = true;

  const handleLoadingDone = () => {
    // Notify all living canvas textures to re-upload to GPU
    for (const ref of trackedTextures) {
      const tex = ref.deref();
      if (tex) {
        tex.needsUpdate = true;
      } else {
        trackedTextures.delete(ref);
      }
    }
  };

  document.fonts.addEventListener('loadingdone', handleLoadingDone);
}

/**
 * Returns true if all document fonts are currently loaded.
 */
export function isFontsReady(): boolean {
  if (typeof document === 'undefined' || !('fonts' in document)) {
    return true;
  }
  return document.fonts.status === 'loaded';
}

/**
 * Preloads all atelier fonts and awaits document.fonts.ready.
 * Safe for repeated calls; caches the loading promise.
 */
export function ensureFontsReady(): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) {
    return Promise.resolve();
  }

  if (fontsReadyPromise) {
    return fontsReadyPromise;
  }

  setupFontLoadingListener();

  fontsReadyPromise = (async () => {
    try {
      // Trigger speculative load of all handwriting and serif fonts
      const loadPromises = ATELIER_FONTS.map((font) =>
        document.fonts.load(`16px "${font}"`).catch(() => {
          // Gracefully continue if an optional font is unavailable
        })
      );

      await Promise.all([document.fonts.ready, ...loadPromises]);
    } catch {
      // Non-fatal: if font API fails or throws, fallback fonts apply
    }
  })();

  return fontsReadyPromise;
}

/**
 * Subscribes a callback to font loading events.
 * Executes immediately if document.fonts is already loaded.
 */
export function onFontsLoaded(callback: () => void): () => void {
  if (typeof document === 'undefined' || !('fonts' in document)) {
    callback();
    return () => {};
  }

  if (document.fonts.status === 'loaded') {
    callback();
  }

  const handler = () => {
    callback();
  };

  document.fonts.addEventListener('loadingdone', handler);
  return () => {
    document.fonts.removeEventListener('loadingdone', handler);
  };
}

/**
 * Registers a Three.js CanvasTexture so it automatically marks
 * `texture.needsUpdate = true` whenever fonts complete loading.
 */
export function trackCanvasTexture<T extends { needsUpdate: boolean }>(texture: T): () => void {
  setupFontLoadingListener();
  const ref = new WeakRef(texture);
  trackedTextures.add(ref);

  return () => {
    trackedTextures.delete(ref);
  };
}
