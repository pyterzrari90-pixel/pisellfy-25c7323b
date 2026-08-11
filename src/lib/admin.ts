/**
 * Admin access control (front-office restriction).
 *
 * Only the Pi usernames / uids listed here can open the platform dashboard.
 * Configure with VITE_ADMIN_USERNAMES="alice,bob" (comma separated).
 */

const configured = (import.meta.env['VITE_ADMIN_USERNAMES'] as string | undefined) ?? "SWILLER90";

export const ADMIN_USERNAMES = configured
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

export function isAdmin(user: { username?: string; uid?: string } | null | undefined): boolean {
  if (!user) return false;
  const username = (user.username ?? "").toLowerCase();
  const uid = (user.uid ?? "").toLowerCase();
  return ADMIN_USERNAMES.includes(username) || ADMIN_USERNAMES.includes(uid);
}

/** Platform commission applied to every sale, used for admin reporting. */
export const PLATFORM_COMMISSION_RATE = 0.05;
