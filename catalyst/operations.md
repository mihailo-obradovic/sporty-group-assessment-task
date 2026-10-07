# Operations Runbook

How to run what is already built. Rules and contracts live in `architecture.md` and the decision records; this file holds commands, procedures, and quirks only.

**Status:** one component, the Vercel project `obradovic-co/sporty-group-assessment-task`, serving a static build. It holds no data of its own: the app reads TheSportsDB from the browser, so there is nothing to back up or restore. Production is `https://sporty-group-assessment-task.vercel.app`. The rollback drill below has never been performed.

## Vercel (static hosting)

Every push to GitHub builds through the Git integration: `master` deploys to production, every other branch to a preview. The build command is `pnpm generate`, set in `vercel.json`. On Vercel's builders Nitro selects its `vercel-static` preset and writes the Build Output API directory itself, so the project has no output-directory setting. Project settings outside the repository: framework preset `nuxtjs`, Node `24.x`, and `ENABLE_EXPERIMENTAL_COREPACK=1` (Production and Preview). The Node setting is inert; see Quirks.

### Operate

```bash
vercel ls sporty-group-assessment-task --scope obradovic-co        # recent deployments, status, target
vercel inspect <deployment-url> --scope obradovic-co               # build details for one deployment
vercel inspect <deployment-url> --logs --scope obradovic-co        # its build log
vercel env ls --scope obradovic-co                                 # project environment variables
```

### Recovery

Nothing here holds state, so recovery is a rollback: point production back at an earlier good deployment.

```bash
vercel rollback --scope obradovic-co                               # back to the previous production deployment, no rebuild
vercel promote <deployment-url> --scope obradovic-co               # make any existing deployment production, no rebuild
vercel rollback status sporty-group-assessment-task --scope obradovic-co
```

The team is on the Hobby plan, where a rollback reaches only the previous production deployment; rolling back to an older one by URL needs Pro. To go further back, promote the older deployment instead. The surest fix is still a revert commit on `master`, which rebuilds through the normal path. Last performed: never.

### Quirks

- **The project's first deployment went to production from a branch.** With `productionBranch` already `master`, the first push of `decision/002-bootstrap-nuxt-skeleton` was assigned the production domains, apparently because no production deployment existed yet. Later branch pushes are previews.
- **pnpm comes from Corepack, not from the lockfile.** Without `ENABLE_EXPERIMENTAL_COREPACK=1` Vercel picks pnpm by `lockfileVersion` and ignores the `packageManager` pin.
- **Vercel's Node comes from `engines`, not from the project setting.** `engines.node` overrides the project's Node version, and `>=24` resolves to the newest major Vercel offers: 24 today, the next major as soon as Vercel adds it, while dev and CI stay on the `mise.toml` pin. Every build log warns about this. The project setting also says `24.x`, but it has no effect while `engines` is present.
- **`vercel link` writes outside `.vercel/`.** It creates `.env.local` holding a `VERCEL_OIDC_TOKEN` and appends `.env*` to `.gitignore`, which also ignores `.env.example`. Delete the file and drop that line after linking.
- **The project was created with the Vercel CLI.** The Vercel MCP server's create call was refused with a 403 for this team.
- **Preview URLs need a Vercel login; production does not.** The team's default Vercel Authentication (`ssoProtection: all_except_custom_domains`) sends anonymous visitors of a preview to a Vercel sign-in. `sporty-group-assessment-task.vercel.app` answers anonymously. A reviewer link is the production URL. Browser checks of a preview run in a browser signed in to the team.
