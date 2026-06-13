/** Auth/marketing pages — no app chrome (mobile bottom nav, app shell theme). */
export const PUBLIC_ROUTE_PREFIXES = [
  '/login',
  '/register',
  '/public-edex',
  '/services',
  '/about',
  '/contact',
  '/ui-test',
] as const;

/** Normalize React Router pathname (case, trailing slash, hash artifacts). */
export function normalizePathname(pathname: string): string {
  const raw = (pathname || '/').split('?')[0].split('#')[0].trim();
  const lower = raw.toLowerCase();
  if (lower === '' || lower === '/') return lower || '/';
  return lower.replace(/\/+$/, '') || '/';
}

export function isPublicRoute(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  return PUBLIC_ROUTE_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`)
  );
}

/** Mobile bottom nav — visible on app routes only, hidden on login/register. */
export function shouldShowMobileBottomNav(pathname: string): boolean {
  return !isPublicRoute(pathname);
}

/**
 * Full-bleed routes — no app column frame (marketing / selected public pages).
 * All other routes use the 28rem app column shell.
 */
export const FULL_BLEED_ROUTE_PREFIXES = [
  '/login',
  '/register',
  '/public-edex',
  '/services',
  '/about',
  '/contact',
  '/ui-test',
] as const;

export function isFullBleedRoute(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  return FULL_BLEED_ROUTE_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

export function usesAppColumnFrame(pathname: string): boolean {
  return !isFullBleedRoute(pathname);
}

/** @deprecated Use usesAppColumnFrame */
export function usesDesktopMobileFrame(pathname: string): boolean {
  return usesAppColumnFrame(pathname);
}
