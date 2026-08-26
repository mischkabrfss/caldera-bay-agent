import { getDb } from './db';
import { getCurrentUser, type User } from './auth';

export type VipType = 'safe' | 'premium' | 'grosse_cote';

export const VIP_TYPES: VipType[] = ['safe', 'premium', 'grosse_cote'];

export const VIP_LABELS: Record<VipType, string> = {
  safe: 'VIP Safe',
  premium: 'VIP Premium',
  grosse_cote: 'VIP Grosse Cote',
};

export const VIP_SLUGS: Record<VipType, string> = {
  safe: 'safe',
  premium: 'premium',
  grosse_cote: 'grosse-cote',
};

export function vipTypeFromSlug(slug: string): VipType | null {
  if (slug === 'safe') return 'safe';
  if (slug === 'premium') return 'premium';
  if (slug === 'grosse-cote') return 'grosse_cote';
  return null;
}

export type Subscription = {
  id: number;
  user_id: number;
  vip_type: VipType;
  plan: 'monthly' | 'lifetime';
  status: string;
  amount: number;
  start_date: string | null;
  end_date: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
};

function isLive(sub: Subscription): boolean {
  if (sub.status !== 'active') return false;
  if (sub.plan === 'lifetime') return true;
  if (!sub.end_date) return false;
  return new Date(`${sub.end_date.replace(' ', 'T')}Z`).getTime() > Date.now();
}

export async function listSubscriptions(userId: number): Promise<Subscription[]> {
  const db = await getDb();
  const { results } = await db
    .prepare('SELECT * FROM subscriptions WHERE user_id = ?1 ORDER BY created_at DESC')
    .bind(userId)
    .all<Subscription>();
  return results ?? [];
}

/** Subscriptions that are paid for and still valid right now. */
export async function activeSubscriptions(userId: number): Promise<Subscription[]> {
  return (await listSubscriptions(userId)).filter(isLive);
}

export async function grantedVipTypes(userId: number): Promise<VipType[]> {
  const active = await activeSubscriptions(userId);
  return VIP_TYPES.filter((type) => active.some((sub) => sub.vip_type === type));
}

export type Viewer = { user: User; vips: VipType[] };

/**
 * Server-side gate for a VIP area. Returns null when the visitor is not signed
 * in or has no live subscription for that area — never trust the URL alone.
 */
export async function requireVip(type: VipType): Promise<Viewer | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const vips = await grantedVipTypes(user.id);
  if (user.role === 'admin') return { user, vips: VIP_TYPES };
  return vips.includes(type) ? { user, vips } : null;
}
