import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getPackageVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(resolve(__dirname, "../package.json"), "utf-8"),
    );
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

export interface ServerConfig {
  tavilyApiKey: string;
  defaultMaxResults: number;
  defaultSearchDepth: "advanced" | "basic" | "fast" | "ultra-fast";
  serverName: string;
  serverVersion: string;
}

export function loadConfig(): ServerConfig {
  const tavilyApiKey = process.env.TAVILY_API_KEY;
  if (!tavilyApiKey) {
    throw new Error(
      "TAVILY_API_KEY environment variable is required. Get one at https://tavily.com",
    );
  }

  const defaultMaxResults = parseInt(
    process.env.DICODE_MAX_RESULTS ?? "5",
    10,
  );
  if (Number.isNaN(defaultMaxResults) || defaultMaxResults < 1) {
    throw new Error(
      `Invalid DICODE_MAX_RESULTS value: "${process.env.DICODE_MAX_RESULTS}". Must be a positive integer.`,
    );
  }
  const defaultSearchDepth = (process.env.DICODE_SEARCH_DEPTH ?? "basic") as
    | "advanced"
    | "basic"
    | "fast"
    | "ultra-fast";

  return {
    tavilyApiKey,
    defaultMaxResults,
    defaultSearchDepth,
    serverName: "mcp-dicode",
    serverVersion: getPackageVersion(),
  };
}
