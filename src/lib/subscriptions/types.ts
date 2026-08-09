// Subscriptions module — data model shared by seller & subscriber features.
// Kept isolated so the billing engine can be swapped for the Pi Network
// Subscription Smart Contract (PiRC2) without touching the UI layer.

export type BillingInterval = "weekly" | "monthly" | "yearly";

export type SubscriptionStatus = "pending" | "active" | "past_due" | "canceled" | "expired";

export interface SubscriptionPlan {
  id: string;
  seller_id: string;
  name: string;
  tier: string;
  description: string;
  price: number;
  interval: BillingInterval;
  benefits: string[];
  included_content: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  plan_id: string;
  subscriber_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  next_billing_at: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  /** Reserved for the future Pi Subscription Smart Contract authorization id. */
  pi_contract_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionWithPlan extends Subscription {
  plan: SubscriptionPlan | null;
}

export interface SubscriptionPayment {
  id: string;
  subscription_id: string;
  subscriber_id: string;
  payment_id: string | null;
  txid: string | null;
  amount: number;
  period_start: string;
  period_end: string;
  status: string;
  created_at: string;
}

export const INTERVAL_LABELS: Record<BillingInterval, string> = {
  weekly: "par semaine",
  monthly: "par mois",
  yearly: "par an",
};

export const INTERVAL_DAYS: Record<BillingInterval, number> = {
  weekly: 7,
  monthly: 30,
  yearly: 365,
};

export const TIERS = ["basic", "pro", "premium"] as const;
export type Tier = (typeof TIERS)[number];

export const TIER_LABELS: Record<string, string> = {
  basic: "Basique",
  pro: "Pro",
  premium: "Premium",
};
