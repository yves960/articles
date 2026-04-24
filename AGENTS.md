# Personal Knowledge Base Agent Guide

This repository is a personal knowledge base modeled after Andrej Karpathy's
"LLM writes the wiki, humans keep the raw sources" pattern.

## Operating Model

- Treat source material as immutable by default.
- Existing article files and article collections have been moved under `raw/`.
  Treat `raw/` as the source of truth unless the user explicitly asks to edit
  source material.
- Put synthesized, cross-linked, agent-maintained knowledge in `wiki/`.
- Put unprocessed captures, transcripts, copied excerpts, and notes in `raw/`
  or `inbox/`.
- Never invent citations. Every wiki claim that comes from a source should link
  back to a local source path or an external URL.
- Prefer small, incremental updates over broad rewrites.

## Update Workflow

1. Add new material to `inbox/` or `raw/`.
2. Read the relevant raw/source files.
3. Update or create the appropriate page under `wiki/topics/`.
4. Update `wiki/index.md` and `wiki/source-map.md` if discoverability changes.
5. Add a short entry to `wiki/log.md` with date, sources, and changed pages.

## Directory Contract

- `raw/`: immutable original material and imported existing articles.
- `inbox/`: temporary capture area before material is processed.
- `wiki/`: synthesized knowledge layer maintained by agents.
- `wiki/topics/`: durable topic pages.
- `wiki/templates/`: reusable note templates.
- Root `README.md` and `AGENTS.md`: knowledge base operating docs.
- `raw/ai-assisted-dev-specs/`: structured source material about AI-assisted
  development standards.
- `raw/ai-replacement-series/`: source article series.

## Writing Rules

- Write in Chinese unless the user asks otherwise.
- Keep wiki pages concise and navigable.
- Use stable Markdown links between related pages.
- Preserve original wording only in raw/source files; wiki pages should
  synthesize and cite.
- When uncertain, add an open question to `wiki/questions.md` instead of
  guessing.
