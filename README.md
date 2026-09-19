# Website Builder

A full-fledged CLI tool for building and deploying websites — powered by a TypeScript CLI interface and a Python backend for AI, authentication, and deployment.

## Quick Start

```bash
# Install (from project root)
npm run link

# Initialize a new project
wb init my-site

# Build for production
wb build

# Start dev server with HMR
wb dev

# Deploy
wb deploy --target local

# Generate a page with AI
wb ai "a landing page for my coffee shop"

# Authenticate
wb login
```

## Commands

| Command | Description |
|---------|-------------|
| `wb init [name]` | Scaffold a new website project |
| `wb build` | Build site for production |
| `wb dev` | Start dev server with hot reload |
| `wb deploy [target]` | Deploy to hosting target |
| `wb login` | Authenticate with provider |
| `wb logout` | Clear session |
| `wb ai [prompt]` | Generate page content with AI |
| `wb config` | View/set configuration |
| `wb templates` | List available templates |

## Architecture

- **TypeScript CLI** (`cli/`) — Terminal interface, command routing, dev server
- **Python Backend** (`backend/`) — Auth, AI, build engine, deploy providers
- **Shared** (`shared/`) — Config schemas and types

## Requirements

- Node.js 18+
- Python 3.10+

## Testing

### TypeScript Tests (CLI)

```bash
cd website-builder/cli
npm install
npm test           # runs Jest
```

### Python Tests (Backend)

```bash
cd website-builder/backend
python3 -m pip install -r requirements.txt
python3 -m pip install pytest pytest-asyncio httpx   # dev dependencies
python3 -m pytest tests/ -v
```
