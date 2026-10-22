import { performance } from "node:perf_hooks";

import { executeCommand, print, printView } from "./app";
import { hasFlag, outputFormat, parseArgs } from "./argv";
import { helpText } from "./commands/help";
import { commandEntries, findCommand } from "./commands/registry";
import { Output } from "./ui";

const startedAt = performance.now();
const debugEnabled =
  process.env.DEBUG === "true" ||
  process.env.DEBUG === "1" ||
  process.argv.includes("--debug");

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const commandPath = args.command.join(" ");
  if (
    hasFlag(args, "help") ||
    !commandPath ||
    commandEntries.some(
      (item) =>
        item.path === commandPath &&
        !item.implemented &&
        !item.path.includes(" "),
    )
  ) {
    await printView(<Output data={helpText(commandPath || undefined)} />);
    return;
  }

  const command = findCommand(args.command);
  if (!command) throw new Error(`Unknown command.\n\n${helpText()}`);
  if (!command.implemented)
    throw new Error(`${command.path} is not implemented yet.`);
  const output = outputFormat(args);
  await print(
    await command.withSpec((spec) => executeCommand(spec, { args }, output)),
  );
}

main()
  .catch(async (error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  })
  .finally(() => {
    if (!debugEnabled) return;
    const elapsedMilliseconds = performance.now() - startedAt;
    process.stderr.write(
      `[debug] fleetctl completed in ${elapsedMilliseconds.toFixed(1)} ms\n`,
    );
  });
