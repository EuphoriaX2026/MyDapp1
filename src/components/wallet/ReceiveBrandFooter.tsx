import QRCode from 'react-qr-code';

import { media } from '../../assets/media';

function buildAppDownloadLink(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${window.location.pathname}#/receive`;
  }
  return 'https://e-one.io/#/receive';
}

export function ReceiveBrandFooter() {
  const appLink = buildAppDownloadLink();
  const siteHost = typeof window !== 'undefined' ? window.location.host : 'e-one.io';

  return (
    <div className="receive-brand-footer">
      <div className="receive-brand-footer__brand">
        <img src={media.logos.app} alt="" className="receive-brand-footer__logo" />
        <div className="receive-brand-footer__text">
          <span className="receive-brand-footer__name">E.ONE</span>
          <span className="receive-brand-footer__url">{siteHost}</span>
        </div>
      </div>

      <div className="receive-brand-footer__app-qr">
        <div className="receive-brand-footer__app-qr-inner">
          <QRCode value={appLink} size={56} level="M" bgColor="#FFFFFF" fgColor="#000000" />
          <img
            src={media.logos.my}
            alt=""
            className="receive-brand-footer__app-qr-logo"
            aria-hidden
          />
        </div>
        <span className="receive-brand-footer__app-qr-label">Download App</span>
      </div>
    </div>
  );
}
