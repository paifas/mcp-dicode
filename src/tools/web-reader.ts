import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ServerConfig } from "../config.js";
import { TavilySearchProvider, TavilyError } from "../providers/tavily/tavily-search.js";
import { formatExtractResponse } from "../utils/format.js";

const webReaderSchema = {
  urls: z.array(z.string()).min(1).max(20).describe("URLs to extract content from (1-20)"),
  extractDepth: z
    .enum(["basic", "advanced"])
    .optional()
    .describe(
      "Extraction depth: basic (1 credit per 5 URLs, returns raw page HTML as markdown including navigation and boilerplate) or advanced (2 credits per 5 URLs, extracts clean article content with navigation/ads/sidebar/footer stripped)",
    ),
  includeImages: z.boolean().optional().describe("Include extracted image URLs (default: false)"),
};

export function registerWebReaderTool(server: McpServer, config: ServerConfig) {
  const provider = new TavilySearchProvider(config.tavilyApiKey);

  server.tool(
    "web_read",
    "Extract clean content from web pages. Returns page text stripped of navigation, ads, and scripts. Supports up to 20 URLs per request.",
    webReaderSchema,
    async (params) => {
      try {
        const response = await provider.extract!({
          urls: params.urls,
          extractDepth: params.extractDepth,
          includeImages: params.includeImages,
        });

        const text = formatExtractResponse(response);
        return {
          content: [{ type: "text" as const, text }],
        };
      } catch (error) {
        if (error instanceof TavilyError) {
          return {
            content: [{ type: "text" as const, text: `Extract error: ${error.message}` }],
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
    },
  );
}
