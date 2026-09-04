# Thread Lab (threadMap)

An experimental “thread map” chat UI where each conversation becomes a tree.

Instead of a single linear chat, every reply creates a new node in the thread. If you reply to an earlier message (or create multiple replies from the same parent), the app automatically creates a branched AI session so each branch can continue with its own context.

## What it does

- **Start multiple threads** from the homepage.
- **See each thread as a tree** (a root prompt with child replies and assistant responses).
- **Branch safely**: once a node has multiple children, new replies from that node get a fresh session built from the node’s ancestry.
- **Stream AI responses** into the UI (token-by-token).
- **Persist state** in the browser via `zustand/persist` (stored under the `threadmap-v1` localStorage key).

## Tech stack

- Next.js (App Router)
- React
- Tailwind CSS
- Zustand (state + persistence)
- Vercel AI SDK + OpenAI models (server routes)

## Local setup

### 1) Install dependencies

This repo includes a `pnpm-lock.yaml`, so `pnpm` is recommended:

```bash
pnpm install
```

### 2) Add environment variables

Create a `.env.local` in the project root:

```bash
OPENAI_API_KEY=your_key_here
```

### 3) Run the dev server

```bash
pnpm dev
```

Open http://localhost:3001

## How it works (high level)

- The page renders `components/App.tsx`, which creates new thread roots and displays a `ThreadPanel` per thread.
- State lives in `store/ThreadStore.tsx`:
	- `threads`: list of root node ids
	- `nodes`: message graph (`id`, `role`, `text`, `parentId`, `children`, `sessionId`, `isExpanded`)
	- `sessions`: chat histories keyed by session id (`{ role, content }[]`)
- When you reply to a node:
	- a user node is added under that parent
	- the app chooses a session id:
		- if the parent has no prior children → reuse the parent session
		- if the parent already has children → build a new session from the parent’s ancestry and continue on a fresh branch
	- an assistant node is created and updated as text streams in

## API routes

- `POST /api/chat`
	- Streams text responses using the Vercel AI SDK (`streamText`).
	- Used by the UI for token streaming.
- `POST /api/generate`
	- Returns a full JSON response (`{ text }`).
	- Present as an alternative non-streaming endpoint.

## Development notes

- A `DevControls` panel is shown only in development (`NODE_ENV=development`).
- To wipe local persisted state, use the UI reset (or remove `threadmap-v1` from localStorage).

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## Deployment

The app deploys to Vercel through GitHub Actions because its Next.js API routes
need a server runtime and cannot run on GitHub Pages.

- A push to `devBranch` creates a production deployment.
- A pull request targeting `devBranch` creates a preview deployment when the
  branch belongs to this repository.
- The workflow can also be started manually from the repository's **Actions**
  tab.

The workflow requires these GitHub Actions repository secrets:

- `VERCEL_TOKEN`: a dedicated Vercel token for this deployment workflow.
- `VERCEL_ORG_ID`: the Vercel account/team ID from `.vercel/project.json`.
- `VERCEL_PROJECT_ID`: the Vercel project ID from `.vercel/project.json`.

`OPENAI_API_KEY` must be configured as a sensitive environment variable in the
Vercel project for both production and preview deployments. Keep all of these
values out of the repository.
