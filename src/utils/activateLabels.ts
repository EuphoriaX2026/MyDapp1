import type { ActivatePackageSelection } from '../types/activate';

/** First activation in group → package name; repeat → Renewal (no E1 suffix). */
export function getActivationTypeLabel(selection: ActivatePackageSelection): string {
  return selection.isRenewal ? 'Renewal' : selection.name;
}
