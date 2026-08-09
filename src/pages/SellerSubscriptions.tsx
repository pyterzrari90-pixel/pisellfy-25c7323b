import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, TrendingUp, Users, UserMinus } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePiAuth } from "@/hooks/usePiAuth";
import { toast } from "@/hooks/use-toast";
import { listMyPlans, listSubscribersForSeller, setPlanActive } from "@/lib/subscriptions/api";
import { INTERVAL_DAYS, INTERVAL_LABELS, TIER_LABELS } from "@/lib/subscriptions/types";
import type { SubscriptionPlan, SubscriptionWithPlan } from "@/lib/subscriptions/types";

const monthlyValue = (plan: SubscriptionPlan) => (plan.price * 30) / INTERVAL_DAYS[plan.interval];

const SellerSubscriptions = () => {
  const { session, signIn } = usePiAuth();
  const sellerId = session?.user?.id ?? null;
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subs, setSubs] = useState<SubscriptionWithPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (uid: string) => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([listMyPlans(uid), listSubscribersForSeller(uid)]);
      setPlans(p);
      setSubs(s);
    } catch (e) {
      toast({
        title: "Chargement impossible",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sellerId) {
      setLoading(false);
      return;
    }
    void load(sellerId);
  }, [sellerId]);

  const stats = useMemo(() => {
    const active = subs.filter((s) => s.status === "active" && !s.cancel_at_period_end);
    const canceled = subs.filter((s) => s.cancel_at_period_end || s.status === "canceled");
    const mrr = active.reduce((sum, s) => sum + (s.plan ? monthlyValue(s.plan) : 0), 0);
    const churn = subs.length ? (canceled.length / subs.length) * 100 : 0;
    return { activeCount: active.length, mrr, churn };
  }, [subs]);

  const toggle = async (plan: SubscriptionPlan) => {
    try {
      await setPlanActive(plan.id, !plan.is_active);
      if (sellerId) await load(sellerId);
    } catch (e) {
      toast({ title: "Mise à jour impossible", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Tableau de bord abonnements
            </h1>
            <p className="text-muted-foreground mt-2">
              Abonnés actifs, revenus récurrents et taux de désabonnement.
            </p>
          </div>
          <Button variant="gold" asChild>
            <Link to="/subscriptions/create">Créer une formule</Link>
          </Button>
        </div>

        {!session ? (
          <Button variant="gold" className="mt-8" onClick={() => void signIn()}>
            Se connecter avec Pi
          </Button>
        ) : loading ? (
          <div className="flex items-center gap-2 text-muted-foreground mt-10">
            <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              {[
                { icon: Users, label: "Abonnés actifs", value: String(stats.activeCount) },
                { icon: TrendingUp, label: "Revenu récurrent mensuel", value: `π ${stats.mrr.toFixed(2)}` },
                { icon: UserMinus, label: "Taux de désabonnement", value: `${stats.churn.toFixed(1)} %` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="glass rounded-2xl border border-border p-6">
                  <Icon className="w-5 h-5 text-primary" />
                  <p className="text-sm text-muted-foreground mt-3">{label}</p>
                  <p className="font-display text-2xl font-bold text-foreground mt-1">{value}</p>
                </div>
              ))}
            </div>

            <section className="mt-12">
              <h2 className="font-display text-xl font-bold text-foreground">Mes formules</h2>
              {plans.length === 0 ? (
                <p className="text-muted-foreground mt-3">Aucune formule créée.</p>
              ) : (
                <div className="grid gap-4 mt-4 lg:grid-cols-2">
                  {plans.map((plan) => {
                    const count = subs.filter(
                      (s) => s.plan_id === plan.id && s.status === "active" && !s.cancel_at_period_end,
                    ).length;
                    return (
                      <div key={plan.id} className="glass rounded-2xl border border-border p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-foreground">{plan.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {TIER_LABELS[plan.tier] ?? plan.tier} · π {plan.price}{" "}
                              {INTERVAL_LABELS[plan.interval]}
                            </p>
                          </div>
                          <Badge variant={plan.is_active ? "default" : "outline"}>
                            {plan.is_active ? "En ligne" : "Masquée"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">{count} abonné(s) actif(s)</p>
                        <Button variant="outline" className="mt-4" onClick={() => void toggle(plan)}>
                          {plan.is_active ? "Masquer" : "Remettre en ligne"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="mt-12">
              <h2 className="font-display text-xl font-bold text-foreground">Abonnés</h2>
              {subs.length === 0 ? (
                <p className="text-muted-foreground mt-3">Aucun abonné pour l'instant.</p>
              ) : (
                <div className="mt-4 overflow-x-auto glass rounded-2xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <th className="text-left p-4">Formule</th>
                        <th className="text-left p-4">Statut</th>
                        <th className="text-left p-4">Prochaine facturation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subs.map((s) => (
                        <tr key={s.id} className="border-b border-border/50 last:border-0">
                          <td className="p-4 text-foreground">{s.plan?.name ?? "—"}</td>
                          <td className="p-4 text-muted-foreground">
                            {s.cancel_at_period_end ? "Annulation en fin de période" : s.status}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {new Date(s.next_billing_at).toLocaleDateString("fr-FR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SellerSubscriptions;
