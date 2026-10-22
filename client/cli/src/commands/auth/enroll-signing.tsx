import { runAuthEnrollSigning } from "../../auth/enroll-signing";
import { Output } from "../../ui";
import type { CommandSpec } from "../types";

export const enrollSigningCommand = {
  path: "auth enroll-signing",
  description: "Generate and enroll signing key pair",
  implemented: true,
  present: (data) => <Output data={data} />,
  run: async ({ args }) => runAuthEnrollSigning(args),
} satisfies CommandSpec<string>;
