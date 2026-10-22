import { registerCommand } from "../../command";
import type { CommandEntry } from "../types";
import { enrollSigningCommand } from "./enroll-signing";
import { inspectTokenCommand } from "./inspect-token";
import { loginCommand } from "./login";
import { logoutCommand } from "./logout";
import { setupCommand } from "./setup";

export const authCommand: CommandEntry = {
  path: "auth",
  description: "Manage authentication",
};

export const authCommands: CommandEntry[] = [
  registerCommand(setupCommand),
  registerCommand(loginCommand),
  registerCommand(logoutCommand),
  registerCommand(inspectTokenCommand),
  registerCommand(enrollSigningCommand),
];
