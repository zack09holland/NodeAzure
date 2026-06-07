Quick Cloudflare Pages deployment guide

- Publish directory: `app/public`
- No build command required (site already static). Configure Pages to use `app/public` as the publish directory.

Options to deploy:

1) Cloudflare Pages (recommended via dashboard)
   - In the Pages dashboard, "Create a project" and connect your Git repo.
   - Set the "Build command" to blank and "Build output directory" (publish) to `app/public`.
   - Deploy — Pages will publish your static files.

2) CLI publish using Wrangler (one-off or CI)
   - Install Wrangler: `npm install -g @cloudflare/wrangler@2`
   - Authenticate: create a Cloudflare API token with `Account > Pages > Edit` rights and set `CF_API_TOKEN` env var.
   - Publish: `wrangler pages publish app/public --project-name <PROJECT_NAME>`

Notes and required changes:
- The current `server.js` provides Express endpoints (notably `/upload`). Cloudflare Pages is static: server endpoints will not run. If you rely on `/upload`, you must:
  - Replace the upload backend with Cloudflare Workers + R2, or
  - Use a third-party API (S3, Firebase Storage, etc.) for uploads, or
  - Host uploads on a separate server and call it from the static site.

- All site assets in `app/public` use relative paths (e.g., `css/style.css`, `data/...`), which is compatible with Pages so long as you set the publish directory to `app/public`.

Optional: Automated deploy via GitHub Actions
- If you want CI deploy instead of Pages' Git integration, I can add a GitHub Actions workflow that runs `wrangler pages publish` on push. Tell me if you want that and I will add it.

Next steps I can do for you:
- Add a `wrangler`-based GitHub Actions workflow to auto-publish on push.
- Migrate `/upload` to Workers + R2 or implement a third-party upload flow.
- Create a minimal `README` update and a short checklist for enabling SPA fallback if you use client-side routing.

File created: CLOUDFLARE_PAGES.md
