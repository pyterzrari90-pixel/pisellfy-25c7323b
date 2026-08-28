export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in Pi
  image: string;
  seller: string;
}

export const seedProducts: Product[] = [
  {
    id: "p1",
    name: "Wireless Headphones",
    description:
      "Over-ear wireless headphones with active noise cancelling and 40h battery life. Shipped worldwide.",
    price: 12.5,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=70",
    seller: "SWILLER90",
  },
  {
    id: "p2",
    name: "Mechanical Keyboard",
    description:
      "Hot-swappable 75% mechanical keyboard, tactile switches, PBT keycaps and RGB backlight.",
    price: 24,
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=70",
    seller: "PiMakers",
  },
  {
    id: "p3",
    name: "Leather Backpack",
    description:
      "Handmade full-grain leather backpack with padded laptop sleeve. Ages beautifully.",
    price: 45,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=70",
    seller: "CraftPi",
  },
  {
    id: "p4",
    name: "Analog Wrist Watch",
    description: "Minimal analog watch, sapphire glass, stainless steel case and mesh strap.",
    price: 60,
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=70",
    seller: "TimePi",
  },
  {
    id: "p5",
    name: "Ceramic Mug Set",
    description: "Set of two hand-glazed stoneware mugs. Dishwasher and microwave safe.",
    price: 8,
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=70",
    seller: "HomePi",
  },
  {
    id: "p6",
    name: "Instant Camera",
    description: "Retro instant camera with built-in flash. Film packs sold separately.",
    price: 33.75,
    image:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=70",
    seller: "SnapPi",
  },
];
