/**
 * Fixed sandbox personas served by the bundled Dex identity provider
 * (deploy/aio/internal/aioinit/dexconfig.go, deploy/aio/README.md). These are
 * public sandbox fixtures, not production credentials.
 *
 * Persona IDs label sandbox fixtures, not authorization roles. The console
 * uses standard OIDC identity claims and does not infer ops/dev authorization.
 * These fixtures share navigation; their masthead labels use the capitalized
 * `preferred_username`, with standard `name`/email/subject fallbacks. Authorization mapping
 * is tracked separately (OME-206).
 */
export type PersonaId = "ops" | "dev";

export interface Persona {
  /** Stable id used to name saved auth artifacts. */
  id: PersonaId;
  email: string;
  password: string;
  /** Masthead user-menu toggle label = capitalized preferred_username. */
  usernameLabel: string;
}

export const OPERATOR: Persona = {
  id: "ops",
  email: "ops@ocm-fleet.local",
  password: "ocm-fleet-ops",
  usernameLabel: "Ops-user",
};

export const DEVELOPER: Persona = {
  id: "dev",
  email: "dev@ocm-fleet.local",
  password: "ocm-fleet-dev",
  usernameLabel: "Dev-user",
};

export const PERSONAS: Persona[] = [OPERATOR, DEVELOPER];
