# Data Catalog

A web-based data catalog built with Astro for browsing and exploring dataset schemas from BigQuery.

## Project Structure

```text
/
├── Dockerfile             # Multi-stage Docker build with GCS integration
├── nginx/
│   └── nginx.conf         # Production nginx config with security headers
├── data-catalog/          # Main application directory
│   ├── public/
│   │   └── js/            # Client-side JavaScript
│   ├── src/
│   │   ├── components/    # Reusable Astro components
│   │   ├── layouts/       # Page layouts
│   │   ├── pages/         # Routes and pages
│   │   ├── styles/        # Global CSS
│   │   └── utils/         # Data processing utilities
│   ├── catalog.json       # Dataset definitions and schemas
│   └── package.json
└── .dockerignore          # Docker build optimization
```

## Features

- Browse available datasets with metadata
- View detailed table schemas and column information
- Search functionality for finding datasets
- Responsive design with mobile support
- Production-ready Docker deployment with nginx

## Docker Deployment

The application is containerized using Docker with nginx for optimal production performance.

### Building and Running with Docker

```bash
docker build -t data-catalog .

docker run -p 8080:8080 data-catalog

open http://localhost:8080
```

### Docker Architecture

The Dockerfile uses a multi-stage build:

1. **Build stage**: Compiles the Astro application using Node.js
2. **Runtime stage**: Serves static files using nginx:alpine for minimal footprint

### nginx Configuration

The nginx setup includes:

- **Auto worker processes**: Automatically scales to available CPU cores
- **Gzip compression**: Optimized asset delivery
- **SPA routing**: Proper handling of client-side routes
- **404 error pages**: Custom error handling
- **Static asset optimization**: Efficient serving of CSS, JS, and images

## How the Catalog is Updated

The data catalog uses a static JSON file (`catalog.json`) that contains all dataset definitions and table schemas. This file is processed at build time to generate the static site.

### Catalog Data Structure

The `catalog.json` file contains:

- **Dataset metadata**: Name, description, and creation timestamps
- **Table schemas**: Column names, data types, and descriptions
- **Nested structure**: Organized by organization/project hierarchy

### Update Process

1. **Data Source**: The catalog data originates from BigQuery information schema queries
2. **JSON Generation**: External scripts or processes generate the `catalog.json` file with current schema information
3. **Build Integration**: When the site is built (`npm run build`), the catalog data is processed and embedded into static pages
4. **Search Index**: The build process also generates a search index using Pagefind for client-side search functionality

### Updating the Catalog

To update the catalog with new or modified datasets:

1. Replace the `catalog.json` file with updated data
2. Run the build process: `npm run build`
3. Deploy the updated static site

Note: Since this is a static site, the catalog data is embedded at build time and does not update automatically.

## Development Commands

All commands are run from the `data-catalog/` directory:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Docker Deployment

The application includes a production-ready Docker setup with automatic catalog data fetching from Google Cloud Storage.

### Environment Variables

| Variable            | Default                 | Description                        |
| ------------------- | ----------------------- | ---------------------------------- |
| `GCS_BUCKET_NAME`   | `iplanrio-data-catalog` | GCS bucket containing catalog data |
| `CATALOG_FILE_PATH` | `catalog.json`          | Path to catalog file within bucket |

### CI/CD with GitHub Actions

The repository includes automated deployment pipeline in `.github/workflows/deploy.yml`:

- **Triggers**: Push to master branch + daily at 6 AM
- **Features**: Docker buildx, GitHub Container Registry, build caching
- **Security**: Uses Docker secrets for GCP credentials

Required secrets:

- `GOOGLE_CREDENTIALS_JSON` - Service account JSON key

The workflow automatically uses the repository's GitHub Container Registry (ghcr.io) with built-in `GITHUB_TOKEN` authentication.

### Production Features

- **Security headers**: CSP, X-Frame-Options, XSS protection
- **Asset caching**: 1-year cache for static assets
- **Compression**: Gzip enabled for all text content
- **SPA routing**: Proper fallback handling for single-page app behavior
