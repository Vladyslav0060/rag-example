import { google } from "@ai-sdk/google";

export const chatModel = google("gemini-3.5-flash-lite");
export const embeddingModel = google.embeddingModel("gemini-embedding-2");

export const embeddingOptions = {
  google: {
    outputDimensionality: 768,
  },
} as const;
