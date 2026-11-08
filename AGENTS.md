# AGENTS.md

Guidance for people and coding agents working in this repository.

## What this is

A static catalog of the BigQuery datasets of the Prefeitura do Rio, built with Astro and
served by nginx. The catalog data (`catalog.json`) is not versioned: it is downloaded
from a GCS bucket when the Docker image is built.

## Layout

```text
/
├── site/                  # Astro application (pages, components, scripts, styles)
│   ├── src/scripts/catalog.js   # reads ./catalog.json at build time
│   └── package.json       # npm scripts: dev, build (astro build + pagefind), check
├── nginx/nginx.conf       # nginx config of the runtime image (port 8080)
├── Dockerfile             # fetch catalog.json from GCS -> npm run build -> nginx
├── docker-compose.yaml    # local build with the GCP credentials as a build secret
├── k8s/kustomization.yaml # Kustomize + base-chart (Helm) manifests applied by Argo CD
└── .github/workflows/
    ├── check.yml          # pull request: cd site && npm ci && npm run check (astro check)
    ├── deploy.yaml        # push to master / daily cron: build and push the image to GHCR
    ├── manifests.yml      # pull request: render k8s/ with kubectl kustomize --enable-helm
    └── sast.yml           # pull request and push to master: SAST
```

## `master` is production

There is no staging branch. Merging into `master`:

- is picked up by Argo CD, which applies `k8s/` to the production cluster;
- runs `deploy.yaml` when it touches `site/`, `nginx/`, `Dockerfile` or the workflow,
  publishing `ghcr.io/prefeitura-rio/data-catalog:latest` and `:<sha>` (the Deployment
  uses `:latest` with `pullPolicy: Always`).

Keep changes small and revertible with `git revert` of the merge.

## Proving changes

There are no automated tests. Prove what you change:

- **Manifests (`k8s/`)**: render them with the base-chart through Helm (needs `kubectl`
  with Kustomize v5 and `helm` v3 on the `PATH`):

  ```bash
  kubectl kustomize --enable-helm k8s
  ```

  Compare the rendered output of `master` and of your branch, and keep the immutable
  Deployment selector, the Service selector and the Ingress name (see the patches in
  `k8s/kustomization.yaml`). Kustomize downloads the chart into `k8s/charts/`, which is
  ignored by git. The `manifests` workflow runs the same command on every pull request.
- **Site (`site/`)**:

  ```bash
  cd site && npm ci && npm run build
  ```

  The build reads `site/catalog.json` (ignored by git), the file the Dockerfile fetches
  from `gs://$GCS_BUCKET_NAME/catalog.json`; its content is a JSON-encoded string of the
  catalog object (`catalog.js` parses it twice). Without the bucket file, the build cannot
  be proved locally; `npm run check` type-checks the Astro code without it and must
  finish with 0 errors. The `check` workflow runs it on every pull request.
- **Whole image**: `docker compose build` (needs `./credentials.json`, a service account
  key with read access to the bucket; never commit it).

## Rules

- Never commit secrets, `credentials.json`, `.env` or real personal data.
- Secrets and variables of the workflows (`GCP_SERVICE_ACCOUNT_JSON`, `GCS_BUCKET_NAME`)
  are managed in the repository settings, not in code.
- Conventional Commits (`feat`, `fix`, `chore`, `docs`, `ci`...).
