export interface DefiIconProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

/** DeFi grid / blocks glyph (24×24). */
export function DefiIcon({
  className,
  width = '1em',
  height = '1em',
}: DefiIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path
        fill="currentColor"
        d="M7.737 7.974v-3.79H21v3.79zm0 5.682v-3.79h9.474v3.79zm-4.737 0v-3.79h3.79v3.79zm4.737 6.16v-3.79H12v3.79z"
      />
    </svg>
  );
}

export default DefiIcon;
