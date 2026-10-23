import type { AuthMethod } from "./api";
import type { RegistryType } from "./enrollmentUtils";

export enum EnrollStep {
  Loading = "loading",
  Generating = "generating",
  RegisterKey = "register-key",
  Enrolling = "enrolling",
  Verifying = "verifying",
  Enrolled = "enrolled",
  Error = "error",
}

export enum Action {
  InitAuth,
  ExistingKey,
  Generating,
  EnrollStart,
  EnrollSuccess,
  VerifySuccess,
  Error,
  Retry,
  ReEnroll,
  SetGhPoll,
}

export interface EnrollmentState {
  step: EnrollStep;
  sshPublicKey: string | null;
  derPublicKey: string | null;
  registry: RegistryType;
  authMethod: AuthMethod | null;
  error: string | null;
  enrollmentName: string | null;
  ghPollEnabled: boolean;
}

export type EnrollmentAction =
  | { type: Action.InitAuth; authMethod: AuthMethod; registry: RegistryType }
  | {
      type: Action.ExistingKey;
      sshPublicKey: string;
      derPublicKey: string;
    }
  | { type: Action.Generating }
  | { type: Action.EnrollStart }
  | { type: Action.EnrollSuccess; enrollmentName: string }
  | { type: Action.VerifySuccess }
  | { type: Action.Error; error: string }
  | { type: Action.Retry }
  | { type: Action.ReEnroll }
  | { type: Action.SetGhPoll; enabled: boolean };

export const initialState: EnrollmentState = {
  step: EnrollStep.Loading,
  sshPublicKey: null,
  derPublicKey: null,
  registry: "oidc",
  authMethod: null,
  error: null,
  enrollmentName: null,
  ghPollEnabled: false,
};

export function enrollmentReducer(
  state: EnrollmentState,
  action: EnrollmentAction,
): EnrollmentState {
  switch (action.type) {
    case Action.InitAuth:
      return {
        ...state,
        authMethod: action.authMethod,
        registry: action.registry,
      };
    case Action.ExistingKey:
      return {
        ...state,
        sshPublicKey: action.sshPublicKey,
        derPublicKey: action.derPublicKey,
        enrollmentName: null,
        step: EnrollStep.RegisterKey,
        error: null,
        ghPollEnabled: false,
      };
    case Action.Generating:
      return { ...state, step: EnrollStep.Generating };
    case Action.EnrollStart:
      return {
        ...state,
        step: EnrollStep.Enrolling,
        error: null,
        enrollmentName: null,
      };
    case Action.EnrollSuccess:
      return {
        ...state,
        step: EnrollStep.Verifying,
        enrollmentName: action.enrollmentName,
      };
    case Action.VerifySuccess:
      return { ...state, step: EnrollStep.Enrolled };
    case Action.Error:
      return {
        ...state,
        step: EnrollStep.Error,
        error: action.error,
        enrollmentName: null,
      };
    case Action.Retry:
      return {
        ...state,
        error: null,
        step: state.sshPublicKey ? EnrollStep.RegisterKey : EnrollStep.Loading,
      };
    case Action.ReEnroll:
      return {
        ...state,
        sshPublicKey: null,
        derPublicKey: null,
        enrollmentName: null,
        ghPollEnabled: false,
        step: EnrollStep.Loading,
      };
    case Action.SetGhPoll:
      return { ...state, ghPollEnabled: action.enabled };
  }
}
