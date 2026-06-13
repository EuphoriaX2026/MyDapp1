import { useEffect, useState } from 'react';

export const CUSTOM_APP_BG_KEY = 'CUSTOM_APP_BG';
export const CUSTOM_APP_BG_EVENT = 'backgroundChanged';

function readCustomBg(): string | null {
  try {
    const value = localStorage.getItem(CUSTOM_APP_BG_KEY);
    if (!value?.startsWith('data:image/')) return null;
    return value;
  } catch {
    return null;
  }
}

/** Syncs wallpaper from Settings (`CUSTOM_APP_BG` + `backgroundChanged` event). */
export function useCustomAppBackground(): string | null {
  const [bg, setBg] = useState<string | null>(readCustomBg);

  useEffect(() => {
    const sync = () => setBg(readCustomBg());

    window.addEventListener(CUSTOM_APP_BG_EVENT, sync);
    const onStorage = (e: StorageEvent) => {
      if (e.key === CUSTOM_APP_BG_KEY || e.key === null) sync();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(CUSTOM_APP_BG_EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return bg;
}
