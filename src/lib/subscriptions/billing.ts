// Billing engine abstraction for the Subscriptions module.
//
// TRANSITIONAL MODE (current): Pi Network's Subscription Smart Contract (PiRC2)
// is only available on Testnet, so recurring charges cannot be authorized once
// and pulled automatically. Every renewal therefore triggers a fresh U2A
// Pi.createPayment() request, and the user is reminded before each due date.
//
// SMART CONTRACT MODE (future): once PiRC2 ships on Mainnet, the user will
// authorize a recurring amount that stays in their wallet until each billing
// cycle. Only this file needs to change — swap `manualBillingProvider` for
// `smartContractBillingProvider` in `activeBillingProvider`.

import { purchaseDigitalProduct } from "@/lib/piPayments";
import { INTERVAL_DAYS, type BillingInterval, type SubscriptionPlan } from "./types";

export type BillingMode = "manual_recurring" | "pi_smart_contract";

export interface ChargeResult {
  paymentId: string;
  txid: string;
}

export interface BillingProvider {
  mode: BillingMode;
  /** Human readable note surfaced in the UI. */
  notice: string;
  /** Charges one billing cycle for the given plan. */
  charge: (plan: SubscriptionPlan, cycleLabel: string) => Promise<ChargeResult>;
  /** True when renewals require a manual user action each cycle. */
  requiresManualRenewal: boolean;
}

export const addInterval = (from: Date, interval: BillingInterval): Date => {
  const next = new Date(from);
  next.setDate(next.getDate() + INTERVAL_DAYS[interval]);
  return next;
};

export const manualBillingProvider: BillingProvider = {
  mode: "manual_recurring",
  notice:
    "Le smart contract d'abonnement de Pi Network est encore en Testnet (PiRC2). En attendant, chaque échéance déclenche un nouveau paiement Pi à valider manuellement, avec un rappel avant la date de facturation.",
  requiresManualRenewal: true,
  charge: (plan, cycleLabel) =>
    new Promise<ChargeResult>((resolve, reject) => {
      void purchaseDigitalProduct(
        {
          id: `sub_${plan.id}`,
          title: `${plan.name} — ${cycleLabel}`,
          amount: plan.price,
        },
        {
          onSuccess: (paymentId, txid) => resolve({ paymentId, txid }),
          onCancel: () => reject(new Error("Paiement annulé")),
          onError: (message) => reject(new Error(message)),
        },
      ).catch(reject);
    }),
};

/**
 * Placeholder for the native Pi Subscription Smart Contract (Mainnet pending).
 * Implement `charge` against the PiRC2 authorization API when available.
 */
export const smartContractBillingProvider: BillingProvider = {
  mode: "pi_smart_contract",
  notice:
    "Abonnement géré par le smart contract Pi Network : le montant récurrent est autorisé une seule fois et prélevé automatiquement à chaque échéance.",
  requiresManualRenewal: false,
  charge: async () => {
    throw new Error(
      "Le Subscription Smart Contract de Pi Network n'est pas encore disponible en Mainnet.",
    );
  },
};

export const activeBillingProvider: BillingProvider = manualBillingProvider;

/** Days remaining before the next charge (negative when overdue). */
export const daysUntil = (iso: string) =>
  Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);

/** Reminder threshold used by the renewal notifier. */
export const REMINDER_DAYS = 3;
