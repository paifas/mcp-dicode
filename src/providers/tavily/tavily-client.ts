/** Tavily API error types */
export class TavilyError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "TavilyError";
  }
}

/** Raw Tavily search API response */
export interface TavilySearchResponse {
  query: string;
  answer?: string;
  results: {
    title: string;
    url: string;
    content: string;
    score: number;
  }[];
  response_time?: number;
}

/** Parameters for the Tavily search request body */
export interface TavilySearchParams {
  query: string;
  search_depth?: "advanced" | "basic" | "fast" | "ultra-fast";
  max_results?: number;
  topic?: "general" | "news" | "finance";
  time_range?: "day" | "week" | "month" | "year";
  start_date?: string;
  end_date?: string;
  include_answer?: boolean;
  include_domains?: string[];
  exclude_domains?: string[];
}

/**
 * Low-level HTTP client for the Tavily Search API.
 */
export class TavilyClient {
  private readonly baseUrl = "https://api.tavily.com";
  private readonly apiKey: string;
  private readonly timeout: number;

  constructor(apiKey: string, timeout = 30_000) {
    this.apiKey = apiKey;
    this.timeout = timeout;
  }

  async search(params: TavilySearchParams): Promise<TavilySearchResponse> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        if (response.status === 401) {
          throw new TavilyError(
            `Invalid Tavily API key. ${body}`,
            response.status,
          );
        }
        if (response.status === 429) {
          throw new TavilyError(
            `Tavily API rate limit exceeded. You may have used your monthly quota. ${body}`,
            response.status,
          );
        }
        throw new TavilyError(
          `Tavily API error (${response.status}): ${body}`,
          response.status,
        );
      }

      return (await response.json()) as TavilySearchResponse;
    } catch (error) {
      if (error instanceof TavilyError) throw error;
      if (error instanceof Error && error.name === "AbortError") {
        throw new TavilyError("Tavily API request timed out", 408);
      }
      throw new TavilyError(
        `Tavily API request failed: ${error instanceof Error ? error.message : String(error)}`,
        500,
      );
    } finally {
      clearTimeout(timer);
    }
  }
}
