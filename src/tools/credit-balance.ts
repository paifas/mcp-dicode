import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ServerConfig } from "../config.js";
import { TavilyClient, TavilyError } from "../providers/tavily/tavily-client.js";

export function registerCreditBalanceTool(server: McpServer, config: ServerConfig) {
  const client = new TavilyClient(config.tavilyApiKey);

  server.tool("credit_balance", "Check your Tavily API credit balance.", {}, async () => {
    try {
      const balance = await client.getCreditBalance();
      const percentUsed = balance.max_credits > 0 ? Math.round((balance.used_credits / balance.max_credits) * 100) : 0;
      const text = [`Credit Balance: ${balance.available_credits} / ${balance.max_credits} (${percentUsed}% used)`];
      if (balance.available_credits < 50) {
        text.push("⚠ Credits running low. Consider topping up at https://tavily.com");
      }
      return { content: [{ type: "text" as const, text: text.join("\n") }] };
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
