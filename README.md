# Rikwestor

A fast, fully-client-side, modern web application for testing HTTP APIs. Built with React and structured with resizable panes to give you an advanced coding environment feel right in your browser.

![Rikwestor Logo](./public/logo.svg)

## ✨ Core Features

* **Advanced Request Builder**: Construct GET, POST, PUT, PATCH, and DELETE requests.
* **Environment Variables**: Dynamically manage base URLs, authorization tokens, and API keys. Use `{{variable}}` syntax across URLs, headers, and request bodies.
* **Request History**: Your past API calls are saved automatically. Easily load, replay, or delete them from the history pane.
* **Dynamic Configuration**: Configure query params and headers using interactive tables, and insert raw JSON request bodies with syntax highlighting.
* **Smart Response Formatting**: The Response pane intelligently highlights JSON payloads while clearly presenting status codes, response times, and sizes.
* **Modern Developer UI**: 
  * Three-pane resizable layout inspired by professional IDEs.
  * Custom `Roboto Mono` typography.
  * Native Dark mode and Light mode toggles.

---

## 🚀 Running Locally with Docker

This project is fully containerized for easy local development without needing Node or NPM installed on your host machine.

### Prerequisites
* Docker
* Docker Compose

### 1. Start the Application
Run the following command in the root directory:

```bash
docker compose up --build -d
```

### 2. Access the Application
Once the container is running and Nginx is serving the built files, open your web browser and navigate to:

👉 **http://localhost:8080**

### 3. Stop the Application
To shut down the local server, run:

```bash
docker compose down
```

---

## 🌍 Deployment

You can deploy this application as a static website anywhere, but we have included scripts specifically designed to auto-publish to GitHub Pages.

### Method 1: GitHub Actions (Automated)

This repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys the application to GitHub Pages whenever you push to the `main` branch.

**To enable this:**
1. Push your code to a GitHub repository.
2. Go to your repository **Settings** > **Pages**.
3. Change the **Source** to **GitHub Actions**.
4. Future pushes to `main` will automatically build and publish to `https://<your-username>.github.io/<repository-name>/`.

### Method 2: Manual Deployment via Docker (gh-pages)

If you don't want to use GitHub Actions and prefer manually triggering `gh-pages` deployments, you can do so directly using Docker if you lack local dependencies:

```bash
docker run --rm -v "$PWD:/app" -w /app \
  -v "$HOME/.ssh:/root/.ssh:ro" \
  -v "$HOME/.gitconfig:/root/.gitconfig:ro" \
  node:20-alpine \
  sh -c "apk add --no-cache git openssh-client && npm run deploy"
```

*Note: The command mounts your local SSH keys and Git config into a temporary container so that it has permission to compile the code and push the built `dist` folder to the `gh-pages` branch on your GitHub repository.*

After the command completes successfully, make sure your GitHub repository settings under **Settings > Pages** are configured to serve from the `gh-pages` branch.
