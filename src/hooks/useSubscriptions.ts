import { useCallback, useEffect, useRef, useState } from "react";
import { usePiAuth } from "@/hooks/usePiAuth";
import { toast } from "@/hooks/use-toast";
import {
  activateSubscription,
  cancelSubscription,
  listActivePlans,
  listMySubscriptions,
  resumeSubscription,
} from "@/lib/subscriptions/api";
import { activeBillingProvider, REMINDER_DAYS, daysUntil } from "@/lib/subscriptions/billing";
import { INTERVAL_LABELS, type SubscriptionPlan, type SubscriptionWithPlan } from "@/lib/subscriptions/types";

export const useSubscriptionCatalog = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listActivePlans()
      .then(setPlans)
      .catch((e) => toast({ title: "Chargement impossible", description: String(e.message ?? e), variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  return { plans, loading };
};

export const useMySubscriptions = () => {
  const { session, signIn } = usePiAuth();
  const userId = session?.user?.id ?? null;
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const remindedRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setSubscriptions(await listMySubscriptions(userId));
    } catch (e) {
      toast({
        title: "Chargement des abonnements impossible",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Transitional mode: remind the pioneer before each due date (manual renewal).
  useEffect(() => {
    if (!activeBillingProvider.requiresManualRenewal || remindedRef.current) return;
    const due = subscriptions.filter(
      (s) => !s.cancel_at_period_end && daysUntil(s.next_billing_at) <= REMINDER_DAYS,
    );
    if (due.length === 0) return;
    remindedRef.current = true;
    due.forEach((s) => {
      const days = daysUntil(s.next_billing_at);
      toast({
        title: days < 0 ? "Renouvellement en retard" : "Renouvellement bientôt dû",
        description: `${s.plan?.name ?? "Abonnement"} — ${
          days < 0 ? "à renouveler maintenant" : `échéance dans ${days} jour(s)`
        }. Validez le paiement Pi pour conserver l'accès.`,
      });
    });
  }, [subscriptions]);

  const chargeAndSave = useCallback(
    async (plan: SubscriptionPlan) => {
      if (!userId) {
        await signIn();
        return;
      }
      setPendingPlanId(plan.id);
      try {
        const { paymentId, txid } = await activeBillingProvider.charge(
          plan,
          `1 période (${INTERVAL_LABELS[plan.interval]})`,
        );
        await activateSubscription({
          planId: plan.id,
          subscriberId: userId,
          interval: plan.interval,
          amount: plan.price,
          paymentId,
          txid,
        });
        toast({ title: "Abonnement actif", description: `Vous êtes abonné à « ${plan.name} ».` });
        remindedRef.current = false;
        await refresh();
      } catch (e) {
        toast({
          title: "Abonnement non finalisé",
          description: e instanceof Error ? e.message : String(e),
          variant: "destructive",
        });
      } finally {
        setPendingPlanId(null);
      }
    },
    [userId, signIn, refresh],
  );

  const cancel = useCallback(
    async (subscriptionId: string) => {
      try {
        await cancelSubscription(subscriptionId);
        toast({
          title: "Abonnement annulé",
          description: "L'accès reste actif jusqu'à la fin de la période déjà payée.",
        });
        await refresh();
      } catch (e) {
        toast({ title: "Annulation impossible", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
      }
    },
    [refresh],
  );

  const resume = useCallback(
    async (subscriptionId: string) => {
      try {
        await resumeSubscription(subscriptionId);
        toast({ title: "Abonnement réactivé" });
        await refresh();
      } catch (e) {
        toast({ title: "Réactivation impossible", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
      }
    },
    [refresh],
  );

  return {
    subscriptions,
    loading,
    pendingPlanId,
    subscribe: chargeAndSave,
    renew: chargeAndSave,
    cancel,
    resume,
    refresh,
    isSignedIn: Boolean(userId),
  };
};
