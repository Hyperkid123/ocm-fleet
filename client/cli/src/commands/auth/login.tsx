import { runAuthLogin } from "../../auth/login";
import { Output } from "../../ui";
import type { CommandSpec } from "../types";

export const loginCommand = {
  path: "auth login",
  description: "Authenticate with configured OIDC provider",
  implemented: true,
  present: (data) => <Output data={data} />,
  run: async ({ args }) => runAuthLogin(args),
} satisfies CommandSpec<string>;
