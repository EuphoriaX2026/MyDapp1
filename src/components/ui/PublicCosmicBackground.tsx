import { media } from '../../assets/media';

export function PublicCosmicBackground() {
  return (
    <img
      src={media.backgrounds.cosmicHorizon}
      alt=""
      className="absolute inset-0 h-full w-full object-cover"
      aria-hidden
    />
  );
}

export default PublicCosmicBackground;
