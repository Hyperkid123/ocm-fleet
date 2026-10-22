import {
  listResourceTypes,
  type ReflectedResourceType,
} from "../../grpc/reflection";
import type { CommandSpec } from "../types";

export const typesCommand = {
  path: "resource types",
  description: "List available extension resource types",
  implemented: true,
  run: async ({ args }) => listResourceTypes(args),
  present: (types) => {
    if (types.length === 0) {
      return "No extension resource types available.";
    }
    return [
      "TYPE\tSINGULAR\tSERVICE",
      ...types.map(
        (type) =>
          `${type.qualifiedName}\t${type.singular}\t${type.serviceName}`,
      ),
    ].join("\n");
  },
} satisfies CommandSpec<ReflectedResourceType[]>;
