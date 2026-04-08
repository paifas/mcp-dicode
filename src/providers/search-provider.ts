import type { SearchResponse } from "../types.js";

/** Parameters common to all search providers */
export interface SearchParams {
  query: string;
  maxResults?: number;
  searchDepth?: "advanced" | "basic" | "fast" | "ultra-fast";
  topic?: "general" | "news" | "finance";
  timeRange?: "day" | "week" | "month" | "year";
  startDate?: string;
  endDate?: string;
  includeDomains?: string[];
  excludeDomains?: string[];
  includeAnswer?: boolean;
}

/**
 * Interface that every search provider must implement.
 * Tavily is the first; Brave, SearXNG, Google can follow.
 */
export interface SearchProvider {
  readonly name: string;
  search(params: SearchParams): Promise<SearchResponse>;
}
