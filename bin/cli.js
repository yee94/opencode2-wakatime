#!/usr/bin/env node

import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, unlink } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pluginDir = join(homedir(), ".config", "opencode", "plugins");
const legacyPlugin = join(
  homedir(),
  ".config",
  "opencode",
  "plugin",
  "wakatime.js",
);
const source = join(__dirname, "..", "dist", "bundle.js");
const target = join(pluginDir, "opencode2-wakatime.js");
const packageJson = join(__dirname, "..", "package.json");

async function getVersion() {
  const pkg = JSON.parse(await readFile(packageJson, "utf-8"));
  return pkg.version;
}

async function install() {
  const version = await getVersion();
  console.log(`Installing opencode2-wakatime v${version}...\n`);

  if (!existsSync(source)) {
    console.error(`Error: Built plugin not found at ${source}`);
    console.error("Run 'npm run build' first if installing from source.");
    process.exit(1);
  }

  await mkdir(pluginDir, { recursive: true });
  await copyFile(source, target);
  console.log(`Installed: ${target}`);

  if (existsSync(legacyPlugin)) {
    await unlink(legacyPlugin);
    console.log(`Removed legacy OpenCode 1 drop-in: ${legacyPlugin}`);
  }

  console.log("\nInstallation complete!");
  console.log("\nPreferred install for a published package:");
  console.log("  opencode plugin add opencode2-wakatime");
  console.log("\nOr add it to opencode.jsonc:");
  console.log('  "plugins": ["opencode2-wakatime"]');
  console.log("\nNext steps:");
  console.log("1. Add your WakaTime API key to ~/.wakatime.cfg:");
  console.log("   [settings]");
  console.log("   api_key = your-api-key-here");
  console.log(
    "\n2. Get your API key at: https://wakatime.com/settings/api-key",
  );
}

async function uninstall() {
  console.log("Uninstalling opencode2-wakatime...\n");

  if (!existsSync(target)) {
    console.log("Plugin not found, nothing to uninstall.");
    return;
  }

  await unlink(target);
  console.log(`Removed: ${target}`);
  console.log("\nUninstall complete!");
  console.log(
    "\nTo fully remove, also run: npm uninstall -g opencode2-wakatime",
  );
  console.log("Or: opencode plugin remove opencode2-wakatime");
}

function showHelp(version) {
  console.log(`opencode2-wakatime v${version}

Usage: opencode2-wakatime [options]

Options:
  --install    Install/update the plugin to ~/.config/opencode/plugins/
  --uninstall  Remove the plugin
  --help, -h   Show this help message

Examples:
  npm i -g opencode2-wakatime && opencode2-wakatime --install
  opencode plugin add opencode2-wakatime
`);
}

async function main() {
  const version = await getVersion();
  const arg = process.argv[2];

  switch (arg) {
    case "--install":
      await install();
      break;
    case "--uninstall":
      await uninstall();
      break;
    case "--help":
    case "-h":
    case undefined:
      showHelp(version);
      break;
    default:
      console.error(`Unknown option: ${arg}\n`);
      showHelp(version);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
