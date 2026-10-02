import express from "express";
import { type Request, type Response } from "express";
import "dotenv/config";
import { ingestUrl } from "./rag/ingest.ts";
import { answerQuery } from "./rag/query.ts";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Minimal RAG API",
    endpoints: ["POST /embed", "POST /query"],
  });
});

app.post("/embed", async (req: Request, res: Response) => {
  const result = await ingestUrl(req.body.url);
  res.status(201).json(result);
});

app.post("/query", async (req: Request, res: Response) => {
  res.json(await answerQuery(req.body.query));
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
