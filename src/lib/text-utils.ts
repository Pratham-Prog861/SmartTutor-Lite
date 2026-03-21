/**
 * Splits text into chunks of approximately 300-500 words.
 * @param text The full text to chunk
 * @returns An array of text chunks
 */
export function chunkText(text: string): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  const chunkSize = 400; // Target middle of 300-500 range
  const overlap = 50; // Add small overlap between chunks for context continuity

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim()) {
      chunks.push(chunk);
    }
  }

  return chunks;
}

/**
 * Returns the top 2-3 most relevant chunks based on a question.
 * Uses a simple keyword-matching (word overlap) algorithm.
 */
export function getRelevantChunks(
  question: string,
  chunks: string[],
): string[] {
  const questionWords = question
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2);

  const scoredChunks = chunks.map((chunk) => {
    const chunkWords = chunk.toLowerCase().split(/\W+/);
    let score = 0;

    questionWords.forEach((word) => {
      if (chunkWords.includes(word)) {
        score += 1;
      }
    });

    return { chunk, score };
  });

  // Sort by score descending and take top 3
  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.chunk);
}
