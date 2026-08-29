// Data access for Points and Referrals system
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";
import {
  POINTS_CONFIG,
  type PointsReason,
  type PointsRedemption,
} from "./types";

export type UserPoints = Tables<"user_points">;
export type PointsTransaction = Tables<"points_transactions">;
export type Referral = Tables<"referrals">;

/**
 * Get user's points balance and info
 */
export async function getUserPoints(userId: string): Promise<UserPoints | null> {
  const { data, error } = await supabase
    .from("user_points")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

/**
 * Get user's points transaction history
 */
export async function getPointsHistory(userId: string): Promise<PointsTransaction[]> {
  const { data, error } = await supabase
    .from("points_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Award points to a user (server-side only)
 */
export async function awardPoints(params: {
  userId: string;
  amount: number;
  reason: PointsReason;
  description: string;
  metadata?: Json;
}): Promise<PointsTransaction> {
  const { userId, amount, reason, description, metadata } = params;

  // Start a transaction
  const { data: transaction, error: txError } = await supabase
    .from("points_transactions")
    .insert({
      user_id: userId,
      amount,
      reason,
      description,
      metadata: metadata || null,
    })
    .select("*")
    .single();

  if (txError) throw txError;

  // Update or create user points balance
  const { error: upsertError } = await supabase
    .from("user_points")
    .upsert(
      {
        user_id: userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (upsertError) throw upsertError;

  return transaction;
}

/**
 * Redeem points for Pi discount
 */
export async function redeemPoints(
  userId: string,
  pointsToRedeem: number,
  currentPiAmount: number
): Promise<PointsRedemption> {
  // Validate minimum points
  if (pointsToRedeem < POINTS_CONFIG.MIN_POINTS_TO_REDEEM) {
    throw new Error(`Minimum ${POINTS_CONFIG.MIN_POINTS_TO_REDEEM} points requis pour l'échange.`);
  }

  // Validate maximum points
  if (pointsToRedeem > POINTS_CONFIG.MAX_POINTS_PER_TRANSACTION) {
    throw new Error(`Maximum ${POINTS_CONFIG.MAX_POINTS_PER_TRANSACTION} points par transaction.`);
  }

  // Get current balance
  const userPoints = await getUserPoints(userId);
  if (!userPoints || userPoints.balance < pointsToRedeem) {
    throw new Error("Solde de points insuffisant.");
  }

  // Calculate discount
  const piDiscount = pointsToRedeem / POINTS_CONFIG.POINTS_TO_PI_RATE;
  const finalAmount = Math.max(0, currentPiAmount - piDiscount);

  // Award negative points (deduction)
  await awardPoints({
    userId,
    amount: -pointsToRedeem,
    reason: "redeemed",
    description: `Échangé contre ${piDiscount.toFixed(2)} Pi de réduction`,
    metadata: {
      originalAmount: currentPiAmount,
      discountApplied: piDiscount,
      finalAmount,
    },
  });

  return {
    pointsUsed: pointsToRedeem,
    piDiscount,
    finalAmount,
  };
}

/**
 * Get or create user's referral code
 */
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  // Check if user already has a referral code
  const { data: existing, error: fetchError } = await supabase
    .from("referral_codes")
    .select("code")
    .eq("user_id", userId)
    .single();

  if (existing) return existing.code;

  // Generate unique code
  const code = await generateUniqueCode();

  const { error: insertError } = await supabase
    .from("referral_codes")
    .insert({
      user_id: userId,
      code,
    });

  if (insertError) throw insertError;
  return code;
}

/**
 * Generate a unique referral code
 */
async function generateUniqueCode(): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  let attempts = 0;

  while (attempts < 10) {
    code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check if code exists
    const { data, error } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("code", code)
      .single();

    if (!data) return code; // Code is unique
    attempts++;
  }

  throw new Error("Impossible de générer un code unique. Veuillez réessayer.");
}

/**
 * Get referral info by code
 */
export async function getReferralByCode(code: string): Promise<{ referrerId: string } | null> {
  const { data, error } = await supabase
    .from("referral_codes")
    .select("user_id")
    .eq("code", code.toUpperCase())
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return { referrerId: data.user_id };
}

/**
 * Create a referral relationship
 */
export async function createReferral(params: {
  referrerId: string;
  referredUserId: string;
  code: string;
}): Promise<Referral> {
  const { referrerId, referredUserId, code } = params;

  // Check if referral already exists
  const { data: existing, error: checkError } = await supabase
    .from("referrals")
    .select("*")
    .eq("referred_user_id", referredUserId)
    .single();

  if (existing) return existing;

  // Create referral
  const { data, error } = await supabase
    .from("referrals")
    .insert({
      referrer_id: referrerId,
      referred_user_id: referredUserId,
      code,
      status: "signed_up",
    })
    .select("*")
    .single();

  if (error) throw error;

  // Award points to referrer
  await awardPoints({
    userId: referrerId,
    amount: POINTS_CONFIG.REFERRAL_SIGNUP_BONUS,
    reason: "referral_signup",
    description: `Bonus de parrainage : nouvel utilisateur inscrit avec votre code`,
    metadata: { referredUserId },
  });

  // Award bonus points to invitee
  await awardPoints({
    userId: referredUserId,
    amount: POINTS_CONFIG.REFERRAL_INVITEE_BONUS,
    reason: "referral_bonus_invitee",
    description: "Bonus de bienvenue via parrainage",
    metadata: { referrerId },
  });

  return data;
}

/**
 * Get user's referrals (list of invitees)
 */
export async function getUserReferrals(userId: string): Promise<Referral[]> {
  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Mark referral as first order completed (award extra points to referrer)
 */
export async function completeReferralFirstOrder(referredUserId: string): Promise<void> {
  const { data: referral, error: fetchError } = await supabase
    .from("referrals")
    .select("*")
    .eq("referred_user_id", referredUserId)
    .eq("status", "signed_up")
    .single();

  if (!referral) return; // No referral or already completed

  // Update referral status
  const { error: updateError } = await supabase
    .from("referrals")
    .update({ status: "first_order_completed", updated_at: new Date().toISOString() })
    .eq("id", referral.id);

  if (updateError) throw updateError;

  // Award extra points to referrer
  await awardPoints({
    userId: referral.referrer_id,
    amount: POINTS_CONFIG.REFERRAL_FIRST_ORDER_BONUS,
    reason: "referral_first_order",
    description: "Bonus de parrainage : première commande de votre filleul",
    metadata: { referredUserId },
  });
}
