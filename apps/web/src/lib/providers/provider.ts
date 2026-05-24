export interface AIProviderResult {
  summary: string;
  category: string;
  tags: string[];
  takeaways: string[];
  tone: string;
}

export interface AIProvider {
  name: string;
  process(title: string, description: string, text: string): Promise<AIProviderResult>;
}
