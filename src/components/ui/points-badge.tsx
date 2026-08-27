// Points Badge Component for Navigation
import { Gift } from "lucide-react";
import { usePoints } from "@/hooks/usePoints";
import { usePiAuth } from "@/hooks/usePiAuth";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const PointsBadge = () => {
  const { session } = usePiAuth();
  const { balance, loading } = usePoints();

  if (!session || loading) return null;

  return (
    <Link to="/rewards">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-sm font-medium hover:bg-primary/10"
      >
        <Gift className="w-4 h-4 text-primary" />
        <span className="gradient-text font-bold">{balance}</span>
        <span className="text-muted-foreground text-xs">pts</span>
      </Button>
    </Link>
  );
};
