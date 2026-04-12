/**
 * Server-side logger with colored, structured output.
 * Zero dependencies — uses ANSI escape codes directly.
 *
 * Usage:
 *   import { log } from "@/app/lib/logger";
 *   log.info("server", "Request handled", { status: 200 });
 *   log.error("db", "Query failed", { table: "users" });
 */

const colors = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgGreen: "\x1b[42m",
} as const;

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_CONFIG: Record<
  LogLevel,
  { badge: string; color: string; fn: (...args: unknown[]) => void }
> = {
  debug: { badge: " DEBUG ", color: colors.gray, fn: console.debug },
  info: { badge: " INFO  ", color: colors.cyan, fn: console.log },
  warn: { badge: " WARN  ", color: colors.yellow, fn: console.warn },
  error: { badge: " ERROR ", color: colors.red, fn: console.error },
};

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").replace("Z", "");
}

function formatMeta(meta?: Record<string, unknown>): string {
  if (!meta || Object.keys(meta).length === 0) return "";
  const parts = Object.entries(meta).map(([k, v]) => {
    const val = typeof v === "string" ? v : JSON.stringify(v);
    return `${colors.dim}${k}${colors.reset}${colors.gray}=${colors.reset}${val}`;
  });
  return " " + parts.join(" ");
}

function formatScope(scope: string, color: string): string {
  return `${color}[${scope}]${colors.reset}`;
}

function write(
  level: LogLevel,
  scope: string,
  message: string,
  meta?: Record<string, unknown>,
) {
  const cfg = LEVEL_CONFIG[level];
  const ts = `${colors.dim}${timestamp()}${colors.reset}`;
  const badge = `${cfg.color}${colors.bold}${cfg.badge}${colors.reset}`;
  const scopeStr = formatScope(scope, cfg.color);
  const metaStr = formatMeta(meta);

  cfg.fn(`${ts} ${badge} ${scopeStr} ${message}${metaStr}`);
}

export const log = {
  debug: (
    scope: string,
    message: string,
    meta?: Record<string, unknown>,
  ) => write("debug", scope, message, meta),
  info: (scope: string, message: string, meta?: Record<string, unknown>) =>
    write("info", scope, message, meta),
  warn: (scope: string, message: string, meta?: Record<string, unknown>) =>
    write("warn", scope, message, meta),
  error: (
    scope: string,
    message: string,
    meta?: Record<string, unknown>,
  ) => write("error", scope, message, meta),
};
