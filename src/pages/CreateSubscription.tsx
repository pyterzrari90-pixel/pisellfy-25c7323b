import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SmartContractNotice from "@/components/subscriptions/SmartContractNotice";
import { usePiAuth } from "@/hooks/usePiAuth";
import { toast } from "@/hooks/use-toast";
import { createPlan } from "@/lib/subscriptions/api";
import {
  INTERVAL_LABELS,
  TIERS,
  TIER_LABELS,
  type BillingInterval,
} from "@/lib/subscriptions/types";

const ListEditor = ({
  label,
  placeholder,
  items,
  setItems,
}: {
  label: string;
  placeholder: string;
  items: string[];
  setItems: (v: string[]) => void;
}) => {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    setItems([...items, v]);
    setDraft("");
  };
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={add}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {items.length > 0 && (
        <ul className="flex flex-wrap gap-2 pt-1">
          {items.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className="flex items-center gap-2 text-sm rounded-full bg-secondary px-3 py-1 text-foreground"
            >
              {item}
              <button
                type="button"
                onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                aria-label={`Retirer ${item}`}
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const CreateSubscription = () => {
  const { session, signIn } = usePiAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [tier, setTier] = useState<string>("basic");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [benefits, setBenefits] = useState<string[]>([]);
  const [content, setContent] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      await signIn();
      return;
    }
    const amount = Number(price);
    if (!name.trim() || !Number.isFinite(amount) || amount <= 0) {
      toast({ title: "Formulaire incomplet", description: "Nom et prix en Pi requis.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await createPlan(session.user.id, {
        name: name.trim(),
        tier,
        description: description.trim(),
        price: amount,
        interval,
        benefits,
        included_content: content,
      });
      toast({ title: "Formule créée", description: `« ${name} » est en ligne.` });
      navigate("/subscriptions/dashboard");
    } catch (err) {
      toast({
        title: "Création impossible",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20 max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-foreground">Créer un abonnement</h1>
        <p className="text-muted-foreground mt-2">
          Définissez une formule récurrente en Pi. Créez plusieurs formules (Basique / Pro /
          Premium) pour proposer différents niveaux d'avantages.
        </p>

        <div className="mt-6">
          <SmartContractNotice />
        </div>

        <form onSubmit={submit} className="glass rounded-2xl border border-border p-6 mt-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'offre</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Accès Créateur Pro" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Formule</Label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIERS.map((t) => (
                    <SelectItem key={t} value={t}>{TIER_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fréquence de facturation</Label>
              <Select value={interval} onValueChange={(v) => setInterval(v as BillingInterval)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(INTERVAL_LABELS) as BillingInterval[]).map((k) => (
                    <SelectItem key={k} value={k}>{INTERVAL_LABELS[k]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Prix récurrent (Pi)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ce que l'abonné obtient chaque période…"
              rows={4}
            />
          </div>

          <ListEditor
            label="Avantages"
            placeholder="Support prioritaire"
            items={benefits}
            setItems={setBenefits}
          />
          <ListEditor
            label="Contenu associé (produits, formations, services)"
            placeholder="Formation React avancé"
            items={content}
            setItems={setContent}
          />

          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {session ? "Publier la formule" : "Se connecter avec Pi"}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default CreateSubscription;
