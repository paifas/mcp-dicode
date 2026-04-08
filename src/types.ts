/** Normalized search result from any provider */
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  score?: number;
}

/** Normalized search response */
export interface SearchResponse {
  query: string;
  answer?: string;
  results: SearchResult[];
  responseTime?: number;
}

/** Normalized extract result */
export interface ExtractResult {
  url: string;
  content: string;
  images?: string[];
}

/** Normalized extract response */
export interface ExtractResponse {
  results: ExtractResult[];
  failedResults: { url: string; error: string }[];
  responseTime?: number;
}
