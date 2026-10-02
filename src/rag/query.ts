import { embed, generateText } from "ai";
import { cosineDistance, sql } from "drizzle-orm";
import { db } from "../db/client.ts";
import { chunks } from "../db/schema.ts";
import { chatModel, embeddingModel, embeddingOptions } from "./models.ts";

export async function answerQuery(query: string) {
  const { embedding } = await embed({
    model: embeddingModel,
    value: query,
    providerOptions: {
      ...embeddingOptions,
      google: {
        ...embeddingOptions.google,
        taskType: "RETRIEVAL_QUERY",
      },
    },
  });

  const distance = cosineDistance(chunks.embedding, embedding);
  const matches = await db
    .select({
      source: chunks.source,
      chunkIndex: chunks.chunkIndex,
      content: chunks.content,
      similarity: sql<number>`1 - (${distance})`,
    })
    .from(chunks)
    .orderBy(distance)
    .limit(4);

  const context = matches
    .map((match, index) => `[${index + 1}] ${match.content}`)
    .join("\n\n");

  const { text } = await generateText({
    model: chatModel,
    system:
      "Answer only from the supplied context. If the answer is not in the context, say that you do not know. Keep the answer concise and cite context sections like [1].",
    prompt: `Context:\n${context}\n\nQuestion: ${query}`,
  });

  return {
    answer: text,
    sources: matches.map(({ source, chunkIndex, similarity }) => ({
      source,
      chunkIndex,
      similarity,
    })),
  };
}
