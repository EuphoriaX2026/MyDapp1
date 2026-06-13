import React from 'react';

export interface ActivateLockMessageProps {
  children: React.ReactNode;
  className?: string;
}

export function ActivateLockMessage({ children, className = '' }: ActivateLockMessageProps) {
  return (
    <p
      className={`activate-lock-message text-center text-[13px] font-medium ${className}`.trim()}
    >
      {children}
    </p>
  );
}
