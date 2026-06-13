import { forwardRef } from 'react';
import QRCode from 'react-qr-code';

import { media } from '../../assets/media';
import {
  buildReceiveAppLink,
  splitAddressTwoLines,
} from '../../utils/generateReceiveShareImage';
import '../../styles/receive-share-export.css';

export interface ReceiveShareExportCardProps {
  address: string;
  tokenSymbol: string;
  networkShort: string;
  tokenLogo: string;
}

export const ReceiveShareExportCard = forwardRef<HTMLDivElement, ReceiveShareExportCardProps>(
  function ReceiveShareExportCard(
    { address, tokenSymbol, networkShort, tokenLogo },
    ref,
  ) {
    const tokenNetworkLabel = `${tokenSymbol} (${networkShort})`;
    const tokenNetworkBold = `${tokenSymbol}(${networkShort})`;
    const [addressLine1, addressLine2] = splitAddressTwoLines(address);
    const appLink = buildReceiveAppLink();
    const siteHost = typeof window !== 'undefined' ? window.location.host : 'e-one.io';

    return (
      <div ref={ref} className="receive-share-export" aria-hidden>
        <div className="receive-share-export__body">
          <div className="receive-share-export__header">
            <div className="receive-share-export__token-icon-wrap">
              <img
                src={tokenLogo}
                alt=""
                className="receive-share-export__token-icon"
                crossOrigin="anonymous"
              />
              <img
                src={media.tokens.polygon}
                alt=""
                className="receive-share-export__chain-badge"
                crossOrigin="anonymous"
              />
            </div>
            <span className="receive-share-export__token-label">{tokenNetworkLabel}</span>
          </div>

          <div className="receive-share-export__qr-wrap">
            <div className="receive-share-export__qr-inner">
              <QRCode
                value={address}
                size={220}
                level="M"
                bgColor="#FFFFFF"
                fgColor="#000000"
                className="receive-share-export__qr"
              />
              <div className="receive-share-export__qr-badge">
                <img
                  src={tokenLogo}
                  alt=""
                  className="receive-share-export__qr-badge-img"
                  crossOrigin="anonymous"
                />
              </div>
            </div>
          </div>

          <p className="receive-share-export__address">
            {addressLine1}
            {addressLine2 ? (
              <>
                <br />
                {addressLine2}
              </>
            ) : null}
          </p>

          <p className="receive-share-export__warning">
            This address can only accept assets on{' '}
            <strong>{tokenNetworkBold}</strong>. Sending any other types of tokens to this address
            will result in permanent loss.
          </p>
        </div>

        <div className="receive-share-export__footer">
          <div className="receive-share-export__brand">
            <img
              src={media.logos.app}
              alt=""
              className="receive-share-export__brand-logo"
              crossOrigin="anonymous"
            />
            <div className="receive-share-export__brand-text">
              <span className="receive-share-export__brand-name">E.ONE</span>
              <span className="receive-share-export__brand-url">{siteHost}</span>
            </div>
          </div>

          <div className="receive-share-export__app-qr">
            <div className="receive-share-export__app-qr-inner">
              <QRCode value={appLink} size={56} level="M" bgColor="#FFFFFF" fgColor="#000000" />
              <img
                src={media.logos.my}
                alt=""
                className="receive-share-export__app-qr-logo"
                crossOrigin="anonymous"
              />
            </div>
            <span className="receive-share-export__app-qr-label">Download App</span>
          </div>
        </div>
      </div>
    );
  },
);
