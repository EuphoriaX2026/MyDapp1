/**
 * Re-fetch wallet reads several times — Amoy RPC often lags behind block confirmation.
 */
export async function pollBalanceRefresh(
  refetch: () => Promise<unknown>,
  options?: { attempts?: number; intervalMs?: number },
): Promise<void> {
  const attempts = options?.attempts ?? 12;
  const intervalMs = options?.intervalMs ?? 1_000;

  for (let i = 0; i < attempts; i++) {
    await refetch();
    if (i + 1 < attempts) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }
}
