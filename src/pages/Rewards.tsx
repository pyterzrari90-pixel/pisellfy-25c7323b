import { useState } from "react";
import { Copy, Gift, Users, Clock, CheckCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePoints } from "@/hooks/usePoints";
import { usePiAuth } from "@/hooks/usePiAuth";
import { toast } from "@/hooks/use-toast";
import { POINTS_CONFIG } from "@/lib/points/types";

const Rewards = () => {
  const { session, signIn } = usePiAuth();
  const { balance, history, referralCode, referrals, loading } = usePoints();
  const [copied, setCopied] = useState(false);

  const referralLink = referralCode
    ? `${window.location.origin}?ref=${referralCode}`
    : "";

  const copyReferralLink = async () => {
    if (!referralLink) return;

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Lien copié !",
        description: "Partagez ce lien avec vos amis.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien.",
        variant: "destructive",
      });
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-28 pb-20">
          <div className="max-w-2xl mx-auto text-center">
            <Gift className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              Programme de Fidélité
            </h1>
            <p className="text-muted-foreground mb-6">
              Connectez-vous avec Pi pour accéder à vos points de fidélité et votre programme de parrainage.
            </p>
            <Button variant="gold" size="lg" onClick={() => void signIn()}>
              Se connecter avec Pi
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const piValue = (balance / POINTS_CONFIG.POINTS_TO_PI_RATE).toFixed(2);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">
              Mes Points & Parrainages
            </h1>
            <p className="text-muted-foreground mt-2">
              Gagnez des points et Invitez vos amis pour obtenir des réductions
            </p>
          </header>

          {/* Points Balance Card */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Solde de Points
                </CardTitle>
                <CardDescription>Vos points de fidélité accumulés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-5xl font-bold gradient-text mb-2">{balance}</p>
                  <p className="text-sm text-muted-foreground">
                    ≈ {piValue} Pi de réduction potentielle
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ({POINTS_CONFIG.POINTS_TO_PI_RATE} points = 1 Pi)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Parrainage
                </CardTitle>
                <CardDescription>Invitez vos amis et gagnez des bonus</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Votre code de parrainage</p>
                    <div className="flex gap-2">
                      <code className="flex-1 px-4 py-2 bg-secondary rounded-lg font-mono text-lg">
                        {referralCode || "Chargement..."}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyReferralLink}
                        disabled={!referralCode}
                      >
                        {copied ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>Partagez votre lien :</p>
                    <code className="block mt-1 px-3 py-2 bg-secondary rounded text-xs break-all">
                      {referralLink}
                    </code>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-xs font-semibold mb-2">Bonus de parrainage :</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• +{POINTS_CONFIG.REFERRAL_SIGNUP_BONUS} points quand votre filleul s'inscrit</li>
                      <li>• +{POINTS_CONFIG.REFERRAL_FIRST_ORDER_BONUS} points à sa première commande</li>
                      <li>• +{POINTS_CONFIG.REFERRAL_INVITEE_BONUS} points bonus pour le filleul</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referrals List */}
          {referrals.length > 0 && (
            <Card className="glass mb-8">
              <CardHeader>
                <CardTitle>Vos filleuls ({referrals.length})</CardTitle>
                <CardDescription>Personnes inscrites via votre code</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">Utilisateur invité</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(referral.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          referral.status === "first_order_completed"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {referral.status === "first_order_completed"
                          ? "Première commande ✓"
                          : "Inscrit"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Points History */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Historique des Points
              </CardTitle>
              <CardDescription>Toutes vos transactions de points</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-center py-8">Chargement...</p>
              ) : history.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Aucune transaction pour le moment.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Gagnez des points en créant des produits, achetant et parrainant !
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span
                        className={`text-lg font-bold ${
                          tx.amount > 0 ? "text-green-500" : "text-orange-500"
                        }`}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Rewards;
