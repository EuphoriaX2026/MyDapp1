import { useId } from 'react';

export interface BalanceVisibilityEyeIconProps {
  /** `true` when balance is visible (open eye); `false` when hidden (slashed eye). */
  showBalance: boolean;
  className?: string;
  width?: string | number;
  height?: string | number;
}

/** Animated eye — hidden state (slash). */
function BalanceEyeHiddenIcon({
  className,
  width = '1em',
  height = '1em',
  maskId,
}: {
  className?: string;
  width?: string | number;
  height?: string | number;
  maskId: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <defs>
        <mask id={maskId}>
          <g fill="#fff">
            <path
              fillOpacity={0}
              stroke="#fff"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2 12c1.72 -3.83 5.53 -6.5 10 -6.5c4.47 0 8.28 2.67 10 6.5c-1.72 3.83 -5.53 6.5 -10 6.5c-4.47 0 -8.28 -2.67 -10 -6.5Z"
            >
              <animate
                fill="freeze"
                attributeName="d"
                dur="0.5s"
                values="M4 12c1.38 -0.77 4.42 -1.3 8 -1.3c3.58 0 6.62 0.53 8 1.3c-1.38 0.77 -4.42 1.3 -8 1.3c-3.58 0 -6.62 -0.53 -8 -1.3Z;M2 12c1.72 -3.83 5.53 -6.5 10 -6.5c4.47 0 8.28 2.67 10 6.5c-1.72 3.83 -5.53 6.5 -10 6.5c-4.47 0 -8.28 -2.67 -10 -6.5Z"
              />
              <animate fill="freeze" attributeName="fill-opacity" begin="0.5s" dur="0.15s" to={0.3} />
            </path>
            <circle cx={12} cy={12} r={3}>
              <animate fill="freeze" attributeName="r" dur="0.2s" values="0;3" />
            </circle>
          </g>
          <path
            fill="none"
            stroke="#000"
            strokeDasharray={26}
            strokeDashoffset={26}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M0 11h24"
            transform="rotate(45 12 12)"
          >
            <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.75s" dur="0.4s" to={0} />
          </path>
        </mask>
      </defs>
      <path fill="currentColor" d="M0 0h24v24H0z" mask={`url(#${maskId})`} />
      <path
        fill="none"
        stroke="currentColor"
        strokeDasharray={26}
        strokeDashoffset={26}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M0 13h24"
        transform="rotate(45 12 12)"
      >
        <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.75s" dur="0.4s" to={0} />
      </path>
    </svg>
  );
}

/** Animated eye — visible state (open). */
function BalanceEyeVisibleIcon({
  className,
  width = 24,
  height = 24,
}: {
  className?: string;
  width?: string | number;
  height?: string | number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <g fill="currentColor">
        <path
          fillOpacity={0}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2 12c1.72 -3.83 5.53 -6.5 10 -6.5c4.47 0 8.28 2.67 10 6.5c-1.72 3.83 -5.53 6.5 -10 6.5c-4.47 0 -8.28 -2.67 -10 -6.5Z"
        >
          <animate
            fill="freeze"
            attributeName="d"
            dur="0.5s"
            values="M4 12c1.38 -0.77 4.42 -1.3 8 -1.3c3.58 0 6.62 0.53 8 1.3c-1.38 0.77 -4.42 1.3 -8 1.3c-3.58 0 -6.62 -0.53 -8 -1.3Z;M2 12c1.72 -3.83 5.53 -6.5 10 -6.5c4.47 0 8.28 2.67 10 6.5c-1.72 3.83 -5.53 6.5 -10 6.5c-4.47 0 -8.28 -2.67 -10 -6.5Z"
          />
          <animate fill="freeze" attributeName="fill-opacity" begin="0.5s" dur="0.15s" to={0.3} />
        </path>
        <circle cx={12} cy={12} r={3}>
          <animate fill="freeze" attributeName="r" dur="0.2s" values="0;3" />
        </circle>
      </g>
    </svg>
  );
}

export function BalanceVisibilityEyeIcon({
  showBalance,
  className,
  width,
  height,
}: BalanceVisibilityEyeIconProps) {
  const maskId = useId().replace(/:/g, '');

  if (showBalance) {
    return (
      <BalanceEyeVisibleIcon
        className={className}
        width={width ?? 24}
        height={height ?? 24}
      />
    );
  }

  return (
    <BalanceEyeHiddenIcon
      className={className}
      width={width ?? '1em'}
      height={height ?? '1em'}
      maskId={maskId}
    />
  );
}

export default BalanceVisibilityEyeIcon;
