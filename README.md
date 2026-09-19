# 🏗️ website-builder

> **Full-fledged CLI website builder.** Hybrid TypeScript + Python architecture. Initialize, build, deploy, and generate sites — all from one command.

---

## ⚡ What It Does

`website-builder` (alias `wb`) is a single-package CLI that combines a TypeScript command-layer with Python-powered build, AI generation, and deployment logic. It installs globally, boots its own `.venv` automatically, and works from any directory.

---

## 🚀 Instant Usage (Zero Install)

Run without installing anything:

```bash
npx website-builder-cli init my-site --template default
```

Install globally for daily use:

```bash
npm install -g website-builder-cli
wb --help
```

> **💡 Behind the scenes:** On first invocation the CLI detects `backend/requirements.txt`, creates an isolated `.venv` inside the package directory, runs `pip install`, and then spawns the Python click backend — all silently, so you never manage Python dependencies manually.

---

## 🛠️ Commands & Usage

| Command | Description | Example |
|---|---|---|
| `wb init [name]` | Initialize a new site | `wb init my-blog --template blog` |
| `wb build` | Build for production | `wb build --watch` |
| `wb dev` | Start dev server | `wb dev --port 3000 --open` |
| `wb deploy [target]` | Deploy to target | `wb deploy production --rollback 2` |
| `wb login` | Auth with provider | `wb login --provider github` |
| `wb logout` | Clear session | `wb logout --provider github` |
| `wb ai [prompt]` | AI site generation | `wb ai "landing page" --style modern` |
| `wb config [action]` | View / set config | `wb config --get api_key` |
| `wb templates [action]` | Manage templates | `wb templates list` |
| `wb doctor` | Validate environment | `wb doctor --json` |

### Quick Examples

```bash
# Initialize
wb init portfolio --template portfolio

# Build & watch
wb build --watch

# AI generation
wb ai "modern portfolio landing" --template default --style modern

# Check environment
wb doctor
```

---

## 🧠 Under The Hood

```text
TypeScript (cli/src/cli.ts)  →  Commander.js CLI orchestration
         ↓  (execa subprocess)
Python  (backend/backend/cli.py) → Click commands + FastAPI / build engine
         ↓  (auto .venv bootstrap)
.venv  (created dynamically on first run)
```

- **TypeScript layer:** Parses args, validates inputs, renders output, and calls `bridge/python.ts`.
- **Python layer:** Handles `build_engine`, `deploy_orchestrator`, `ai.generator`, auth, and templates via `click` groups.
- **Dynamic bootstrap:** `bridge/python.ts` uses `getPackageDir()` (`__dirname`-relative) to locate `backend/`, creates `.venv` if missing, installs requirements, and picks `python3` → `python` fallback for Windows compatibility.

---

## 🧑‍💻 Local Development & Contributing

```bash
# Clone
git clone <repo>
cd website-builder

# Install
npm install

# Compile TypeScript (ES2022 module)
npm run build

# Link globally for local testing
npm link
wb --help

# Test Python backend manually (from package dir)
python3 -m backend.cli --help
```

---

*Licensed under MIT · Built with TypeScript, Python, and zero manual dependency management.*
