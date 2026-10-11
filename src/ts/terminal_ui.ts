// ==============================================================================
// Terminal UI & Aesthetics Formatting Engine (using NPM `colorette`)
// ==============================================================================

import { green, red, cyan, yellow, bold, magenta, gray, blue } from "colorette";

/**
 * Renders a stylized colored status badge.
 */
export function badge(label: string, color: string): string {
  switch (color.toLowerCase()) {
    case "green":
      return green(bold(`[✓ ${label}]`));
    case "red":
      return red(bold(`[✕ ${label}]`));
    case "yellow":
      return yellow(bold(`[! ${label}]`));
    case "cyan":
      return cyan(bold(`[◈ ${label}]`));
    case "magenta":
      return magenta(bold(`[★ ${label}]`));
    default:
      return blue(bold(`[• ${label}]`));
  }
}

/**
 * Renders a sleek section header banner.
 */
export function header(title: string): string {
  const line = gray("━".repeat(60));
  return `${line}\n${cyan(bold(`▶ ${title}`))}\n${line}`;
}

/**
 * Formats a key-value metric line with tabular alignment.
 */
export function formatRow(key: string, value: string): string {
  const paddedKey = key.padEnd(28, " ");
  return `  ${gray("•")} ${paddedKey} : ${bold(value)}`;
}

/**
 * Renders an operation success notification box.
 */
export function successBanner(msg: string): string {
  return green(bold(`  ✔ SUCCESS: ${msg}`));
}

/**
 * Renders an operation warning/error notification box.
 */
export function errorBanner(msg: string): string {
  return red(bold(`  ✖ ERROR: ${msg}`));
}

/**
 * Returns a divider line.
 */
export function divider(): string {
  return gray("─".repeat(60));
}
