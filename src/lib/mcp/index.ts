import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getMyProfileTool from "./tools/get-my-profile";
import listMyPurchasesTool from "./tools/list-my-purchases";
import getPurchaseTool from "./tools/get-purchase";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "sellfy-pi",
  title: "Sellfy.pi",
  version: "0.1.0",
  instructions:
    "Tools for Sellfy.pi, a digital product marketplace for the Pi Network ecosystem. Use `get_my_profile` for the signed-in Pi account, `list_my_purchases` to browse that user's Pi purchases, and `get_purchase` to inspect one purchase by Pi payment id.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getMyProfileTool, listMyPurchasesTool, getPurchaseTool],
});
