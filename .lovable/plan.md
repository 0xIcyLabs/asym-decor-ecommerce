# Public repo security review + single admin

## What the review found

Two real leaks are still in the repository (verified by inspecting the committed file list):

1. **`.env` is committed.** It is listed in `.gitignore`, but it was already tracked before that rule was added, so git keeps tracking it. It contains your backend project reference and publishable key. The publishable key is browser-safe by design (row-level security still protects data), but it should not sit in a public repo — it identifies your project and can be abused for usage.
2. **An archived plan file leaks your details.** `.lovable/plan/make-the-repo-safe-for-a-public-github-release-2026-08-31.md` is committed and contains your real brand name, `asymdecor@gmail.com`, `rajashabi30@gmail.com`, your phone number and social handle.

Clean: `src/lib/store.ts` (all brand values come from env vars with neutral placeholders), all migration SQL (only `admin@example.com`), `.env.example` (placeholders only), and the rest of `src/`.

## Fixes

- Stop tracking `.env` (delete it from git while keeping the local file so the site keeps running). It stays git-ignored afterwards.
- Remove the committed `.lovable/plan/` archive and add `.lovable/` to `.gitignore` so future internal notes are never published.
- Add a short README security note: copy `.env.example` to `.env`, never commit `.env`.

## Admin allowlist

Reduce the allowlist to one admin. A migration will:

- delete the second email from `admin_emails`, keeping only `asymdecor@gmail.com`;
- remove that user's `admin` row from `user_roles` so the existing account drops to a normal customer.

The database was not reachable at review time (backend waking up), so the exact rows are re-checked before the migration runs.

## Important note about history

Removing these files fixes the current code, but the old versions remain in your GitHub commit history and are still viewable there. To be fully safe:

- Rotate the backend keys after the cleanup (I can do this), which makes the leaked key useless.
- Optionally, if the repo has no other contributors, the simplest full cleanup is to delete the GitHub repo and re-publish it fresh from the cleaned code so no history carries the old files.

## Technical details

| Item | Action |
| --- | --- |
| `.env` | `git rm --cached .env` equivalent (untrack, keep on disk) |
| `.lovable/plan/*.md` | delete from repo; add `.lovable/` to `.gitignore` |
| `README.md` | add "Environment & secrets" security note |
| `admin_emails` / `user_roles` | migration: keep one admin only |
