import { registerCommand } from "../../command";
import type { CommandEntry } from "../types";
import { createCommand } from "./create";
import { deleteCommand } from "./delete";
import { getCommand } from "./get";
import { listCommand } from "./list";
import { resumeCommand } from "./resume";

export const deploymentCommand: CommandEntry = {
  path: "deployment",
  aliases: ["dep", "deployments"],
  description: "Manage deployments",
};

export const deploymentCommands: CommandEntry[] = [
  registerCommand(createCommand),
  registerCommand(getCommand),
  registerCommand(listCommand),
  registerCommand(resumeCommand),
  registerCommand(deleteCommand),
];
