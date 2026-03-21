import { GoogleGenAI } from "@google/genai";

/**
 * Generates an answer using the Gemini API based on the provided question and textbook context.
 *
 * @param question The user's question
 * @param context Top relevant chunks extracted from the PDF
 * @param apiKey The user's Gemini API key
 * @returns The generated response text
 */
export async function generateAnswer(
  question: string,
  context: string[],
  apiKey: string,
): Promise<string> {
  const genAI = new GoogleGenAI({ apiKey });

  const prompt = `
    You are a helpful AI tutor. You are provided with specific context from a user's textbook.
    Use ONLY the provided context to answer the question. If the answer is not in the context, say that you don't know based on the textbook.
    
    TEXTBOOK CONTEXT:
    ${context.join("\n\n---\n\n")}
    
    USER QUESTION:
    ${question}
    
    ANSWER:
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text =
      (
        response as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        }
      )?.candidates?.[0]?.content?.parts?.[0]?.text ||
      (response as { text?: string }).text;

    if (!text) {
      console.error("Unexpected response structure:", response);
      throw new Error("No response from Gemini");
    }

    return text;
  } catch (error) {
    console.error("Gemini API Error details:", error);

    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      typeof error.response === "object" &&
      error !== null
    ) {
      const actualErrorResponse = (
        error as { response: { text?: () => Promise<string> } }
      ).response;

      if (typeof actualErrorResponse.text === "function") {
        try {
          const errorDetails = await actualErrorResponse.text();
          throw new Error(`Gemini API Failed: ${errorDetails}`);
        } catch {
          throw new Error(
            "Gemini API call failed with a non-readable response body.",
          );
        }
      } else {
        console.error(
          "Non-standard error response object:",
          actualErrorResponse,
        );
        throw new Error(
          "Failed to generate answer from Gemini: Non-standard error response.",
        );
      }
    }

    throw new Error(
      error instanceof Error
        ? error.message
        : "An unknown error occurred while communicating with Gemini.",
    );
  }
}
