import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ServerConfig } from "../config.js";
import { TavilyClient, TavilyError } from "../providers/tavily/tavily-client.js";

export function registerCreditBalanceTool(server: McpServer, config: ServerConfig) {
  const client = new TavilyClient(config.tavilyApiKey);

  server.tool("credit_balance", "Check your Tavily API credit balance.", {}, async () => {
    try {
      const usage = await client.getUsage();
      const keyPercent = usage.key.limit > 0 ? Math.round((usage.key.usage / usage.key.limit) * 100) : 0;
      const lines = [
        `API Key: ${usage.key.usage} / ${usage.key.limit} credits used (${keyPercent}%)`,
        `  search: ${usage.key.search_usage}, extract: ${usage.key.extract_usage}`,
        `Account (${usage.account.current_plan}): ${usage.account.plan_usage} / ${usage.account.plan_limit}`,
      ];

      if (usage.key.limit - usage.key.usage < 50) {
        lines.push("Credits running low. Consider topping up at https://tavily.com");
      }

      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    } catch (error) {
      if (error instanceof TavilyError) {
        return {
          content: [{ type: "text" as const, text: `Credit balance error: ${error.message}` }],
          isError: true,
        };
      }
      return {
        content: [
          {
            type: "text" as const,
            text: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  });
}
