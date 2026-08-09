import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import PlanCard from "@/components/subscriptions/PlanCard";
import SmartContractNotice from "@/components/subscriptions/SmartContractNotice";
import { useMySubscriptions, useSubscriptionCatalog } from "@/hooks/useSubscriptions";

const Subscriptions = () => {
  const { plans, loading } = useSubscriptionCatalog();
  const { subscriptions, subscribe, pendingPlanId } = useMySubscriptions();
  const activePlanIds = new Set(
    subscriptions.filter((s) => s.status === "active").map((s) => s.plan_id),
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20">
        <header className="max-w-2xl">
          <h1 className="font-display text-3xl lg:text-5xl font-bold text-foreground">
            Abonnements <span className="gradient-text">Pi</span>
          </h1>
          <p className="text-muted-foreground mt-4">
            Accédez en continu à du contenu numérique, des formations et des services exclusifs.
            Paiement 100 % en Pi, sans aucun autre moyen de paiement.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Button variant="outline" asChild>
              <Link to="/subscriptions/mine">Mes abonnements</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/subscriptions/create">Créer un abonnement</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/subscriptions/dashboard">Tableau de bord vendeur</Link>
            </Button>
          </div>
        </header>

        <div className="mt-8 max-w-3xl">
          <SmartContractNotice />
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground mt-12">
            <Loader2 className="w-4 h-4 animate-spin" /> Chargement des offres…
          </div>
        ) : plans.length === 0 ? (
          <p className="text-muted-foreground mt-12">
            Aucune offre d'abonnement pour le moment.{" "}
            <Link to="/subscriptions/create" className="text-primary underline">
              Créez la première
            </Link>
            .
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {plans.map((plan, i) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                index={i}
                pending={pendingPlanId === plan.id}
                subscribed={activePlanIds.has(plan.id)}
                onSubscribe={subscribe}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Subscriptions;
