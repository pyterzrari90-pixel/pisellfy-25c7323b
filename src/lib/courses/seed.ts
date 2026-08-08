import type { Review } from "@/lib/freelance/types";
import type { Course } from "./types";

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;
const VIDEO = "https://www.w3schools.com/html/mov_bbb.mp4";

export const seedCourses: Course[] = [
  {
    id: "c1",
    instructorUid: "seed-i1",
    instructorName: "CodePi",
    title: "Build Pi Browser apps from scratch",
    description:
      "Learn the Pi SDK end to end: authentication, payments, escrow patterns and shipping a production app to the Pi Developer Portal.",
    category: "Development",
    level: "intermediate",
    price: 20,
    cover: img("photo-1517180102446-f3ece451e9d8"),
    createdAt: "2026-04-01T10:00:00.000Z",
    sections: [
      {
        id: "c1s1",
        title: "Getting started",
        lessons: [
          { id: "c1l1", title: "What is the Pi ecosystem?", videoUrl: VIDEO, durationMin: 8, preview: true, resources: [] },
          { id: "c1l2", title: "Setting up the Developer Portal", videoUrl: VIDEO, durationMin: 12, preview: false, resources: [{ name: "Checklist.pdf", url: "#" }] },
        ],
      },
      {
        id: "c1s2",
        title: "Payments",
        lessons: [
          { id: "c1l3", title: "Pi.createPayment in depth", videoUrl: VIDEO, durationMin: 18, preview: false, resources: [] },
          { id: "c1l4", title: "Server approve & complete", videoUrl: VIDEO, durationMin: 15, preview: false, resources: [{ name: "server-snippets.zip", url: "#" }] },
          { id: "c1l5", title: "Escrow & refunds", videoUrl: VIDEO, durationMin: 11, preview: false, resources: [] },
        ],
      },
    ],
  },
  {
    id: "c2",
    instructorUid: "seed-i2",
    instructorName: "BrandPi",
    title: "Brand design fundamentals",
    description:
      "Colour, type and grid systems explained simply, with three guided projects you can add to your portfolio.",
    category: "Design",
    level: "beginner",
    price: 12,
    cover: img("photo-1561070791-2526d30994b5"),
    createdAt: "2026-04-12T10:00:00.000Z",
    sections: [
      {
        id: "c2s1",
        title: "Foundations",
        lessons: [
          { id: "c2l1", title: "Why brands work", videoUrl: VIDEO, durationMin: 7, preview: true, resources: [] },
          { id: "c2l2", title: "Colour theory in practice", videoUrl: VIDEO, durationMin: 14, preview: false, resources: [] },
          { id: "c2l3", title: "Typography pairing", videoUrl: VIDEO, durationMin: 13, preview: false, resources: [{ name: "type-pairs.pdf", url: "#" }] },
        ],
      },
    ],
  },
  {
    id: "c3",
    instructorUid: "seed-i3",
    instructorName: "GrowthPi",
    title: "Marketing your Pi shop",
    description:
      "Get your first 100 buyers: positioning, content loops, community marketing and conversion basics.",
    category: "Marketing",
    level: "beginner",
    price: 9,
    cover: img("photo-1611162617474-5b21e879e113"),
    createdAt: "2026-04-20T10:00:00.000Z",
    sections: [
      {
        id: "c3s1",
        title: "Positioning",
        lessons: [
          { id: "c3l1", title: "Find your niche", videoUrl: VIDEO, durationMin: 9, preview: true, resources: [] },
          { id: "c3l2", title: "Offer and pricing in Pi", videoUrl: VIDEO, durationMin: 12, preview: false, resources: [] },
        ],
      },
      {
        id: "c3s2",
        title: "Traffic",
        lessons: [
          { id: "c3l3", title: "Community marketing", videoUrl: VIDEO, durationMin: 16, preview: false, resources: [] },
          { id: "c3l4", title: "Content loops", videoUrl: VIDEO, durationMin: 10, preview: false, resources: [] },
        ],
      },
    ],
  },
  {
    id: "c4",
    instructorUid: "seed-i4",
    instructorName: "DataPi",
    title: "Advanced TypeScript for product teams",
    description: "Generics, inference and type-safe API layers, taught through real refactors.",
    category: "Development",
    level: "advanced",
    price: 30,
    cover: img("photo-1498050108023-c5249f4df085"),
    createdAt: "2026-05-05T10:00:00.000Z",
    sections: [
      {
        id: "c4s1",
        title: "Type system deep dive",
        lessons: [
          { id: "c4l1", title: "Inference rules you must know", videoUrl: VIDEO, durationMin: 15, preview: true, resources: [] },
          { id: "c4l2", title: "Conditional & mapped types", videoUrl: VIDEO, durationMin: 22, preview: false, resources: [] },
          { id: "c4l3", title: "Type-safe API clients", videoUrl: VIDEO, durationMin: 19, preview: false, resources: [{ name: "starter-repo.zip", url: "#" }] },
        ],
      },
    ],
  },
];

export const seedCourseReviews: Review[] = [
  { id: "cr1", targetId: "c1", authorUid: "seed-s1", authorName: "amara", rating: 5, comment: "Best Pi SDK course out there. The escrow lesson alone was worth it.", createdAt: "2026-05-01T10:00:00.000Z" },
  { id: "cr2", targetId: "c1", authorUid: "seed-s2", authorName: "hugo", rating: 4, comment: "Very practical, would like more on error handling.", createdAt: "2026-05-08T10:00:00.000Z" },
  { id: "cr3", targetId: "c2", authorUid: "seed-s3", authorName: "nina", rating: 5, comment: "Clear and beautifully taught.", createdAt: "2026-05-11T10:00:00.000Z" },
  { id: "cr4", targetId: "c4", authorUid: "seed-s4", authorName: "raj", rating: 5, comment: "Finally understood conditional types.", createdAt: "2026-05-19T10:00:00.000Z" },
];
