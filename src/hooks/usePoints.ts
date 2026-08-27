import { useCallback, useEffect, useState } from "react";
import { usePiAuth } from "@/hooks/usePiAuth";
import { toast } from "@/hooks/use-toast";
import {
  getUserPoints,
  getPointsHistory,
  redeemPoints as redeemPointsApi,
  getOrCreateReferralCode,
  getUserReferrals,
  type UserPoints,
  type PointsTransaction,
  type Referral,
} from "@/lib/points/api";

/**
 * Hook to manage user points and referrals
 */
export const usePoints = () => {
  const { session } = usePiAuth();
  const userId = session?.user?.id ?? null;

  const [points, setPoints] = useState<UserPoints | null>(null);
  const [history, setHistory] = useState<PointsTransaction[]>([]);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setPoints(null);
      setHistory([]);
      setReferralCode(null);
      setReferrals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [pointsData, historyData, code, referralsData] = await Promise.all([
        getUserPoints(userId),
        getPointsHistory(userId),
        getOrCreateReferralCode(userId),
        getUserReferrals(userId),
      ]);

      setPoints(pointsData);
      setHistory(historyData);
      setReferralCode(code);
      setReferrals(referralsData);
    } catch (e) {
      toast({
        title: "Erreur",
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

  const redeemPoints = useCallback(
    async (pointsToRedeem: number, currentPiAmount: number) => {
      if (!userId) {
        toast({
          title: "Non connecté",
          description: "Connectez-vous pour utiliser vos points.",
          variant: "destructive",
        });
        return null;
      }

      try {
        const result = await redeemPointsApi(userId, pointsToRedeem, currentPiAmount);
        await refresh();
        toast({
          title: "Points échangés",
          description: `${pointsToRedeem} points = ${result.piDiscount.toFixed(2)} Pi de réduction`,
        });
        return result;
      } catch (e) {
        toast({
          title: "Échange impossible",
          description: e instanceof Error ? e.message : String(e),
          variant: "destructive",
        });
        return null;
      }
    },
    [userId, refresh]
  );

  return {
    points,
    history,
    referralCode,
    referrals,
    loading,
    redeemPoints,
    refresh,
    balance: points?.balance ?? 0,
  };
};
