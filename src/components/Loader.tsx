import { media } from '../assets/media';

export const Loader = () => {
  return (
    <div
      id="route-loader"
      className="route-loader finapp-loader-overlay"
      aria-hidden="true"
    >
      <div className="finapp-loader-logo-slot">
        <img
          src={media.icons.loading}
          alt=""
          className="finapp-loader-logo finapp-loader-logo--light"
          width={42}
          height={42}
          decoding="sync"
        />
        <img
          src={media.logos.app}
          alt=""
          className="finapp-loader-logo finapp-loader-logo--dark"
          width={42}
          height={42}
          decoding="sync"
        />
      </div>
    </div>
  );
};
