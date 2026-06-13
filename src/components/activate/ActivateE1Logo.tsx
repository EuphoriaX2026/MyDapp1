import { useState } from 'react';

import { media } from '../../assets/media';

const E1_LOGO_SRC = media.logos.e1;

export function ActivateE1Logo({
  className = 'h-5 w-auto',
  variant = 'default',
}: {
  className?: string;
  variant?: 'default' | 'white';
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`activate-flow-text ${variant === 'white' ? 'text-white' : 'text-[#1a1a2e]'}`}
      >
        e1
      </span>
    );
  }

  return (
    <img
      src={E1_LOGO_SRC}
      alt="E1"
      className={`inline-block object-contain ${variant === 'white' ? 'activate-e1-logo-white' : ''} ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
