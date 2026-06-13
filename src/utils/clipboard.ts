/**
 * Clipboard helpers — must be invoked from a user gesture (click / pointerdown).
 */

export async function readClipboardTextFromUserGesture(): Promise<string> {
  if (typeof navigator === 'undefined') {
    throw new Error('CLIPBOARD_UNAVAILABLE');
  }

  if (navigator.clipboard?.readText) {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) return text;
    } catch {
      /* try read() next */
    }
  }

  if (navigator.clipboard?.read) {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((t) => t === 'text/plain' || t.startsWith('text/'));
        if (!type) continue;
        const blob = await item.getType(type);
        const text = await blob.text();
        if (text.trim()) return text;
      }
    } catch {
      /* fall through */
    }
  }

  throw new Error('CLIPBOARD_UNAVAILABLE');
}

/** @deprecated Use readClipboardTextFromUserGesture */
export async function readClipboardText(): Promise<string> {
  try {
    return await readClipboardTextFromUserGesture();
  } catch {
    return readClipboardTextLegacy();
  }
}

function readClipboardTextLegacy(): Promise<string> {
  return new Promise((resolve) => {
    const textarea = document.createElement('textarea');
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();

    let value = '';
    try {
      const pasted = document.execCommand('paste');
      if (pasted) {
        value = textarea.value;
      }
    } catch {
      value = '';
    }

    document.body.removeChild(textarea);
    resolve(value);
  });
}

export async function writeClipboardText(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined') return false;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fall through */
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export interface PasteApplyResult {
  ok: boolean;
  error?: string;
}

/**
 * Read clipboard during a user gesture and pass raw text to `apply`.
 */
export async function pasteFromClipboard(apply: (text: string) => void): Promise<PasteApplyResult> {
  try {
    const text = await readClipboardTextFromUserGesture();
    apply(text);
    return { ok: true };
  } catch {
    const legacy = await readClipboardTextLegacy();
    if (legacy.trim()) {
      apply(legacy);
      return { ok: true };
    }
    return {
      ok: false,
      error: 'Could not read clipboard. Tap the address field and paste manually (Ctrl+V).',
    };
  }
}
