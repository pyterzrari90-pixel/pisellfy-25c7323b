// Data access for the Subscriptions module. No payment logic here.
import { supabase } from "@/integrations/supabase/client";
import { addInterval } from "./billing";
import type {
  BillingInterval,
  Subscription,
  SubscriptionPayment,
  SubscriptionPlan,
  SubscriptionWithPlan,
} from "./types";

const asPlan = (row: Record<string, unknown>): SubscriptionPlan => ({
  ...(row as unknown as SubscriptionPlan),
  benefits: Array.isArray(row.benefits) ? (row.benefits as string[]) : [],
  included_content: Array.isArray(row.included_content) ? (row.included_content as string[]) : [],
  price: Number(row.price),
});

export async function listActivePlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(asPlan);
}

export async function listMyPlans(sellerId: string): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(asPlan);
}

export interface PlanInput {
  name: string;
  tier: string;
  description: string;
  price: number;
  interval: BillingInterval;
  benefits: string[];
  included_content: string[];
}

export async function createPlan(sellerId: string, input: PlanInput): Promise<SubscriptionPlan> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .insert({ ...input, seller_id: sellerId })
    .select("*")
    .single();
  if (error) throw error;
  return asPlan(data);
}

export async function setPlanActive(planId: string, isActive: boolean) {
  const { error } = await supabase
    .from("subscription_plans")
    .update({ is_active: isActive })
    .eq("id", planId);
  if (error) throw error;
}

export async function listMySubscriptions(userId: string): Promise<SubscriptionWithPlan[]> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, plan:subscription_plans(*)")
    .eq("subscriber_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...(row as unknown as Subscription),
    plan: row.plan ? asPlan(row.plan as Record<string, unknown>) : null,
  }));
}

/** Subscriptions on plans owned by the seller (RLS enforces ownership). */
export async function listSubscribersForSeller(sellerId: string): Promise<SubscriptionWithPlan[]> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, plan:subscription_plans!inner(*)")
    .eq("plan.seller_id", sellerId);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...(row as unknown as Subscription),
    plan: row.plan ? asPlan(row.plan as Record<string, unknown>) : null,
  }));
}

export async function activateSubscription(params: {
  planId: string;
  subscriberId: string;
  interval: BillingInterval;
  amount: number;
  paymentId: string;
  txid: string;
}): Promise<Subscription> {
  const start = new Date();
  const end = addInterval(start, params.interval);

  const { data, error } = await supabase
    .from("subscriptions")
    .upsert(
      {
        plan_id: params.planId,
        subscriber_id: params.subscriberId,
        status: "active",
        current_period_start: start.toISOString(),
        current_period_end: end.toISOString(),
        next_billing_at: end.toISOString(),
        cancel_at_period_end: false,
        canceled_at: null,
      },
      { onConflict: "plan_id,subscriber_id" },
    )
    .select("*")
    .single();
  if (error) throw error;

  const sub = data as unknown as Subscription;
  const { error: payError } = await supabase.from("subscription_payments").insert({
    subscription_id: sub.id,
    subscriber_id: params.subscriberId,
    payment_id: params.paymentId,
    txid: params.txid,
    amount: params.amount,
    period_start: start.toISOString(),
    period_end: end.toISOString(),
    status: "completed",
  });
  if (payError) throw payError;

  return sub;
}

/** Cancels at period end: access stays until the paid period expires. */
export async function cancelSubscription(subscriptionId: string) {
  const { error } = await supabase
    .from("subscriptions")
    .update({ cancel_at_period_end: true, canceled_at: new Date().toISOString() })
    .eq("id", subscriptionId);
  if (error) throw error;
}

export async function resumeSubscription(subscriptionId: string) {
  const { error } = await supabase
    .from("subscriptions")
    .update({ cancel_at_period_end: false, canceled_at: null, status: "active" })
    .eq("id", subscriptionId);
  if (error) throw error;
}

export async function listMySubscriptionPayments(userId: string): Promise<SubscriptionPayment[]> {
  const { data, error } = await supabase
    .from("subscription_payments")
    .select("*")
    .eq("subscriber_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as SubscriptionPayment[];
}
