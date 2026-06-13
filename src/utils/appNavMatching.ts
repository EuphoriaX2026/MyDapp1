import { normalizePathname } from './appRoutes';

/** Exact match for nav highlight (case-normalized). */
export function isExactNavPath(pathname: string, target: string): boolean {
  return normalizePathname(pathname) === normalizePathname(target);
}

/** Section home + nested routes, e.g. /store → /store/checkout */
export function isNavSectionActive(pathname: string, sectionPath: string): boolean {
  const current = normalizePathname(pathname);
  const section = normalizePathname(sectionPath);
  if (section === '/') return current === '/';
  return current === section || current.startsWith(`${section}/`);
}

/** Unified on-device transaction hub — must NOT match /transaction/:id detail routes. */
export function isTransactionsNavActive(pathname: string): boolean {
  return isExactNavPath(pathname, '/transactions');
}

/** Activate packages page + execution flow — excludes history redirect (/activate/history → transactions). */
export function isActivateNavActive(pathname: string): boolean {
  const current = normalizePathname(pathname);
  return current === '/activate' || current === '/activate/execution';
}
