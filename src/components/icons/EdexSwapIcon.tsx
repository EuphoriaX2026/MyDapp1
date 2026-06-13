export interface EdexSwapIconProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

/** EDex / swap arrows glyph (24×24). */
export function EdexSwapIcon({
  className,
  width = '1em',
  height = '1em',
}: EdexSwapIconProps) {
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
        fill="none"
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth={2}
        d="M21 14.5H4l5 5m-6-10h17l-5-5"
      />
    </svg>
  );
}

export default EdexSwapIcon;
