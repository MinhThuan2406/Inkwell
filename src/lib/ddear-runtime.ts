'use client';

import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import Link from 'next/link';
import * as NextNavigation from 'next/navigation';
import { create } from 'zustand';
import * as opentype from 'opentype.js';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';
import { DDEAR_FACTORIES } from './ddear-bundle';
import { InkwellWordmark } from '@/components/brand';
import { ensureFontsReady, trackCanvasTexture } from './font-guard';

if (typeof window !== 'undefined') {
  void ensureFontsReady();
}

if (typeof globalThis.matchMedia === 'undefined') {
  (globalThis as any).matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
if (typeof (globalThis as any).devicePixelRatio === 'undefined') {
  (globalThis as any).devicePixelRatio = 1;
}

class GuardedCanvasTexture extends THREE.CanvasTexture {
  constructor(...args: ConstructorParameters<typeof THREE.CanvasTexture>) {
    super(...args);
    trackCanvasTexture(this);
  }
}

const THREE_90072: Record<string, any> = {
  CQ: THREE.PlaneGeometry,
  DT: THREE.DynamicDrawUsage,
  Es: THREE.Color,
  FP: THREE.RepeatWrapping,
  FS: THREE.Euler,
  Gu: THREE.SphereGeometry,
  H5: THREE.TextureLoader,
  Ik: THREE.NoColorSpace,
  Jy: THREE.ExtrudeGeometry,
  L0: THREE.Sphere,
  Nk: GuardedCanvasTexture,
  Ow: THREE.Shape,
  Ox: THREE.MeshPhysicalMaterial,
  Sk: THREE.Texture,
  Tu: THREE.REVISION,
  U7: THREE.DataTexture,
  VQ: THREE.Box3,
  Va: THREE.DodecahedronGeometry,
  Vs: THREE.DoubleSide,
  Xl: THREE.Box2,
  Zg: THREE.ShaderMaterial,
  _m: THREE.Plane,
  aV: THREE.MeshStandardMaterial,
  as: THREE.Quaternion,
  cE: THREE.Vector3,
  de: THREE.FrontSide,
  f5: THREE.BufferAttribute,
  fa: THREE.TorusGeometry,
  i8: THREE.PCFShadowMap,
  kE: THREE.Mesh,
  kG: THREE.BoxGeometry,
  ki: THREE.Float32BufferAttribute,
  ld: THREE.BufferGeometry,
  nd: THREE.Matrix4,
  nj: THREE.SRGBColorSpace,
  p$: THREE.MeshBasicMaterial,
  pB: THREE.Path,
  rB: THREE.MathUtils,
  rj: THREE.LatheGeometry,
  t: THREE.Object3D,
  tw: THREE.BackSide,
  wq: THREE.Vector2,
  x1: THREE.ImageLoader,
  x8: THREE.NeutralToneMapping,
  zx: THREE.Raycaster,
};

const THREE_8560: Record<string, any> = {
  Y: THREE.ShaderChunk,
};

function dynamicBridge(loader: () => Promise<any>) {
  return function DynamicComponent(props: any) {
    const [Comp, setComp] = React.useState<any>(null);
    React.useEffect(() => {
      let active = true;
      loader().then((mod) => {
        if (active) setComp(() => mod?.default ?? mod);
      });
      return () => {
        active = false;
      };
    }, []);
    return Comp ? React.createElement(Comp, props) : null;
  };
}

const SafeReact = {
  ...React,
  useEffect(effect: () => any, deps?: React.DependencyList) {
    return React.useEffect(() => {
      const cleanup = effect();
      return typeof cleanup === 'function' ? cleanup : undefined;
    }, deps);
  },
  useLayoutEffect(effect: () => any, deps?: React.DependencyList) {
    return React.useLayoutEffect(() => {
      const cleanup = effect();
      return typeof cleanup === 'function' ? cleanup : undefined;
    }, deps);
  },
};

const WrappedNextNavigation = {
  ...NextNavigation,
  useRouter() {
    let router: any = null;
    try {
      router = NextNavigation.useRouter();
    } catch {}
    return React.useMemo(
      () => ({
        isReady: true,
        query: {},
        pathname: typeof window !== 'undefined' ? window.location.pathname : '',
        asPath:
          typeof window !== 'undefined'
            ? window.location.pathname + window.location.search
            : '',
        push: router?.push?.bind(router) ?? (() => {}),
        replace: router?.replace?.bind(router) ?? (() => {}),
        back: router?.back?.bind(router) ?? (() => {}),
        forward: router?.forward?.bind(router) ?? (() => {}),
        prefetch: router?.prefetch?.bind(router) ?? (() => {}),
        refresh() {
          router?.refresh?.();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('dear:refresh'));
          }
        },
      }),
      [router]
    );
  },
};

const externalModules = new Map<number, any>([
  [43476, jsxRuntime],
  [71645, { default: SafeReact, ...SafeReact }],
  [22016, { default: Link }],
  [70703, { default: dynamicBridge }],
  [18566, WrappedNextNavigation],
  [32009, WrappedNextNavigation],
  [68834, { f: create }],
  [45587, { ...opentype, default: opentype }],
  [38408, { f: useThree }],
  [98903, { f: useFrame }],
  [48244, { f: Canvas }],
  [90072, THREE_90072],
  [8560, THREE_8560],
]);

const moduleCache = new Map<number, any>();
const factoryMap = new Map<number, { ids: number[]; fn: (e: any) => void; executed?: boolean }>();

for (const entry of DDEAR_FACTORIES) {
  for (const id of entry.ids) {
    factoryMap.set(id, entry);
  }
}

export function getDdearModule(id: number): any {
  if (externalModules.has(id)) {
    return externalModules.get(id);
  }
  if (moduleCache.has(id) && factoryMap.get(id)?.executed) {
    return moduleCache.get(id);
  }
  const entry = factoryMap.get(id);
  if (!entry) {
    throw new Error(`Missing ddear module: ${id}`);
  }
  if (!entry.executed) {
    entry.executed = true;
    for (const gid of entry.ids) {
      if (!moduleCache.has(gid)) {
        moduleCache.set(gid, {});
      }
    }
    const ctx = {
      drei: { Environment, Lightformer, PerformanceMonitor },
      r3f: { Canvas },
      gsap,
      i(depId: number) {
        return getDdearModule(depId);
      },
      r(depId: number) {
        return getDdearModule(depId);
      },
      A(asyncId: number) {
        if (asyncId === 16057) {
          return Promise.resolve(getDdearModule(18639));
        }
        return Promise.resolve(getDdearModule(asyncId));
      },
      s(arr: any[], targetId?: number) {
        const resolvedId = targetId ?? entry.ids[0];
        let target = moduleCache.get(resolvedId);
        if (!target) {
          target = {};
          moduleCache.set(resolvedId, target);
        }
        let idx = 0;
        while (idx < arr.length) {
          const key = arr[idx];
          if (arr[idx + 1] === 0) {
            const val = arr[idx + 2];
            Object.defineProperty(target, key, {
              value: val,
              enumerable: true,
              configurable: true,
              writable: true,
            });
            idx += 3;
          } else {
            const getter = arr[idx + 1];
            Object.defineProperty(target, key, {
              get: getter,
              enumerable: true,
              configurable: true,
            });
            idx += 2;
          }
        }
      },
    };
    entry.fn(ctx);
    if (entry.ids.includes(96604)) {
      const mod96604 = moduleCache.get(96604);
      if (mod96604) {
        Object.defineProperty(mod96604, 'B', {
          value: InkwellWordmark,
          enumerable: true,
          configurable: true,
          writable: true,
        });
      }
    }
  }
  return moduleCache.get(id);
}

export function getClientUser(): { name: string; email: string } | null {
  if (typeof document === 'undefined') {
    return { name: 'Inkwell', email: 'atelier@inkwell.local' };
  }
  const isSignedOut = document.cookie
    .split('; ')
    .some((c) => {
      const trimmed = c.trim();
      return trimmed === 'inkwell_auth=0' || trimmed === 'dear_auth=0';
    });
  return isSignedOut ? null : { name: 'Inkwell', email: 'atelier@inkwell.local' };
}

export const Landing: React.ComponentType<{
  user?: any;
  enabled?: boolean;
  notice?: string | null;
}> = (props) => {
  const Mod = getDdearModule(18551).Landing;
  return React.createElement(Mod, props);
};

export const Editor: React.ComponentType<{
  reply?: any;
  theme?: string | null;
  user?: any;
  enabled?: boolean;
  draft?: any;
  claim?: any;
}> = (props) => {
  const Mod = getDdearModule(43294).Editor;
  return React.createElement(Mod, props);
};

export const Viewer: React.ComponentType<{
  letter: any;
  replyFrom?: any;
  reportEnabled?: boolean;
}> = (props) => {
  const Mod = getDdearModule(19248).Viewer;
  return React.createElement(Mod, props);
};

export const LetterUnlock: React.ComponentType<{
  id: string;
}> = (props) => {
  const Mod = getDdearModule(61447).LetterUnlock;
  return React.createElement(Mod, props);
};

export const MyLetters: React.ComponentType<{
  user: any;
  enabled: boolean;
  letters: any[];
  tab: string;
  notice?: string | null;
}> = (props) => {
  const Mod = getDdearModule(35655).MyLetters;
  return React.createElement(Mod, props);
};

export const BrandWordmark: React.ComponentType = InkwellWordmark;

export const LanguageSwitch: React.ComponentType = () => {
  const Mod = getDdearModule(215).f;
  return React.createElement(Mod);
};

export function useDdearTranslation() {
  return getDdearModule(58654).H();
}

export function getThemesModule() {
  return getDdearModule(14690);
}

export function getSchemaModule() {
  return getDdearModule(33857);
}
