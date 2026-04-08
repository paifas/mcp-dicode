import type { SearchResponse } from "../types.js";

/**
 * Formats a SearchResponse into a markdown string suitable for MCP tool output.
 */
export function formatSearchResponse(response: SearchResponse): string {
  const parts: string[] = [];

  if (response.answer) {
    parts.push(response.answer);
    parts.push("");
  }

  for (let i = 0; i < response.results.length; i++) {
    const result = response.results[i];
    parts.push(`### ${i + 1}. [${result.title}](${result.url})`);
    parts.push(`> ${result.snippet}`);
    parts.push("");
  }

  if (response.responseTime != null) {
    parts.push(`*Response time: ${response.responseTime}ms*`);
    parts.push("");
  }

  parts.push("---");
  parts.push("");
  parts.push("Sources:");
  for (const result of response.results) {
    parts.push(`- [${result.title}](${result.url})`);
  }

  return parts.join("\n");
}
