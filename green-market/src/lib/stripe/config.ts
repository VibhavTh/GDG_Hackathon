/**
 * Platform fee as a percentage (0-100).
 * Configurable via PLATFORM_FEE_PERCENT env var, defaults to 10%.
 */
export const PLATFORM_FEE_PERCENT = Number(
  process.env.PLATFORM_FEE_PERCENT ?? "10"
);

/**
 * Calculate platform fee in cents from a subtotal in cents.
 * Rounds down to avoid overcharging the farmer.
 */
export function calculatePlatformFeeCents(subtotalCents: number): number {
  return Math.floor(subtotalCents * (PLATFORM_FEE_PERCENT / 100));
}
