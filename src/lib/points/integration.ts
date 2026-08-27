// Points system integration with existing modules
import { awardPoints, completeReferralFirstOrder } from "@/lib/points/api";
import { POINTS_CONFIG } from "@/lib/points/types";

/**
 * Award points when a user signs up
 * Should be called after successful Pi authentication
 */
export async function onUserSignup(userId: string, piUsername: string) {
  try {
    await awardPoints({
      userId,
      amount: POINTS_CONFIG.SIGNUP_BONUS,
      reason: "signup",
      description: `Bienvenue @${piUsername} ! Bonus d'inscription`,
    });
    console.log(`✓ Signup bonus awarded to ${piUsername}`);
  } catch (error) {
    console.error("Failed to award signup bonus:", error);
    // Don't throw - points failure shouldn't block signup
  }
}

/**
 * Award points when a seller creates a product
 * Should be called after successful product creation
 */
export async function onProductCreated(userId: string, productTitle: string) {
  try {
    await awardPoints({
      userId,
      amount: POINTS_CONFIG.PRODUCT_CREATED_BONUS,
      reason: "product_created",
      description: `Produit créé : "${productTitle}"`,
    });
    console.log(`✓ Product creation bonus awarded for: ${productTitle}`);
  } catch (error) {
    console.error("Failed to award product creation bonus:", error);
    // Don't throw - points failure shouldn't block product creation
  }
}

/**
 * Award points when a user completes their first order
 * Also completes referral if applicable
 */
export async function onFirstOrder(
  userId: string,
  productTitle: string,
  amount: number
) {
  try {
    // Award first order bonus
    await awardPoints({
      userId,
      amount: POINTS_CONFIG.FIRST_ORDER_BONUS,
      reason: "first_order",
      description: `Première commande : "${productTitle}" (${amount} Pi)`,
    });
    console.log(`✓ First order bonus awarded to user ${userId}`);

    // Complete referral if user was referred
    await completeReferralFirstOrder(userId);
    console.log(`✓ Referral first order completed for user ${userId}`);
  } catch (error) {
    console.error("Failed to process first order rewards:", error);
    // Don't throw - points failure shouldn't block order completion
  }
}

/**
 * Award points when a user leaves a review
 * Should be called after successful review submission
 */
export async function onReviewLeft(userId: string, productTitle: string) {
  try {
    await awardPoints({
      userId,
      amount: POINTS_CONFIG.REVIEW_BONUS,
      reason: "review_left",
      description: `Avis laissé sur : "${productTitle}"`,
    });
    console.log(`✓ Review bonus awarded to user ${userId}`);
  } catch (error) {
    console.error("Failed to award review bonus:", error);
    // Don't throw - points failure shouldn't block review submission
  }
}

/**
 * Process referral on signup
 * Should be called during signup if a referral code is present
 */
export async function processReferralOnSignup(params: {
  newUserId: string;
  referralCode: string;
}) {
  const { newUserId, referralCode } = params;

  try {
    const { getReferralByCode, createReferral } = await import(
      "@/lib/points/api"
    );

    // Get referrer info from code
    const referrerInfo = await getReferralByCode(referralCode);
    if (!referrerInfo) {
      console.warn(`Invalid referral code: ${referralCode}`);
      return false;
    }

    // Prevent self-referral
    if (referrerInfo.referrerId === newUserId) {
      console.warn("Cannot refer yourself");
      return false;
    }

    // Create referral relationship
    await createReferral({
      referrerId: referrerInfo.referrerId,
      referredUserId: newUserId,
      code: referralCode.toUpperCase(),
    });

    console.log(`✓ Referral created: ${referrerInfo.referrerId} → ${newUserId}`);
    return true;
  } catch (error) {
    console.error("Failed to process referral:", error);
    return false;
  }
}

/**
 * Get user's points balance
 * Helper for displaying in UI components
 */
export async function getUserPointsBalance(userId: string): Promise<number> {
  try {
    const { getUserPoints } = await import("@/lib/points/api");
    const userPoints = await getUserPoints(userId);
    return userPoints?.balance ?? 0;
  } catch (error) {
    console.error("Failed to get user points:", error);
    return 0;
  }
}
