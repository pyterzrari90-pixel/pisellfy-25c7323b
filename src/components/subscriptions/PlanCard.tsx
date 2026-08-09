import { motion } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INTERVAL_LABELS, TIER_LABELS, type SubscriptionPlan } from "@/lib/subscriptions/types";

interface PlanCardProps {
  plan: SubscriptionPlan;
  pending?: boolean;
  subscribed?: boolean;
  onSubscribe?: (plan: SubscriptionPlan) => void;
  index?: number;
}

const PlanCard = ({ plan, pending, subscribed, onSubscribe, index = 0 }: PlanCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.08 }}
    className="glass rounded-2xl border border-border p-6 flex flex-col"
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-primary">
        {TIER_LABELS[plan.tier] ?? plan.tier}
      </span>
      {plan.tier === "premium" && <Sparkles className="w-4 h-4 text-primary" />}
    </div>

    <h3 className="font-display text-xl font-bold text-foreground">{plan.name}</h3>
    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{plan.description}</p>

    <div className="mt-5 flex items-baseline gap-2">
      <span className="font-display text-3xl font-bold gradient-text">π {plan.price}</span>
      <span className="text-sm text-muted-foreground">{INTERVAL_LABELS[plan.interval]}</span>
    </div>

    {plan.benefits.length > 0 && (
      <ul className="mt-5 space-y-2 flex-1">
        {plan.benefits.map((b) => (
          <li key={b} className="flex gap-2 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    )}

    {plan.included_content.length > 0 && (
      <div className="mt-4 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Contenu inclus : </span>
        {plan.included_content.join(", ")}
      </div>
    )}

    {onSubscribe && (
      <Button
        variant={subscribed ? "outline" : "gold"}
        size="lg"
        className="mt-6 w-full"
        disabled={pending || subscribed}
        onClick={() => onSubscribe(plan)}
      >
        {pending && <Loader2 className="w-4 h-4 animate-spin" />}
        {subscribed ? "Déjà abonné" : pending ? "Paiement Pi…" : "S'abonner avec Pi"}
      </Button>
    )}
  </motion.div>
);

export default PlanCard;
