import type { CommandSpec, RegisteredCommand } from "./commands/types";

/** Preserve each spec's data type before storing different commands together. */
export function registerCommand<Data>(
  spec: CommandSpec<Data>,
): RegisteredCommand {
  return {
    ...spec,
    withSpec: (visit) => visit(spec),
  };
}
