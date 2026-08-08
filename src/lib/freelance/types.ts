/** Data model for the Freelance Services module (Fiverr-style). */

export const GIG_CATEGORIES = [
  "Design",
  "Development",
  "Marketing",
  "Writing",
  "Video",
] as const;
export type GigCategory = (typeof GIG_CATEGORIES)[number];

export type PackageTier = "basic" | "standard" | "premium";

export interface GigPackage {
  tier: PackageTier;
  title: string;
  description: string;
  price: number; // Pi
  deliveryDays: number;
}

export interface FreelancerProfile {
  uid: string;
  username: string;
  avatar: string;
  title: string;
  bio: string;
  skills: string[];
  languages: string[];
  createdAt: string;
}

export interface Gig {
  id: string;
  freelancerUid: string;
  freelancerName: string;
  title: string;
  description: string;
  category: GigCategory;
  images: string[];
  packages: GigPackage[];
  createdAt: string;
}

export type ServiceOrderStatus = "pending" | "in_progress" | "delivered" | "completed";

export interface ServiceOrder {
  id: string;
  gigId: string;
  gigTitle: string;
  tier: PackageTier;
  price: number;
  deliveryDays: number;
  buyerUid: string;
  buyerName: string;
  sellerUid: string;
  sellerName: string;
  status: ServiceOrderStatus;
  /** Funds are held in escrow until the buyer accepts the delivery. */
  escrow: "held" | "released";
  paymentId: string;
  txid: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  /** Thread key: gig id (pre-order) or order id (post-order). */
  threadId: string;
  fromUid: string;
  fromName: string;
  text: string;
  createdAt: string;
}

export interface Review {
  id: string;
  targetId: string; // gig id or course id
  authorUid: string;
  authorName: string;
  rating: number; // 1..5
  comment: string;
  createdAt: string;
}

export function averageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}
