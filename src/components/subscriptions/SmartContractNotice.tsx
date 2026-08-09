import { AlertTriangle } from "lucide-react";
import { activeBillingProvider } from "@/lib/subscriptions/billing";

/** Explains the current Pi Network smart-contract limitation (PiRC2 Testnet). */
const SmartContractNotice = () => (
  <div className="glass rounded-xl border border-primary/20 p-4 flex gap-3">
    <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
    <div className="text-sm text-muted-foreground">
      <p className="font-semibold text-foreground mb-1">
        Mode transitoire — smart contract Pi en Testnet
      </p>
      <p>{activeBillingProvider.notice}</p>
    </div>
  </div>
);

export default SmartContractNotice;
