import React from 'react';

/** Blue badge checkmark for EDex approve review (duo-tone). */
export function EdexApproveBadgeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={64}
      height={64}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path
        fill="#0002fd"
        fillRule="evenodd"
        d="M10.586 2.1a2 2 0 0 1 2.7-.116l.128.117L15.314 4H18a2 2 0 0 1 1.994 1.85L20 6v2.686l1.9 1.9a2 2 0 0 1 .116 2.701l-.117.127-1.9 1.9V18a2 2 0 0 1-1.85 1.995L18 20h-2.685l-1.9 1.9a2 2 0 0 1-2.701.116l-.127-.116-1.9-1.9H6a2 2 0 0 1-1.995-1.85L4 18v-2.686l-1.9-1.9a2 2 0 0 1-.116-2.701l.116-.127 1.9-1.9V6a2 2 0 0 1 1.85-1.994L6 4h2.686z"
        opacity={0.3}
      />
      <path
        fill="#0002fd"
        fillRule="evenodd"
        d="m15.079 8.983-4.244 4.244-1.768-1.768a1 1 0 1 0-1.414 1.415l2.404 2.404a1.1 1.1 0 0 0 1.556 0l4.88-4.881a1 1 0 0 0-1.414-1.414"
      />
    </svg>
  );
}
