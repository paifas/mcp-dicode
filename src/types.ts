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
