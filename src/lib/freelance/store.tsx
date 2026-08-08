import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { uid, usePersistentState } from "@/lib/persist";
import { seedGigReviews, seedGigs } from "./seed";
import type {
  FreelancerProfile,
  Gig,
  Message,
  Review,
  ServiceOrder,
  ServiceOrderStatus,
} from "./types";

const LS = {
  profiles: "sellfy.freelancers",
  gigs: "sellfy.gigs",
  orders: "sellfy.serviceOrders",
  messages: "sellfy.messages",
  reviews: "sellfy.gigReviews",
};

interface FreelanceValue {
  hydrated: boolean;
  profiles: FreelancerProfile[];
  gigs: Gig[];
  orders: ServiceOrder[];
  messages: Message[];
  reviews: Review[];
  saveProfile: (profile: FreelancerProfile) => void;
  getProfile: (uid: string) => FreelancerProfile | undefined;
  addGig: (gig: Omit<Gig, "id" | "createdAt">) => Gig;
  addOrder: (order: Omit<ServiceOrder, "id" | "createdAt" | "updatedAt">) => ServiceOrder;
  setOrderStatus: (orderId: string, status: ServiceOrderStatus) => void;
  releaseEscrow: (orderId: string) => void;
  sendMessage: (threadId: string, fromUid: string, fromName: string, text: string) => void;
  addReview: (review: Omit<Review, "id" | "createdAt">) => void;
}

const Ctx = createContext<FreelanceValue | null>(null);

export function FreelanceProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles, h1] = usePersistentState<FreelancerProfile[]>(LS.profiles, []);
  const [userGigs, setUserGigs, h2] = usePersistentState<Gig[]>(LS.gigs, []);
  const [orders, setOrders] = usePersistentState<ServiceOrder[]>(LS.orders, []);
  const [messages, setMessages] = usePersistentState<Message[]>(LS.messages, []);
  const [userReviews, setUserReviews] = usePersistentState<Review[]>(LS.reviews, []);

  const gigs = useMemo(() => [...userGigs, ...seedGigs], [userGigs]);
  const reviews = useMemo(() => [...userReviews, ...seedGigReviews], [userReviews]);

  const saveProfile = useCallback(
    (profile: FreelancerProfile) =>
      setProfiles((prev) => [profile, ...prev.filter((p) => p.uid !== profile.uid)]),
    [setProfiles],
  );

  const getProfile = useCallback(
    (id: string) => profiles.find((p) => p.uid === id),
    [profiles],
  );

  const addGig = useCallback(
    (input: Omit<Gig, "id" | "createdAt">) => {
      const gig: Gig = { ...input, id: uid("g"), createdAt: new Date().toISOString() };
      setUserGigs((prev) => [gig, ...prev]);
      return gig;
    },
    [setUserGigs],
  );

  const addOrder = useCallback(
    (input: Omit<ServiceOrder, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const order: ServiceOrder = { ...input, id: uid("so"), createdAt: now, updatedAt: now };
      setOrders((prev) => [order, ...prev]);
      return order;
    },
    [setOrders],
  );

  const setOrderStatus = useCallback(
    (orderId: string, status: ServiceOrderStatus) =>
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o,
        ),
      ),
    [setOrders],
  );

  const releaseEscrow = useCallback(
    (orderId: string) =>
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: "completed" as ServiceOrderStatus,
                escrow: "released" as const,
                updatedAt: new Date().toISOString(),
              }
            : o,
        ),
      ),
    [setOrders],
  );

  const sendMessage = useCallback(
    (threadId: string, fromUid: string, fromName: string, text: string) =>
      setMessages((prev) => [
        ...prev,
        { id: uid("m"), threadId, fromUid, fromName, text, createdAt: new Date().toISOString() },
      ]),
    [setMessages],
  );

  const addReview = useCallback(
    (input: Omit<Review, "id" | "createdAt">) =>
      setUserReviews((prev) => [
        { ...input, id: uid("r"), createdAt: new Date().toISOString() },
        ...prev,
      ]),
    [setUserReviews],
  );

  const value: FreelanceValue = {
    hydrated: h1 && h2,
    profiles,
    gigs,
    orders,
    messages,
    reviews,
    saveProfile,
    getProfile,
    addGig,
    addOrder,
    setOrderStatus,
    releaseEscrow,
    sendMessage,
    addReview,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFreelance(): FreelanceValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFreelance must be used within FreelanceProvider");
  return ctx;
}
