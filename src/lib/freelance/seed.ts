import type { Gig, Review } from "./types";

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;

export const seedGigs: Gig[] = [
  {
    id: "g1",
    freelancerUid: "seed-1",
    freelancerName: "PixelPi",
    title: "I will design a modern logo and brand kit",
    description:
      "Unique, hand-crafted logo with full brand kit: colour palette, typography and social avatars. Source files included.",
    category: "Design",
    images: [img("photo-1626785774573-4b799315345d"), img("photo-1561070791-2526d30994b5")],
    packages: [
      { tier: "basic", title: "Logo only", description: "1 concept, 2 revisions, PNG + SVG", price: 15, deliveryDays: 3 },
      { tier: "standard", title: "Logo + kit", description: "3 concepts, 5 revisions, brand kit", price: 35, deliveryDays: 5 },
      { tier: "premium", title: "Full identity", description: "Unlimited revisions, stationery, guidelines", price: 80, deliveryDays: 8 },
    ],
    createdAt: "2026-05-02T10:00:00.000Z",
  },
  {
    id: "g2",
    freelancerUid: "seed-2",
    freelancerName: "DevOnPi",
    title: "I will build a responsive web app page",
    description:
      "Pixel-perfect, responsive React page built from your design or brief. Clean code and fast load times.",
    category: "Development",
    images: [img("photo-1498050108023-c5249f4df085"), img("photo-1517180102446-f3ece451e9d8")],
    packages: [
      { tier: "basic", title: "Landing section", description: "1 section, responsive", price: 25, deliveryDays: 2 },
      { tier: "standard", title: "Full page", description: "Up to 6 sections + forms", price: 70, deliveryDays: 5 },
      { tier: "premium", title: "Multi-page", description: "5 pages, animations, SEO", price: 160, deliveryDays: 10 },
    ],
    createdAt: "2026-05-10T10:00:00.000Z",
  },
  {
    id: "g3",
    freelancerUid: "seed-3",
    freelancerName: "GrowthPi",
    title: "I will run a social media growth campaign",
    description:
      "30-day content calendar, audience research and paid-ads setup for your Pi project or shop.",
    category: "Marketing",
    images: [img("photo-1611162617474-5b21e879e113")],
    packages: [
      { tier: "basic", title: "Audit", description: "Account audit + 10 post ideas", price: 10, deliveryDays: 2 },
      { tier: "standard", title: "Calendar", description: "30-day calendar + captions", price: 40, deliveryDays: 4 },
      { tier: "premium", title: "Managed", description: "Calendar + ads setup + reporting", price: 95, deliveryDays: 7 },
    ],
    createdAt: "2026-05-15T10:00:00.000Z",
  },
  {
    id: "g4",
    freelancerUid: "seed-4",
    freelancerName: "WordPi",
    title: "I will write SEO blog articles that rank",
    description: "Researched, human-written articles with keyword targeting and internal links.",
    category: "Writing",
    images: [img("photo-1455390582262-044cdead277a")],
    packages: [
      { tier: "basic", title: "800 words", description: "1 article, 1 revision", price: 8, deliveryDays: 2 },
      { tier: "standard", title: "1500 words", description: "1 article, 3 revisions", price: 18, deliveryDays: 3 },
      { tier: "premium", title: "Pack of 4", description: "4 articles + keyword plan", price: 60, deliveryDays: 7 },
    ],
    createdAt: "2026-05-18T10:00:00.000Z",
  },
  {
    id: "g5",
    freelancerUid: "seed-5",
    freelancerName: "ReelPi",
    title: "I will edit your short-form videos",
    description: "Vertical edits with captions, sound design and hooks for TikTok, Reels and Shorts.",
    category: "Video",
    images: [img("photo-1574717024653-61fd2cf4d44d")],
    packages: [
      { tier: "basic", title: "1 short", description: "Up to 60s, captions", price: 12, deliveryDays: 2 },
      { tier: "standard", title: "3 shorts", description: "Captions + sound design", price: 30, deliveryDays: 4 },
      { tier: "premium", title: "10 shorts", description: "Full monthly pack", price: 90, deliveryDays: 10 },
    ],
    createdAt: "2026-05-20T10:00:00.000Z",
  },
];

export const seedGigReviews: Review[] = [
  {
    id: "gr1",
    targetId: "g1",
    authorUid: "seed-b1",
    authorName: "mira",
    rating: 5,
    comment: "Delivered a day early and the brand kit is gorgeous.",
    createdAt: "2026-05-22T10:00:00.000Z",
  },
  {
    id: "gr2",
    targetId: "g1",
    authorUid: "seed-b2",
    authorName: "joon",
    rating: 4,
    comment: "Great work, needed one extra revision round.",
    createdAt: "2026-05-25T10:00:00.000Z",
  },
  {
    id: "gr3",
    targetId: "g2",
    authorUid: "seed-b3",
    authorName: "tarek",
    rating: 5,
    comment: "Clean code, fast, understood the brief instantly.",
    createdAt: "2026-06-01T10:00:00.000Z",
  },
  {
    id: "gr4",
    targetId: "g4",
    authorUid: "seed-b4",
    authorName: "lena",
    rating: 4,
    comment: "Solid articles, ranked within a month.",
    createdAt: "2026-06-04T10:00:00.000Z",
  },
];
