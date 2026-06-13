export interface NftNavIconProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  /** Filled shield when active / selected. */
  active?: boolean;
}

/** NFT shield glyph — outline detail (default) and compact fill (active). */
export function NftNavIcon({
  className,
  width = '1em',
  height = '1em',
  active = false,
}: NftNavIconProps) {
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
      {active ? (
        <path
          fill="currentColor"
          d="M9 12a2 2 0 1 0 0-4a2 2 0 0 0 0 4m3-11l9.5 5.5v11L12 23l-9.5-5.5v-11zM4.5 7.653v8.694l2.372 1.373l8.073-5.92l4.555 2.734v-6.88L12 3.31z"
        />
      ) : (
        <path
          fill="currentColor"
          d="M9 12a2 2 0 1 0 0-4a2 2 0 0 0 0 4m12.5-5.5L12 1L2.5 6.5v11L12 23l9.5-5.5zM12 3.311l7.5 4.342v6.88l-4.562-2.736l-7.971 5.978L4.5 16.347V7.653zm0 17.378l-3.152-1.825l6.214-4.66l3.998 2.398z"
        />
      )}
    </svg>
  );
}

export default NftNavIcon;
