export interface CompletionResult {
  completions: string[];
  prefix: string;
}

export interface CommandSuggestion {
  command: string;
  description?: string;
  score: number;
}