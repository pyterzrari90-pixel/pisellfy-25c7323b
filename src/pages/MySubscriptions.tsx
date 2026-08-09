import { Link } from "react-router-dom";
import { CalendarClock, Loader2, RefreshCw } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SmartContractNotice from "@/components/subscriptions/SmartContractNotice";
import { useMySubscriptions } from "@/hooks/useSubscriptions";
import { activeBillingProvider, daysUntil } from "@/lib/subscriptions/billing";
import { INTERVAL_LABELS } from "@/lib/subscriptions/types";
import { usePiAuth } from "@/hooks/usePiAuth";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("fr-FR");

const MySubscriptions = () => {
  const { session, signIn } = usePiAuth();
  const { subscriptions, loading, cancel, resume, renew, pendingPlanId } = useMySubscriptions();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20">
        <h1 className="font-display text-3xl font-bold text-foreground">Mes abonnements</h1>
        <p className="text-muted-foreground mt-2">
          Statut, prochaine date de facturation et gestion de vos abonnements payés en Pi.
        </p>

        <div className="mt-6 max-w-3xl">
          <SmartContractNotice />
        </div>

        {!session ? (
          <Button variant="gold" className="mt-8" onClick={() => void signIn()}>
            Se connecter avec Pi
          </Button>
        ) : loading ? (
          <div className="flex items-center gap-2 text-muted-foreground mt-10">
            <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
          </div>
        ) : subscriptions.length === 0 ? (
          <p className="text-muted-foreground mt-10">
            Aucun abonnement.{" "}
            <Link to="/subscriptions" className="text-primary underline">
              Parcourir le catalogue
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-4 mt-10 lg:grid-cols-2">
            {subscriptions.map((sub) => {
              const days = daysUntil(sub.next_billing_at);
              const dueSoon = days <= 3 && !sub.cancel_at_period_end;
              return (
                <div key={sub.id} className="glass rounded-2xl border border-border p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">
                        {sub.plan?.name ?? "Formule supprimée"}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        π {sub.plan?.price ?? "—"}{" "}
                        {sub.plan ? INTERVAL_LABELS[sub.plan.interval] : ""}
                      </p>
                    </div>
                    <Badge variant={sub.cancel_at_period_end ? "outline" : "default"}>
                      {sub.cancel_at_period_end
                        ? "Annulé — accès jusqu'à la fin de période"
                        : sub.status === "active"
                          ? "Actif"
                          : sub.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                    <CalendarClock className="w-4 h-4 text-primary" />
                    {sub.cancel_at_period_end ? (
                      <span>Accès jusqu'au {fmt(sub.current_period_end)}</span>
                    ) : (
                      <span>
                        Prochaine facturation : {fmt(sub.next_billing_at)}
                        {dueSoon ? ` (dans ${days} jour(s))` : ""}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-6">
                    {sub.cancel_at_period_end ? (
                      <Button variant="gold" onClick={() => void resume(sub.id)}>
                        Réactiver
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => void cancel(sub.id)}>
                        Annuler
                      </Button>
                    )}
                    {activeBillingProvider.requiresManualRenewal && sub.plan && !sub.cancel_at_period_end && (
                      <Button
                        variant={dueSoon ? "gold" : "outline"}
                        disabled={pendingPlanId === sub.plan_id}
                        onClick={() => void renew(sub.plan!)}
                      >
                        {pendingPlanId === sub.plan_id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        Renouveler avec Pi
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MySubscriptions;
