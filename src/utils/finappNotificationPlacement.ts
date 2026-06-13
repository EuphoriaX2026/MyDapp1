/** internal = mobile frame portal; public = document body (logged-out shell). */
export type FinappNotificationPlacement = 'internal' | 'public';

export function resolveFinappNotificationPlacement(
  placement?: FinappNotificationPlacement,
): FinappNotificationPlacement {
  if (placement) return placement;
  if (typeof document === 'undefined') return 'internal';
  return document.body.classList.contains('finapp-app-shell') ? 'internal' : 'public';
}

export function resolveFinappNotificationPortal(
  placement: FinappNotificationPlacement,
  portalSelector?: string,
): string {
  if (portalSelector) return portalSelector;
  return placement === 'internal' ? '.invisible-mobile-frame' : 'body';
}
