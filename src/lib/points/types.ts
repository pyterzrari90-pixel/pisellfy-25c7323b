// Points and Referral System Types

export interface UserPoints {
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  amount: number; // positive = earned, negative = spent
  reason: PointsReason;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type PointsReason =
  | 'signup'
  | 'first_order'
  | 'review_left'
  | 'product_created'
  | 'referral_signup'
  | 'referral_first_order'
  | 'referral_bonus_invitee'
  | 'redeemed';

export interface Referral {
  id: string;
  referrerId: string; // user who invited
  referredUserId: string; // user who was invited
  code: string; // referrer's unique code
  status: 'signed_up' | 'first_order_completed';
  createdAt: string;
  updatedAt: string;
}

// Points configuration
export const POINTS_CONFIG = {
  // Earning points
  SIGNUP_BONUS: 50,
  FIRST_ORDER_BONUS: 30,
  REVIEW_BONUS: 10,
  PRODUCT_CREATED_BONUS: 15,
  REFERRAL_SIGNUP_BONUS: 100, // referrer gets this when invitee signs up
  REFERRAL_FIRST_ORDER_BONUS: 150, // referrer gets this when invitee makes first order
  REFERRAL_INVITEE_BONUS: 25, // invitee gets extra bonus

  // Conversion rate
  POINTS_TO_PI_RATE: 100, // 100 points = 1 Pi discount
  MIN_POINTS_TO_REDEEM: 100, // minimum points needed to redeem

  // Limits
  MAX_POINTS_PER_TRANSACTION: 10000, // max points that can be used in one transaction
} as const;

export interface PointsRedemption {
  pointsUsed: number;
  piDiscount: number;
  finalAmount: number;
}
