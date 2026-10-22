import { Output } from "../../ui";
import { clientForArgs } from "../context";
import type { CommandSpec } from "../types";
import { resourceRoute } from "./helpers";

export const deleteCommand = {
  path: "resource delete",
  description: "Delete a managed resource",
  implemented: true,
  present: (data) => <Output data={data} />,
  run: async ({ args }) => {
    const type = args.positionals[0];
    const id = args.positionals[1];
    if (!type || !id) throw new Error("resource type and id are required");
    const route = resourceRoute(type);
    await (
      await clientForArgs(args)
    ).request(`${route.path}/${encodeURIComponent(id)}`, { method: "DELETE" });
    return "Deleted.";
  },
} satisfies CommandSpec<string>;
