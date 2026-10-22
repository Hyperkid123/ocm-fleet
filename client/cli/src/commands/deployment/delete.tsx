import { Output } from "../../ui";
import type { CommandSpec } from "../types";
import { deploymentClient, deploymentName } from "./helpers";

export const deleteCommand = {
  path: "deployment delete",
  description: "Delete a deployment",
  implemented: true,
  present: (data) => <Output data={data} />,
  run: async ({ args }) => {
    const name = args.positionals[0];
    if (!name) throw new Error("deployment name is required");
    await (
      await deploymentClient(args)
    ).request(`/v1alpha/${deploymentName(name)}`, { method: "DELETE" });
    return "Deleted.";
  },
} satisfies CommandSpec<string>;
