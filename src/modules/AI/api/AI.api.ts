export interface AIApi {
  chatWithSystemAndUserPrompt(system: string, user: string): Promise<string>;

  createEmbedding(text: string): Promise<number[]>;
}