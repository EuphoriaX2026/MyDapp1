import { useCallback, useState } from 'react';

const DISCLAIMER_STORAGE_KEY = 'eone_disclaimer_accepted';

function readShowDisclaimer(): boolean {
  try {
    return localStorage.getItem(DISCLAIMER_STORAGE_KEY) !== 'true';
  } catch {
    return true;
  }
}

export function useDisclaimer() {
  const [showDisclaimer, setShowDisclaimer] = useState(() => readShowDisclaimer());

  const acceptDisclaimer = useCallback(() => {
    try {
      localStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
    } catch {
      /* storage unavailable */
    }
    setShowDisclaimer(false);
  }, []);

  return { showDisclaimer, acceptDisclaimer };
}
