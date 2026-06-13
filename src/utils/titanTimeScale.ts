/** Mainnet calendar day length (seconds). Used only as fallback when Configs is unavailable. */
export const MAINNET_ONE_DAY_SECONDS = 86_400;

/**
 * Convert remaining on-chain seconds to UI "life days".
 * On Amoy, Configs.oneDay is compressed (e.g. 60s) while packageValidityDuration = 365 * oneDay,
 * so dividing by oneDay yields mainnet-equivalent day counts (365), not wall-clock days.
 */
export function chainSecondsToDisplayDays(
  remainingSeconds: number,
  oneDaySeconds: number,
): number {
  if (remainingSeconds <= 0) return 0;
  const dayUnit = oneDaySeconds > 0 ? oneDaySeconds : MAINNET_ONE_DAY_SECONDS;
  return Math.ceil(remainingSeconds / dayUnit);
}
