import type { CSSProperties } from 'react';
import type { GlassButtonVariant } from '../../components/ui/glass';
import type { CanvasMode } from './types';

export const GLASS_VARIANTS: GlassButtonVariant[] = ['secondary', 'icon'];

export const FINAPP_LIGHT_VARS: Record<string, string> = {
  '--finapp-body-bg': '#ededf5',
  '--finapp-content-bg': '#ffffff',
  '--finapp-heading': '#27173e',
  '--finapp-text': 'rgb(149, 141, 158)',
  '--finapp-text-light': '#a9abad',
  '--finapp-line': '#dcdce9',
  '--finapp-primary': '#6236ff',
  '--app-text-primary': '#27173e',
  '--app-text-muted': '#a9abad',
  '--app-glass-bg': '#ffffff',
  '--app-glass-border': '#dcdce9',
};

export const FINAPP_DARK_VARS: Record<string, string> = {
  '--finapp-body-bg': '#030108',
  '--finapp-content-bg': '#161129',
  '--finapp-heading': '#ffffff',
  '--finapp-text': '#8f82a5',
  '--finapp-text-light': '#69587f',
  '--finapp-line': '#2d1f3b',
  '--finapp-primary': '#6236ff',
  '--app-text-primary': '#ffffff',
  '--app-text-muted': '#69587f',
  '--app-glass-bg': '#161129',
  '--app-glass-border': '#2d1f3b',
};

export function canvasClasses(mode: CanvasMode): string {
  switch (mode) {
    case 'finapp-light':
      return 'finapp-app-shell bg-[#ededf5] text-[#27173e]';
    case 'finapp-dark':
      return 'finapp-app-shell dark-mode bg-[#030108] text-[#8f82a5]';
  }
}

export function canvasStyle(mode: CanvasMode): CSSProperties | undefined {
  if (mode === 'finapp-light') return FINAPP_LIGHT_VARS as CSSProperties;
  if (mode === 'finapp-dark') return FINAPP_DARK_VARS as CSSProperties;
  return undefined;
}
