import type { AuthContextProps } from "react-oidc-context";

import { type AuthMethod, createSignerEnrollment } from "./api";
import { signDeployment } from "./signingKeyApi";

export type RegistryType = "oidc" | "github";

export async function refreshAndGetIdToken(
  auth: Pick<AuthContextProps, "signinSilent">,
): Promise<string> {
  let renewed;
  try {
    renewed = await auth.signinSilent();
  } catch (err) {
    throw new Error(
      `Unable to renew the OIDC session. Check provider renewal support or sign in again. ${err instanceof Error ? err.message : "Session renewal failed"}`,
    );
  }

  if (!renewed?.id_token) {
    throw new Error(
      "Session renewal returned no ID token. Configure provider ID token support and sign in again.",
    );
  }
  return renewed.id_token;
}

export async function enrollWithOidc(
  auth: Pick<AuthContextProps, "signinSilent">,
  onEnrolled: (name: string) => void,
): Promise<void> {
  const idToken = await refreshAndGetIdToken(auth);
  try {
    const enrollment = await createSignerEnrollment({
      signerEnrollmentId: `browser-${Date.now()}`,
      identityToken: idToken,
    });
    onEnrolled(enrollment.name);
    await testSign(idToken);
  } catch (err) {
    throw new Error(
      `OIDC signing enrollment failed. Check the provider signing claim against the configured CEL expression. ${err instanceof Error ? err.message : "Verification failed"}`,
    );
  }
}

export async function testSign(idToken: string): Promise<void> {
  const payload = JSON.stringify({ test: true, ts: Date.now() });
  const payloadBytes = new TextEncoder().encode(payload);
  const signature = await signDeployment(payloadBytes);

  const res = await fetch("/api/ui/verify-sign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ payload, signature }),
  });
  if (!res.ok) {
    throw new Error(
      `Signature verification request failed (${res.status}): ${await res.text()}`,
    );
  }
  const result = await res.json();
  if (!result.verified) {
    throw new Error(result.error || "Signature verification failed");
  }
}

export function detectRegistry(method: AuthMethod): RegistryType {
  if (method.oidcConfig?.registrySubjectMapping) return "github";
  return "oidc";
}
