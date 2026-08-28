/** Client helper: ask our backend to validate a Pi access token. */
export interface VerifiedPiUser {
  uid: string;
  username: string;
}

export async function verifyPiAccessToken(accessToken: string): Promise<VerifiedPiUser> {
  const response = await fetch("/api/public/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken }),
  });

  const body = (await response.json().catch(() => ({}))) as {
    uid?: string;
    username?: string;
    error?: string;
  };

  if (!response.ok || !body.uid) {
    throw new Error(body.error ?? "Pi sign-in could not be verified. Please try again.");
  }

  return { uid: body.uid, username: body.username ?? "" };
}
