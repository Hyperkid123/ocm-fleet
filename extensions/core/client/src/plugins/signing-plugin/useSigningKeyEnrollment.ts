import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useAuth as useOidcAuth } from "react-oidc-context";

import { getSetupProgressStore } from "../setup-plugin/setupProgress";
import { createSignerEnrollment, getAuthMethod } from "./api";
import {
  Action,
  enrollmentReducer,
  EnrollStep,
  initialState,
} from "./enrollmentReducer";
import { detectRegistry, enrollWithOidc, testSign } from "./enrollmentUtils";
import {
  exportPublicKeyDER,
  exportSSHPublicKey,
  generateSigningKey,
  getStoredPublicKey,
  removeSigningKey,
} from "./signingKeyApi";
export { EnrollStep } from "./enrollmentReducer";

const POLL_LIMIT = 6;

function useGitHubKeyPolling(
  username: string | null,
  sshPublicKey: string | null,
  enabled: boolean,
) {
  const [found, setFound] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const clearPollingError = useCallback(() => setError(undefined), [setError]);

  useEffect(() => {
    setFound(false);
  }, [username, sshPublicKey]);

  useEffect(() => {
    if (!enabled || !username || !sshPublicKey || found) return;
    const pollIncrement = 1000;
    let pollInterval = pollIncrement;
    let pollingAttempts = 0;

    const keyData = sshPublicKey.split(" ")[1];

    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;
    const poll = async () => {
      if (pollingAttempts >= POLL_LIMIT) {
        console.error("GitHub key polling exceeded maximum attempts");
        setFound(false);
        clearTimeout(timer);
        setError(
          "Unable to verify GitHub signing key. Please ensure the signing key is added to GitHub and try again.",
        );
        return;
      }
      pollInterval += pollIncrement;
      pollingAttempts += 1;
      try {
        const res = await fetch(
          `/api/ui/github-signing-keys/${encodeURIComponent(username)}`,
        );
        if (!res.ok) {
          throw "unable to fetch GitHub keys, retrying...";
        }
        const keys: string[] = await res.json();
        if (keys.some((k) => k.includes(keyData))) {
          setFound(true);
          return;
        }
      } catch {
        pollInterval += pollIncrement;
        if (pollingAttempts >= POLL_LIMIT / 2) {
          console.error(
            `GitHub key API is not responding. Attempt ${pollingAttempts}.`,
          );
          setError(
            "Unable to verify GitHub signing key due to network issues. Please check your connection and try again.",
          );
          clearTimeout(timer);
          return;
        }
      }
      if (!cancelled) {
        timer = setTimeout(poll, pollInterval);
      }
    };
    timer = setTimeout(poll, pollInterval);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      pollingAttempts = 0;
    };
  }, [enabled, username, sshPublicKey, found]);

  return { found, error, clearPollingError };
}

// --- Main hook ---

export function useSigningKeyEnrollment() {
  const auth = useOidcAuth();
  const [state, dispatch] = useReducer(enrollmentReducer, initialState);
  const issuer = auth.user?.profile.iss;
  const subject = auth.user?.profile.sub;
  const identityKey = JSON.stringify([issuer, subject]);
  const currentIdentityKey = useRef(identityKey);
  currentIdentityKey.current = identityKey;

  const githubUsername = state.authMethod?.oidcConfig?.registrySubjectMapping
    ? (((auth.user?.profile as Record<string, unknown>)?.github_username as
        string | undefined) ?? null)
    : null;

  const {
    found: keyFound,
    error: ghKeyError,
    clearPollingError,
  } = useGitHubKeyPolling(
    githubUsername,
    state.sshPublicKey,
    state.ghPollEnabled &&
      state.step === EnrollStep.RegisterKey &&
      state.registry === "github",
  );

  useEffect(() => {
    if (keyFound || state.ghPollEnabled) {
      clearPollingError();
    }
  }, [keyFound, state.ghPollEnabled, clearPollingError]);

  useEffect(() => {
    if (ghKeyError) {
      dispatch({ type: Action.SetGhPoll, enabled: false });
    }
  }, [keyFound, ghKeyError]);

  const initialize = useCallback(
    async (isActive: () => boolean = () => true) => {
      try {
        clearPollingError();
        const method = await getAuthMethod("default");
        if (!isActive()) return;
        const reg = detectRegistry(method);
        dispatch({ type: Action.InitAuth, authMethod: method, registry: reg });
        let publicKey = await getStoredPublicKey();
        if (!isActive()) return;
        if (!publicKey) {
          dispatch({ type: Action.Generating });
          await generateSigningKey();
          publicKey = await getStoredPublicKey();
        }
        if (!publicKey) throw new Error("No signing key in IndexedDB");
        const sshPublicKey = await exportSSHPublicKey(publicKey);
        const derPublicKey = await exportPublicKeyDER(publicKey);
        // A stored key is not proof of enrollment. Verify it in this workflow.
        if (isActive())
          dispatch({ type: Action.ExistingKey, sshPublicKey, derPublicKey });
      } catch (err) {
        if (!isActive()) return;
        dispatch({
          type: Action.Error,
          error: err instanceof Error ? err.message : "Initialization failed",
        });
      }
    },
    [clearPollingError],
  );

  useEffect(() => {
    let active = true;
    void initialize(() => active);
    return () => {
      active = false;
    };
  }, [initialize]);

  const enrollOidc = useCallback(async () => {
    dispatch({ type: Action.EnrollStart });
    try {
      if (!state.authMethod?.oidcConfig?.publicKeyClaimExpression) {
        throw new Error(
          "OIDC signing requires a configured public-key claim CEL expression.",
        );
      }
      await enrollWithOidc(auth, (enrollmentName) => {
        if (currentIdentityKey.current === identityKey)
          dispatch({ type: Action.EnrollSuccess, enrollmentName });
      });
      if (currentIdentityKey.current !== identityKey) return;
      await getSetupProgressStore().setStepComplete(
        "signing-key-enrollment",
        true,
      );
      if (currentIdentityKey.current === identityKey)
        dispatch({ type: Action.VerifySuccess });
    } catch (err) {
      if (currentIdentityKey.current !== identityKey) return;
      dispatch({
        type: Action.Error,
        error: err instanceof Error ? err.message : "Enrollment failed",
      });
    }
  }, [auth, state.authMethod, identityKey]);

  const enrollGithub = useCallback(async () => {
    dispatch({ type: Action.EnrollStart });
    try {
      const idToken = auth.user?.id_token;
      if (!idToken) throw new Error("No ID token — log in first");

      const enrollment = await createSignerEnrollment({
        signerEnrollmentId: `browser-${Date.now()}`,
        identityToken: idToken,
        registryId: "github.com",
      });
      if (currentIdentityKey.current !== identityKey) return;
      dispatch({
        type: Action.EnrollSuccess,
        enrollmentName: enrollment.name,
      });

      await testSign(idToken);
      if (currentIdentityKey.current !== identityKey) return;
      await getSetupProgressStore().setStepComplete(
        "signing-key-enrollment",
        true,
      );
      if (currentIdentityKey.current === identityKey)
        dispatch({ type: Action.VerifySuccess });
    } catch (err) {
      if (currentIdentityKey.current !== identityKey) return;
      dispatch({
        type: Action.Error,
        error: err instanceof Error ? err.message : "Enrollment failed",
      });
    }
  }, [auth, identityKey]);

  const handleReenroll = useCallback(async () => {
    await getSetupProgressStore().setStepComplete(
      "signing-key-enrollment",
      false,
    );
    await removeSigningKey();
    dispatch({ type: Action.ReEnroll });
    await initialize();
  }, [initialize]);

  const retry = useCallback(async () => {
    dispatch({ type: Action.Retry });
    if (!state.sshPublicKey) {
      await initialize();
    }
  }, [state.sshPublicKey, initialize]);

  useEffect(() => {
    if (
      keyFound &&
      state.step === "register-key" &&
      state.registry === "github"
    ) {
      enrollGithub();
    }
  }, [keyFound, state.step, state.registry, enrollGithub]);

  const setGhPollEnabled = useCallback(
    (enabled: boolean) => dispatch({ type: Action.SetGhPoll, enabled }),
    [],
  );

  return {
    step: state.step,
    sshPublicKey: state.sshPublicKey,
    derPublicKey: state.derPublicKey,
    publicKeyClaimExpression:
      state.authMethod?.oidcConfig?.publicKeyClaimExpression,
    registry: state.registry,
    error: state.error,
    enrollmentName: state.enrollmentName,
    githubUsername,
    ghPollEnabled: state.ghPollEnabled,
    ghKeyError,
    enrollOidc,
    retry,
    handleReenroll,
    setGhPollEnabled,
  };
}
