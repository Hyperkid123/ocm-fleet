import { registerCommand } from "../../command";
import type { CommandEntry } from "../types";
import { createCommand } from "./create";
import { deleteCommand } from "./delete";
import { describeCommand } from "./describe";
import { getCommand } from "./get";
import { listCommand } from "./list";
import { queryCommand } from "./query";
import { typesCommand } from "./types";

export const resourceCommand: CommandEntry = {
  path: "resource",
  aliases: ["res"],
  description: "Manage addon-provided managed resources",
};

export const resourceCommands: CommandEntry[] = [
  registerCommand(typesCommand),
  registerCommand(describeCommand),
  registerCommand(createCommand),
  registerCommand(getCommand),
  registerCommand(listCommand),
  registerCommand(queryCommand),
  registerCommand(deleteCommand),
];
