import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { embedMany } from "ai";
import { eq } from "drizzle-orm";
import { db } from "../db/client.ts";
import { chunks } from "../db/schema.ts";
import { embeddingModel, embeddingOptions } from "./models.ts";

export async function ingestUrl(source: string) {
  const documents = await new CheerioWebBaseLoader(source).load();
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splitDocuments = await splitter.splitDocuments(documents);
  const contents = splitDocuments.map(({ pageContent }) =>
    pageContent.replaceAll("\n", " ").replaceAll(/\s+/g, " ").trim(),
  ).filter(Boolean);

  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: contents,
    providerOptions: {
      ...embeddingOptions,
      google: {
        ...embeddingOptions.google,
        taskType: "RETRIEVAL_DOCUMENT",
      },
    },
  });

  await db.transaction(async (tx) => {
    await tx.delete(chunks).where(eq(chunks.source, source));
    await tx.insert(chunks).values(
      contents.map((content, chunkIndex) => ({
        source,
        chunkIndex,
        content,
        embedding: embeddings[chunkIndex],
      })),
    );
  });

  return { source, chunks: contents.length };
}
