import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { extractWalletAddressFromText } from '../../utils/addressValidation';
import { FinappOverlayModal } from '../ui/FinappOverlayModal';

interface SendMoneyQrScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (address: string) => void;
}

export function SendMoneyQrScanner({ isOpen, onClose, onScan }: SendMoneyQrScannerProps) {
  const elementId = useId().replace(/:/g, '');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;
    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
    } catch {
      /* ignore stop errors */
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      void stopScanner();
      setError(null);
      setStarting(false);
      return;
    }

    let cancelled = false;
    setStarting(true);
    setError(null);

    const html5QrCode = new Html5Qrcode(elementId);
    scannerRef.current = html5QrCode;

    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (cancelled) return;
        if (!cameras?.length) {
          setError('No camera found on this device.');
          setStarting(false);
          return;
        }

        const backCamera = cameras.find((c) => /back|rear|environment/i.test(c.label));
        const cameraId = backCamera?.id ?? cameras[cameras.length - 1].id;

        return html5QrCode.start(
          cameraId,
          { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
          (decodedText) => {
            const address = extractWalletAddressFromText(decodedText);
            if (!address) return;
            onScan(address);
            void stopScanner().then(onClose);
          },
          () => {},
        );
      })
      .then(() => {
        if (!cancelled) setStarting(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : 'Unable to access the camera.';
        setError(message);
        setStarting(false);
      });

    return () => {
      cancelled = true;
      void stopScanner();
    };
  }, [isOpen, elementId, onClose, onScan, stopScanner]);

  return (
    <FinappOverlayModal
      isOpen={isOpen}
      onClose={() => {
        void stopScanner();
        onClose();
      }}
      title="Scan wallet QR"
      maxWidthClass="max-w-sm"
      ariaLabel="Scan QR code"
    >
      <div className="send-money-qr-modal__viewport">
        <div id={elementId} className="send-money-qr-reader" />
        {starting ? <p className="send-money-qr-modal__status">Starting camera…</p> : null}
      </div>

      {error ? (
        <p className="send-money-qr-modal__error" role="alert">
          {error}
        </p>
      ) : (
        <p className="send-money-qr-modal__hint">
          Point your camera at a wallet address QR code (must start with 0x)
        </p>
      )}
    </FinappOverlayModal>
  );
}
