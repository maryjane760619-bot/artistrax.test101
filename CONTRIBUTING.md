# Contributing to ARTISTRAX

Workflow guide for the team (Bert + Chris). The goal: never break `main`, never lose each other's work.

## The one rule

**Nobody commits directly to `main`.** All work goes through a branch and a pull request.

## Day-to-day workflow

### 1. Start from the latest main

```bash
git checkout main
git pull
```

Always do this before starting anything new — it's the #1 way to avoid conflicts.

### 2. Create a branch for your task

```bash
git checkout -b feature/short-description
```

Branch naming:
- `feature/...` — new functionality (e.g. `feature/dj-mix-player`)
- `fix/...` — bug fixes (e.g. `fix/cart-badge-count`)
- `chore/...` — cleanup, config, docs

### 3. Work and commit

Commit early and often with messages that say *what and why*:

```bash
git add <files>
git commit -m "Add BPM filter to releases page"
```

### 4. Push and open a PR

```bash
git push -u origin feature/short-description
```

Then open a pull request on GitHub against `main`. In the description, note:
- What changed
- How you tested it
- Anything that needs a DB migration or new env var (see below)

### 5. Review and merge

The other person gives it a quick look (even just a skim — the point is
two sets of eyes and no surprises). Merge with **"Squash and merge"** to
keep history clean. Delete the branch after merging.

### 6. Everyone pulls

After any merge, both of us run:

```bash
git checkout main && git pull
```

## Dividing work

Conflicts only happen when we edit the **same lines of the same file**.
To keep merges painless, claim an area before starting and drop a quick
message about what you're touching. Current rough ownership:

- **Bert:** store, checkout/Stripe, fan library, homepage
- **Chris:** events, promoter flows, ticketing

Not a hard wall — just say something first if you're crossing over.

## Things that don't live in git

Some changes require coordination outside the repo:

- **Supabase schema changes** (new tables/columns): put the SQL in your PR
  description. Whoever merges runs it in the Supabase SQL editor.
- **New env vars**: add them to Vercel (Settings → Environment Variables,
  scope: Production) *and* mention them in the PR. The app won't work for
  the other person locally without them.
- **Stripe settings** (webhooks, Connect accounts): note any dashboard
  changes in the PR description.

## Deploying

Deploys currently run from Bert's machine with `vercel --prod` — merging to
`main` on GitHub does **not** auto-deploy. Two rules:

1. Deploy only from an up-to-date `main` (`git pull` first).
2. Push to GitHub right after deploying, so GitHub always matches production.

## Gotchas specific to this app

- **Service worker caching**: the PWA service worker (`public/sw.js`)
  caches aggressively. If your change doesn't show up after a deploy, bump
  the cache version (`artistrax-v3` → `v4`) in `sw.js`.
- **Stripe test vs live**: we're on **test mode** keys. Test connected
  account: `acct_1T23nFKSY7M6vQDj`. Don't mix live-mode account IDs into
  test-mode code.
- **Type errors**: `next.config` has `ignoreBuildErrors: true` and there's
  a backlog of pre-existing type errors. Don't add new ones — run
  `npx tsc --noEmit` and make sure your files aren't in the output.
