# NodeAzure

A Node.js/Express web application demonstrating the capabilities of Azure Maps, showcasing various maps tools, layers, and functionalities.

## Overview

NodeAzure is a demo application built with Node.js and Express that provides an interactive showcase of Azure Maps features. The application displays mapping capabilities and demonstrates integration with Azure's mapping services.

## Features

- Interactive Azure Maps visualization
- Multiple map layers and tools
- Express.js backend for serving the application
- File upload functionality with multer
- CORS support for cross-origin requests
- Environment variable configuration with dotenv

## Tech Stack

- **Runtime:** Node.js
- **Backend Framework:** Express.js
- **HTTP Method Support:** CORS
- **File Handling:** Express-fileupload, Multer
- **Environment Config:** dotenv
- **UI Components:** Popper.js for positioning
- **Deployment:** Cloudflare Pages (via Wrangler)

## Prerequisites

- Node.js v10.15.3+
- npm or yarn package manager
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (`npm install -g wrangler`)
- A Cloudflare account
- An Azure Maps subscription key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/zack09holland/NodeAzure.git
cd NodeAzure
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables by creating a `.env` file in the root directory:
```env
AZURE_MAPS_KEY=your_azure_maps_subscription_key
```

## Running Locally

Start the Express development server:

```bash
npm start
```

The application will run on `http://localhost:8080`.

The server reads `AZURE_MAPS_KEY` from `.env` and serves it to the frontend via `/config.js` so the key never appears in source code.

## Deploying to Cloudflare Pages

### First-time setup

Authenticate with Cloudflare:
```bash
npx wrangler login
```

### Build

The build step copies `app/public` to `dist` and removes data files that exceed Cloudflare's 25 MiB per-file limit:

```bash
npm run build
```

### Deploy

```bash
npx wrangler pages deploy dist
```

### Windows one-liner (build + deploy)

```cmd
deploy.bat
```

### Cloudflare Git integration build config

If deploying via Cloudflare's automatic Git integration, set the following in the Pages dashboard under **Settings → Builds & deployments**:

| Field | Value |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler pages deploy dist` |
| Root directory | `/` |

## Project Structure

```
NodeAzure/
├── app/
│   └── public/          # Static frontend assets (HTML, CSS, JS, data)
│       ├── index.html
│       ├── css/
│       ├── js/
│       └── data/
├── app/routing/         # Express route definitions
├── dist/                # Build output (generated, not committed)
├── server.js            # Express server (local dev)
├── worker.js            # Cloudflare Worker (production)
├── wrangler.toml        # Wrangler configuration
├── build.sh             # Build script (populates dist/)
├── deploy.bat           # Windows build + deploy script
└── .env                 # Local secrets (not committed)
```

## Available Scripts

- `npm start` — Start the local Express server
- `npm run build` — Build `dist/` from `app/public/`

## Dependencies

- **express** (^4.16.3) - Web application framework
- **cors** (^2.8.5) - Cross-Origin Resource Sharing middleware
- **dotenv** (^8.2.0) - Environment variable management
- **express-fileupload** (^1.1.6) - File upload handling
- **multer** (^1.4.2) - Multipart form data handling
- **@popperjs/core** (^2.1.1) - Positioning library for tooltips/popovers
- **node-env-file** (^0.1.8) - Environment file parsing

## License

ISC

## Author

zack09holland

---

For more information about Azure Maps, visit the [Azure Maps Documentation](https://learn.microsoft.com/en-us/azure/azure-maps/).
