import { isPublicRoute, normalizePathname } from './appRoutes';

const FINAPP_DARK_STORAGE_KEY = 'FinappDarkmode';

/** Current path from HashRouter or bare hash (for theme sync before Router mounts). */
export function getThemePathname(): string {
  if (typeof window === 'undefined') return '/';
  const hashPath = window.location.hash.replace(/^#/, '');
  if (hashPath) return normalizePathname(hashPath);
  return normalizePathname(window.location.pathname || '/');
}

/** Read persisted Finapp dark-mode preference (Settings toggle). */
export function getFinappDarkModePreference(): boolean {
  return localStorage.getItem(FINAPP_DARK_STORAGE_KEY) === '1';
}

/**
 * Apply Finapp shell classes and toggle `.dark-mode` from user preference.
 * App routes: Finapp Light ↔ Finapp Dark via CSS variables.
 * Public routes: independent shell; dark-mode follows the same preference.
 */
export function syncFinappTheme(pathname: string): void {
  const isPublic = isPublicRoute(pathname);
  const preferDark = getFinappDarkModePreference();

  document.body.classList.toggle('dark-mode', preferDark);

  if (isPublic) {
    document.body.classList.remove('finapp-app-shell');
    document.body.classList.add('finapp-public-shell');
    return;
  }

  document.body.classList.remove('finapp-public-shell');
  document.body.classList.add('finapp-app-shell');
}

/** Toggle dark mode from Settings; persists and re-syncs shell classes. */
export function setFinappDarkMode(enabled: boolean): void {
  localStorage.setItem(FINAPP_DARK_STORAGE_KEY, enabled ? '1' : '0');
  syncFinappTheme(getThemePathname());
}

/** Re-sync public shell if legacy scripts leak app classes or theme drifts. */
export function guardPublicTheme(pathname: string): void {
  if (!isPublicRoute(pathname)) return;
  const preferDark = getFinappDarkModePreference();
  const darkMatches = document.body.classList.contains('dark-mode') === preferDark;
  if (
    document.body.classList.contains('finapp-app-shell') ||
    !document.body.classList.contains('finapp-public-shell') ||
    !darkMatches
  ) {
    syncFinappTheme(pathname);
  }
}

/** Ensure app shell is active on dashboard routes (fixes sidebar/CSS after public pages). */
export function guardAppTheme(pathname: string): void {
  if (isPublicRoute(pathname)) return;
  const preferDark = getFinappDarkModePreference();
  const darkMatches = document.body.classList.contains('dark-mode') === preferDark;
  if (
    document.body.classList.contains('finapp-public-shell') ||
    !document.body.classList.contains('finapp-app-shell') ||
    !darkMatches
  ) {
    syncFinappTheme(pathname);
  }
}
