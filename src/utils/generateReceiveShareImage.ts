import html2canvas from 'html2canvas';

export async function captureElementAsPng(
  element: HTMLElement,
  scale = 3,
): Promise<Blob> {
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    width: element.offsetWidth,
    height: element.offsetHeight,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('IMAGE_EXPORT_FAILED'));
      },
      'image/png',
      1,
    );
  });
}

export function buildReceiveAppLink(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${window.location.pathname}#/receive`;
  }
  return 'https://e-one.io/#/receive';
}

export function buildReceivePaymentUri(address: string): string {
  return `polygon:${address}`;
}

export function splitAddressTwoLines(address: string): [string, string] {
  if (!address || address.length < 12) return [address, ''];
  const mid = Math.ceil(address.length / 2);
  return [address.slice(0, mid), address.slice(mid)];
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

export async function shareReceiveImageBlob(
  blob: Blob,
  shareText: string,
  filename: string,
): Promise<'shared' | 'unsupported' | 'aborted'> {
  if (typeof navigator === 'undefined' || !navigator.share) {
    return 'unsupported';
  }

  const file = new File([blob], filename, { type: 'image/png' });
  const withFile: ShareData = {
    title: 'E.ONE Receive',
    text: shareText,
    files: [file],
  };

  if (navigator.canShare && !navigator.canShare(withFile)) {
    const textOnly: ShareData = { title: 'E.ONE Receive', text: shareText };
    if (navigator.canShare && !navigator.canShare(textOnly)) {
      return 'unsupported';
    }
    try {
      await navigator.share(textOnly);
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'aborted';
      return 'unsupported';
    }
  }

  try {
    await navigator.share(withFile);
    return 'shared';
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return 'aborted';
    return 'unsupported';
  }
}
