# Minimal RAG with Gemini, LangChain, Drizzle and pgvector

## Setup

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:migrate
npm start
```

Create a Gemini API key in Google AI Studio and put it in `.env` as
`GOOGLE_GENERATIVE_AI_API_KEY`.

## Index a page

```bash
curl -X POST http://localhost:3000/embed \
  -H 'content-type: application/json' \
  -d '{"url":"https://www.inboxpurge.com/faq"}'
```

## Ask a question

```bash
curl -X POST http://localhost:3000/query \
  -H 'content-type: application/json' \
  -d '{"query":"What does InboxPurge do?"}'
```

LangChain loads and splits the page. Vercel AI SDK calls
`gemini-embedding-2` for 768-dimensional embeddings and
`gemini-3.5-flash-lite` for the final answer. Drizzle stores and searches the
chunks directly in local PostgreSQL with pgvector.
# rag-example
