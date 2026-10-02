import { index, integer, pgTable, serial, text, vector } from "drizzle-orm/pg-core";

export const chunks = pgTable(
  "chunks",
  {
    id: serial("id").primaryKey(),
    source: text("source").notNull(),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 768 }).notNull(),
  },
  (table) => [index("chunks_source_idx").on(table.source)],
);
