import { formatTokenInspection, inspectStoredTokens } from "../../auth/inspect";
import { Output } from "../../ui";
import type { CommandSpec } from "../types";

export const inspectTokenCommand = {
  path: "auth inspect-token",
  description: "Decode and display stored authentication tokens",
  implemented: true,
  run: async ({ args }) => inspectStoredTokens(args),
  present: (data) => <TokenInspectionView data={data} />,
} satisfies CommandSpec<Awaited<ReturnType<typeof inspectStoredTokens>>>;

function TokenInspectionView({
  data,
}: {
  data: Awaited<ReturnType<typeof inspectStoredTokens>>;
}) {
  return <Output data={formatTokenInspection(data)} />;
}
