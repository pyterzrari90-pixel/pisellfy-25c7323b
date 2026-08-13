import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";

import { useStore } from "@/lib/marketplace/store";
import { uid, usePersistentState } from "@/lib/persist";
import { seedGigReviews, seedGigs } from "./seed";
import { createService, deleteService, listServices, updateService } from "./services.functions";
import type {
  FreelancerProfile,
  Gig,
  GigCategory,
  Message,
  Review,
  ServiceOrder,
  ServiceOrderStatus,
} from "./types";

const LS = {
  profiles: "sellfy.freelancers",
  gigs: "sellfy.gigs",
  migrated: "sellfy.gigs.migrated",
  orders: "sellfy.serviceOrders",
  messages: "sellfy.messages",
  reviews: "sellfy.gigReviews",
};

export const SERVICES_QUERY_KEY = ["services"] as const;

/** Supabase row -> UI Gig. */
type ServiceRow = {
  id: string;
  owner_id: string;
  owner_name: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  packages: unknown;
  created_at: string;
};

function toGig(row: ServiceRow): Gig {
  return {
    id: row.id,
    freelancerUid: row.owner_id,
    freelancerName: row.owner_name,
    title: row.title,
    description: row.description,
    category: row.category as GigCategory,
    images: row.images ?? [],
    packages: (row.packages as Gig["packages"]) ?? [],
    createdAt: row.created_at,
  };
}

interface FreelanceValue {
  hydrated: boolean;
  /** True while the shared service catalog is loading from the backend. */
  gigsLoading: boolean;
  gigsError: string | null;
  profiles: FreelancerProfile[];
  gigs: Gig[];
  orders: ServiceOrder[];
  messages: Message[];
  reviews: Review[];
  saveProfile: (profile: FreelancerProfile) => void;
  getProfile: (uid: string) => FreelancerProfile | undefined;
  addGig: (gig: Omit<Gig, "id" | "createdAt">) => Promise<Gig>;
  editGig: (gig: Gig) => Promise<void>;
  removeGig: (id: string) => Promise<void>;
  addOrder: (order: Omit<ServiceOrder, "id" | "createdAt" | "updatedAt">) => ServiceOrder;
  setOrderStatus: (orderId: string, status: ServiceOrderStatus) => void;
  releaseEscrow: (orderId: string) => void;
  sendMessage: (threadId: string, fromUid: string, fromName: string, text: string) => void;
  addReview: (review: Omit<Review, "id" | "createdAt">) => void;
}

const Ctx = createContext<FreelanceValue | null>(null);

export function FreelanceProvider({ children }: { children: ReactNode }) {
  const { user } = useStore();
  const queryClient = useQueryClient();

  const [profiles, setProfiles, h1] = usePersistentState<FreelancerProfile[]>(LS.profiles, []);
  const [legacyGigs, setLegacyGigs, h2] = usePersistentState<Gig[]>(LS.gigs, []);
  const [orders, setOrders] = usePersistentState<ServiceOrder[]>(LS.orders, []);
  const [messages, setMessages] = usePersistentState<Message[]>(LS.messages, []);
  const [userReviews, setUserReviews] = usePersistentState<Review[]>(LS.reviews, []);

  /** Source of truth: the shared `services` table. */
  const servicesQuery = useQuery({
    queryKey: SERVICES_QUERY_KEY,
    queryFn: async () => ((await listServices()) as unknown as ServiceRow[]).map(toGig),
    staleTime: 30_000,
  });

  const remoteGigs = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data]);

  const createMutation = useMutation({
    mutationFn: async (input: Omit<Gig, "id" | "createdAt">) => {
      if (!user?.accessToken) throw new Error("Sign in with Pi to publish a service.");
      const row = (await createService({
        data: {
          accessToken: user.accessToken,
          title: input.title,
          description: input.description,
          category: input.category,
          images: input.images,
          packages: input.packages,
        },
      })) as unknown as ServiceRow;
      return toGig(row);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY }),
  });

  const addGig = useCallback(
    (input: Omit<Gig, "id" | "createdAt">) => createMutation.mutateAsync(input),
    [createMutation],
  );

  const editGig = useCallback(
    async (gig: Gig) => {
      if (!user?.accessToken) throw new Error("Sign in with Pi to edit a service.");
      await updateService({
        data: {
          accessToken: user.accessToken,
          id: gig.id,
          title: gig.title,
          description: gig.description,
          category: gig.category,
          images: gig.images,
          packages: gig.packages,
        },
      });
      await queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
    },
    [user, queryClient],
  );

  const removeGig = useCallback(
    async (id: string) => {
      if (!user?.accessToken) throw new Error("Sign in with Pi to delete a service.");
      await deleteService({ data: { accessToken: user.accessToken, id } });
      await queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
    },
    [user, queryClient],
  );

  /**
   * One-shot migration: gigs previously created on this device (localStorage)
   * are pushed to the shared table for their owner, then dropped locally.
   */
  const migrating = useRef(false);
  useEffect(() => {
    if (migrating.current || !h2 || !user?.accessToken || legacyGigs.length === 0) return;
    const mine = legacyGigs.filter((g) => g.freelancerUid === user.uid);
    if (mine.length === 0) return;
    migrating.current = true;
    void (async () => {
      for (const g of mine) {
        try {
          await createService({
            data: {
              accessToken: user.accessToken,
              title: g.title,
              description: g.description,
              category: g.category,
              images: g.images,
              packages: g.packages,
            },
          });
          setLegacyGigs((prev) => prev.filter((p) => p.id !== g.id));
        } catch {
          /* keep the local copy so nothing is lost; retry next session */
        }
      }
      await queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
      migrating.current = false;
    })();
  }, [h2, legacyGigs, user, setLegacyGigs, queryClient]);

  const gigs = useMemo(
    () => [...remoteGigs, ...legacyGigs, ...seedGigs],
    [remoteGigs, legacyGigs],
  );
  const reviews = useMemo(() => [...userReviews, ...seedGigReviews], [userReviews]);

  const saveProfile = useCallback(
    (profile: FreelancerProfile) =>
      setProfiles((prev) => [profile, ...prev.filter((p) => p.uid !== profile.uid)]),
    [setProfiles],
  );

  const getProfile = useCallback((id: string) => profiles.find((p) => p.uid === id), [profiles]);

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
    gigsLoading: servicesQuery.isLoading,
    gigsError: servicesQuery.error ? (servicesQuery.error as Error).message : null,
    profiles,
    gigs,
    orders,
    messages,
    reviews,
    saveProfile,
    getProfile,
    addGig,
    editGig,
    removeGig,
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
