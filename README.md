
# CLI-X

CLI-X is an AI-native CLI development agent for website projects.

## Vision

CLI-X helps a developer describe an idea, plan a stack, generate a real project, run it locally, validate it, repair failures, and continue iterating with persistent project memory and chat.

## Architecture

The core runtime is TypeScript + Node.js.

- CLI layer: command parsing, UX, status, errors, and prompts
- Application layer: project, session, config, build, and deployment management
- Agent layer: WebsiteAgent boundary for future Strands integration
- Model layer: provider and router interfaces for cloud, local, and future providers
- Tools layer: filesystem, shell, package, validation, Git, and deployment interfaces
- Project layer: state, memory, chat persistence, and dependency handling
- Validation layer: build/test/lint/runtime check interfaces
- Deployment layer: local and cloud deployment placeholders

## Commands

- cli-x create [name]
- cli-x chat [message]
- cli-x build
- cli-x run
- cli-x deploy [target]
- cli-x config
- cli-x doctor

## Current status

This repository is in an architectural migration phase. The core system is now TypeScript-only and no longer depends on the older Python/FastAPI backend for local CLI operation.

The current implementation intentionally uses placeholder interfaces and explicit "not implemented yet" boundaries for advanced features such as Strands execution, model providers, and deployment systems.

## Strands integration

The project includes a WebsiteAgent interface and architecture boundaries for Strands integration. Full model execution remains a future implementation.

## Project memory

Project memory is represented by a dedicated project memory structure for future local memory persistence.

## Validation

Validation architecture is present through interfaces and managers that can evolve into build/test/lint/runtime repair loops.

## Roadmap

- Real Strands agent execution
- Model provider implementations
- Filesystem and shell tooling with safety checks
- Persistent JSONL project chat
- Dev server, port conflict, and error repair loop
- Deployment providers

  ↓
Modify only what is necessary
  ↓
Validate
```

It should not rewrite the entire project unnecessarily.

---

## 4. The agent must validate its own work

Generation is not considered complete when files are written.

A task is complete only after the project has been validated.

```text
Generate
  ↓
Build
  ↓
Test
  ↓
Check
  ↓
Repair if necessary
```

---

# What CLI-X Does

CLI-X will support two major modes.

## Create Mode

Start a new website from an idea.

```bash
wb create
```

Example:

```text
Build a SaaS dashboard for university students.

It should allow students to:
- track assignments
- view upcoming exams
- manage deadlines
- see productivity statistics

Use a modern dark UI with responsive design.
```

CLI-X will:

```text
Understand requirements
        ↓
Recommend architecture
        ↓
Recommend technology
        ↓
Design UI
        ↓
Create project
        ↓
Generate files
        ↓
Install dependencies
        ↓
Run project
        ↓
Validate
        ↓
Repair
        ↓
Start development server
```

---

# Edit Mode

Existing projects can be modified using natural language.

```bash
wb chat
```

Example:

```text
You:
Add Google authentication.

CLI-X:
I'll inspect the current routing and application structure
before implementing authentication.

[Agent working...]

✓ Project inspected
✓ Authentication architecture planned
✓ Dependencies installed
✓ Authentication implemented
✓ Build successful
```

Then:

```text
You:
Make the dashboard dark and add animations.

CLI-X:
...
```

The agent understands the existing project instead of generating a completely new one.

---

# Architecture

CLI-X is divided into several logical layers.

```text
                         USER
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    1. CLI LAYER                            │
│                                                             │
│  create | chat | edit | build | dev | deploy | config      │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                 2. APPLICATION LAYER                       │
│                                                             │
│  Agent Manager                                              │
│  Project Manager                                            │
│  Session Manager                                            │
│  Build Manager                                              │
│  Deployment Manager                                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    3. AGENT LAYER                           │
│                                                             │
│                  Strands Agents SDK                         │
│                                                             │
│  Website Agent                                              │
│  ├── Planner                                                │
│  ├── Builder                                                │
│  ├── Reviewer                                               │
│  └── Repair Loop                                            │
└───────────────┬──────────────────────────┬──────────────────┘
                │                          │
                ▼                          ▼
┌──────────────────────────┐   ┌──────────────────────────────┐
│ 4. MODEL LAYER           │   │ 5. TOOL LAYER                │
│                          │   │                              │
│ Model Gateway            │   │ Filesystem                   │
│ Model Router             │   │ Shell                        │
│ Provider Adapters        │   │ Package Manager              │
│                          │   │ Build                         │
│ ┌──────────────────────┐ │   │ Test                          │
│ │ CLI-X Cloud          │ │   │ Lint                          │
│ │ Bedrock              │ │   │ Type Check                    │
│ │ OpenAI               │ │   │ Project State                 │
│ │ Anthropic            │ │   │ Deployment                    │
│ │ Google               │ │   │                              │
│ └──────────────────────┘ │   └──────────────┬───────────────┘
└──────────────────────────┘                  │
                                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 6. PROJECT ENGINE                          │
│                                                             │
│ Filesystem | Dependencies | Project State | Project Memory  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                 7. VALIDATION ENGINE                        │
│                                                             │
│ TypeCheck | Build | Test | Lint | Runtime                   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ Errors
                             ▼
                       STRANDS AGENT
                             │
                       Diagnose + Fix
                             │
                             └──────────► Validate again
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 8. DEPLOYMENT LAYER                         │
│                                                             │
│ Local | AWS Amplify | Future Deployment Providers           │
└─────────────────────────────────────────────────────────────┘
```

---

# Architecture Layers

## Layer 1 — CLI

The CLI is the user interface.

It should remain thin.

Responsibilities:

* command parsing
* flags
* prompts
* terminal UI
* progress display
* errors
* output formatting

The CLI should not directly communicate with AI providers.

Example:

```text
CLI
 ↓
Application Service
 ↓
Agent
```

Not:

```text
CLI
 ↓
OpenAI
```

---

# Layer 2 — Application Layer

The application layer coordinates the system.

Responsibilities:

* lifecycle management
* project creation
* project editing
* agent execution
* session management
* build management
* validation
* deployment
* configuration

Main components:

```text
AgentManager
ProjectManager
SessionManager
BuildManager
DeploymentManager
ConfigurationManager
```

---

# Layer 3 — Agent Layer

This is the intelligence layer.

CLI-X will use the **Strands Agents SDK** as the core agent framework.

The agent is responsible for:

* understanding user requests
* analyzing projects
* planning changes
* selecting tools
* executing tools
* observing tool results
* reasoning about failures
* repairing the project
* maintaining task context

Conceptually:

```text
User Request
     ↓
Observe
     ↓
Understand
     ↓
Plan
     ↓
Act
     ↓
Validate
     ↓
Reflect
     ↓
Repair
     ↓
Repeat
```

---

# Layer 4 — Model Layer

The model layer is deliberately separated from the agent.

The agent should not care whether it is running on:

* Claude
* GPT
* Gemini
* Amazon Nova
* another Bedrock model
* a local model
* a future provider

Architecture:

```text
Strands Agent
      ↓
Model Gateway
      ↓
Model Router
      ↓
Provider
```

Providers can include:

```text
CLI-X Cloud
Amazon Bedrock
OpenAI
Anthropic
Google
Local Models
```

The exact providers enabled depend on configuration and availability.

---

# Layer 5 — Tool Layer

The model never receives unrestricted operating-system access.

Instead, it receives controlled tools.

## Filesystem Tools

```text
read_file
write_file
edit_file
delete_file
list_directory
search_code
```

## Shell Tools

```text
run_command
run_script
```

## Package Tools

```text
install_dependency
remove_dependency
update_dependency
```

## Validation Tools

```text
run_build
run_tests
run_lint
run_typecheck
run_dev_server
```

## Project Tools

```text
get_project_state
update_project_state
get_project_memory
get_project_history
```

## Deployment Tools

```text
prepare_deployment
deploy
get_deployment_status
```

The agent decides which tool to use based on the current task.

---

# Layer 6 — Project Engine

The Project Engine manages the actual website project.

Responsibilities:

* filesystem management
* project creation
* project detection
* dependency management
* project state
* project metadata
* project memory
* file indexing

Example:

```text
my-project/
├── src/
├── public/
├── package.json
├── tsconfig.json
├── .env.example
│
└── .ai/
    ├── project.json
    ├── architecture.json
    ├── design.json
    ├── decisions.json
    ├── history.json
    └── chat/
        └── messages.jsonl
```

---

# Layer 7 — Validation Engine

The validation engine determines whether an agent task actually succeeded.

Possible validators:

```text
TypeScript
Build
Tests
ESLint
Runtime
Dependency validation
Environment validation
Generated file validation
```

Example:

```text
Agent
  ↓
write_file()
  ↓
run_build()
  ↓
Error
  ↓
Agent receives error
  ↓
Diagnose
  ↓
edit_file()
  ↓
run_build()
  ↓
Success
```

This creates the self-repair loop.

---

# Layer 8 — Deployment

Deployment is separate from website generation.

Initial targets:

```text
Local
AWS Amplify
```

Future targets may include:

```text
S3 + CloudFront
Vercel
Netlify
AWS App Runner
Other providers
```

Deployment providers should be implemented behind a common interface.

```ts
interface DeploymentProvider {
    prepare(project: Project): Promise<DeploymentPlan>;
    deploy(plan: DeploymentPlan): Promise<DeploymentResult>;
    status(id: string): Promise<DeploymentStatus>;
}
```

---

# Technology Stack

## Core Runtime

```text
Node.js
TypeScript
```

CLI:

```text
Commander.js
```

---

## AI Agent

```text
AWS Strands Agents SDK
```

Strands is the central agent framework.

It handles the agent loop, model interaction, tool calling, and agent orchestration.

---

## Model Layer

Primary architecture:

```text
Model Gateway
Model Router
Provider Adapters
```

Supported provider categories:

```text
CLI-X Cloud
Amazon Bedrock
OpenAI
Anthropic
Google
Local models
```

---

## AWS

AWS technologies will be used where they provide real value.

Core:

```text
Strands Agents SDK
```

Optional model infrastructure:

```text
Amazon Bedrock
```

Deployment:

```text
AWS Amplify
```

Potential future services:

```text
S3
CloudFront
Lambda
API Gateway
SageMaker AI
```

Do not add AWS services merely to increase the number of AWS technologies used.

---

## Development Tools

```text
npm
Git
TypeScript
ESLint
Vite / chosen website framework
```

The generated project may use different frameworks depending on the selected architecture.

---

# AI Architecture

CLI-X separates:

```text
Agent
Model
Tools
Project
```

These must never become tightly coupled.

The architecture is:

```text
                     STRANDS AGENT
                           │
                           ▼
                    MODEL GATEWAY
                           │
                     MODEL ROUTER
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
      Bedrock            OpenAI            Google
        │                  │                  │
     Models             Models             Models
```

The same agent can therefore work with different models.

---

# Model Strategy

CLI-X should support three modes.

## Mode 1 — CLI-X Cloud

Default experience.

The user does not need to provide an API key.

```text
CLI
 ↓
CLI-X Cloud API
 ↓
Strands Agent
 ↓
Model Router
 ↓
Provider
```

This provides the easiest onboarding experience.

The cloud backend is responsible for:

* model credentials
* rate limiting
* provider selection
* routing
* usage limits
* security

User credentials are never embedded inside the npm package.

---

# Mode 2 — BYOK

BYOK means:

> Bring Your Own Key.

Advanced users can configure their own providers.

Example:

```bash
wb config
```

```text
AI Configuration

❯ CLI-X Cloud
  OpenAI
  Anthropic
  Google
  AWS Bedrock
  Local Model
```

The CLI should store credentials securely through environment variables or an appropriate OS credential mechanism.

API keys should never be written directly into project source files.

---

# Mode 3 — Local Models

Future support for local models can allow developers to run inference locally.

Potential integrations:

```text
Ollama
Local model servers
Other OpenAI-compatible local endpoints
```

This mode is useful for:

* privacy
* offline development
* experimentation
* reducing cloud costs

---

# Model Router

CLI-X should eventually support automatic model routing.

Instead of forcing users to manually choose a model for every task:

```text
User
 ↓
Model Router
 ↓
Task Classification
 ↓
Appropriate Model
```

Example:

```text
Task                         Model Type
------------------------------------------------
Requirements analysis        Reasoning model
Architecture planning        Reasoning model
Large code generation        Coding model
Simple file edit             Fast model
UI generation                Multimodal model
Debugging                    Strong reasoning model
Code review                  Strong reasoning model
Summarization                Fast model
```

The router should consider:

* task complexity
* context size
* model capabilities
* latency
* cost
* user preferences
* project configuration

---

# Auto Mode

Users can select:

```text
/model auto
```

CLI-X then chooses the appropriate model.

Example:

```text
Simple edit
     ↓
Fast / inexpensive model

Complex architecture
     ↓
Reasoning model

Large code generation
     ↓
Coding model

Visual/UI task
     ↓
Multimodal model
```

Users can always override this.

```bash
/model claude
```

or:

```bash
/model gemini
```

---

# Persistent Project Chat

Every project should have its own persistent AI conversation.

Example:

```text
my-project/
└── .ai/
    └── chat/
        └── messages.jsonl
```

When the user runs:

```bash
wb chat
```

CLI-X loads the project's:

* chat history
* project state
* architecture
* design decisions
* previous changes
* current files
* dependencies

The agent therefore understands the project.

---

# Project Memory

CLI-X maintains structured project memory.

```text
.ai/
├── project.json
├── architecture.json
├── design.json
├── decisions.json
├── history.json
└── chat/
    └── messages.jsonl
```

## project.json

General project information.

```json
{
  "name": "student-dashboard",
  "framework": "react",
  "language": "typescript",
  "createdAt": "...",
  "lastModified": "..."
}
```

## architecture.json

Current technical architecture.

```json
{
  "frontend": "React",
  "styling": "Tailwind",
  "stateManagement": "...",
  "routing": "...",
  "backend": "..."
}
```

## design.json

UI decisions.

```json
{
  "theme": "dark",
  "style": "modern",
  "primaryColor": "...",
  "responsive": true
}
```

## decisions.json

Important architectural decisions made during development.

```json
[
  {
    "decision": "Use React Router",
    "reason": "Application contains multiple dashboard views"
  }
]
```

## history.json

Major changes made to the project.

---

# Agent Context

The agent should not blindly load the entire project into every model request.

Context should be assembled dynamically.

```text
User Message
     +
Project Memory
     +
Relevant Files
     +
Current Git State
     +
Recent Chat
     +
Task Information
     ↓
Agent Context
```

The agent should retrieve only what is relevant.

This reduces:

* token usage
* latency
* cost
* model confusion

---

# Agent Workflow

The core agent loop is:

```text
┌────────────────────┐
│      Observe       │
└─────────┬──────────┘
          ↓
┌────────────────────┐
│     Understand     │
└─────────┬──────────┘
          ↓
┌────────────────────┐
│       Plan         │
└─────────┬──────────┘
          ↓
┌────────────────────┐
│       Act          │
│     Use Tools      │
└─────────┬──────────┘
          ↓
┌────────────────────┐
│      Validate      │
└─────────┬──────────┘
          ↓
      ┌───┴────┐
      │        │
    PASS      FAIL
      │        │
      ↓        ↓
  Complete   Diagnose
                │
                ↓
              Repair
                │
                └──────► Validate
```

---

# Website Creation Workflow

When creating a website from scratch:

```text
1. User describes idea
        ↓
2. Requirements extraction
        ↓
3. Clarification if necessary
        ↓
4. Architecture planning
        ↓
5. Technology selection
        ↓
6. UI/design planning
        ↓
7. Project initialization
        ↓
8. File generation
        ↓
9. Dependency installation
        ↓
10. Build
        ↓
11. Validation
        ↓
12. Self-repair
        ↓
13. Start development server
        ↓
14. Present result
        ↓
15. Wait for user feedback
```

---

# Requirements Analysis

Before generating a large project, the agent should determine:

```text
Application type
Target users
Pages
Features
Authentication
Data requirements
API requirements
Responsive requirements
UI style
Deployment target
Technology constraints
```

Example:

```text
User:
Build a portfolio website for a software engineer.

Agent:

Application:
Portfolio

Pages:
- Home
- About
- Projects
- Contact

Requirements:
- Responsive
- Dark theme
- Project showcase
- Contact form

Technology:
React
TypeScript
Tailwind
```

The requirements should be stored in project memory.

---

# Architecture Planning

The agent determines an appropriate architecture.

Example:

```text
React
   │
   ├── Pages
   ├── Components
   ├── Hooks
   ├── Services
   └── Utilities
```

For larger applications:

```text
Frontend
   │
   ▼
API
   │
   ▼
Backend
   │
   ▼
Database
```

The agent should explain major architectural decisions rather than silently making arbitrary decisions.

---

# Technology Selection

CLI-X should not force every website into the same stack.

Possible frontend choices:

```text
React
Next.js
Vite
Other supported frameworks
```

Styling:

```text
Tailwind CSS
CSS Modules
Vanilla CSS
```

Backend:

```text
Node.js
Serverless
Other supported architectures
```

The initial MVP should support a small number of well-tested stacks rather than dozens of poorly supported combinations.

---

# Code Generation

Code generation should happen through tools.

The model should:

```text
inspect
 ↓
plan
 ↓
write
 ↓
read
 ↓
edit
 ↓
validate
```

It should not generate thousands of lines of code blindly in a single response.

---

# Modification Workflow

For an existing project:

```text
User Request
     ↓
Scan Project
     ↓
Identify Relevant Files
     ↓
Understand Dependencies
     ↓
Create Change Plan
     ↓
Apply Changes
     ↓
Run Validation
     ↓
Repair
     ↓
Update Project Memory
```

Example:

```text
User:
Add a pricing page.

Agent:
1. Inspect router
2. Inspect existing page structure
3. Inspect design system
4. Create pricing page
5. Add route
6. Reuse existing components
7. Run build
8. Fix errors
9. Update project memory
```

---

# Validation and Self-Repair

CLI-X should treat validation as part of development.

Example:

```text
write_file()
      ↓
run_typecheck()
      ↓
ERROR
      ↓
read relevant file
      ↓
diagnose
      ↓
edit_file()
      ↓
run_typecheck()
      ↓
PASS
```

The same mechanism applies to:

```text
Build errors
Type errors
Lint errors
Test failures
Runtime failures
Missing dependencies
Environment problems
```

---

# Safety During Tool Execution

The agent should not have unlimited destructive access.

Potentially dangerous commands should be:

```text
blocked
or
require confirmation
```

Examples:

```text
rm -rf
disk formatting
credential extraction
destructive git operations
system-level modifications
```

The agent should operate primarily inside the current project directory.

---

# Git Integration

Git should be treated as an important project capability.

The agent should be able to:

```text
git status
git diff
git log
git branch
git add
git commit
```

The user remains in control of destructive operations.

Potential workflow:

```text
Before Agent Task
        ↓
Check Git State
        ↓
Make Changes
        ↓
Validate
        ↓
Show Diff
        ↓
Optional Commit
```

Future versions may support automatic checkpoints.

---

# Deployment Workflow

Deployment should be an explicit stage.

```text
Project
   ↓
Build
   ↓
Validate
   ↓
Generate deployment configuration
   ↓
Authenticate
   ↓
Deploy
   ↓
Verify
   ↓
Return URL
```

Example:

```bash
wb deploy
```

Output:

```text
Preparing production build...

✓ Build successful
✓ Environment configuration generated
✓ Deployment configuration generated
✓ Uploaded
✓ Deployment verified

Your website:
https://example...
```

---

# AWS Integration

AWS should be integrated because it provides real infrastructure for the project and is relevant to the hackathon.

## Core AWS Technology

### Strands Agents SDK

Strands is the core agent framework.

It sits inside the agent layer:

```text
CLI
 ↓
Agent Manager
 ↓
Strands Agent
 ↓
Tools
```

---

# Amazon Bedrock

Bedrock should be implemented as a **model provider**, not hard-coded as the only model source.

```text
Strands
   ↓
Model Gateway
   ↓
Bedrock Provider
   ↓
Amazon Bedrock
   ↓
Foundation Model
```

Bedrock availability and model access depend on the AWS account, region, model, and permissions.

Therefore:

> CLI-X must not assume every user automatically has Bedrock model access.

The architecture should support Bedrock without making the entire application dependent on it.

---

# Hackathon AWS Strategy

The hackathon explicitly lists:

```text
Build It:
Strands Agents SDK
PartyRock

Ship It:
SageMaker AI
```

The project should therefore make **Strands Agents SDK the primary AWS technology**.

Bedrock can be added where model access is available and useful.

If the project is deployed on AWS, AWS deployment services can be used according to the selected architecture.

The project should never add AWS services merely for the sake of adding AWS services.

Every service should have a clear architectural purpose.

---

# Recommended Hackathon Architecture

For the hackathon MVP:

```text
                 CLI-X
                   │
                   ▼
            Strands Agent
                   │
           Model Gateway
                   │
          ┌────────┴────────┐
          │                 │
     CLI-X Cloud          BYOK
          │                 │
          ▼                 ▼
       Provider          Provider
          │                 │
          └────────┬────────┘
                   │
                   ▼
                Tools
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
   Filesystem    Shell     Validation
       │           │           │
       └───────────┼───────────┘
                   ▼
              Real Website
                   │
                   ▼
              AWS Deploy
```

This keeps the architecture simple while still demonstrating meaningful AWS usage.

---

# CLI Experience

The CLI should feel like an AI development environment rather than a collection of unrelated commands.

## Main Commands

```bash
wb create
wb chat
wb edit
wb build
wb dev
wb deploy
wb config
wb doctor
```

---

# `wb create`

Create a new website.

```bash
wb create
```

or:

```bash
wb create "Build a portfolio website for a software engineer"
```

---

# `wb chat`

Start or continue the project's persistent AI conversation.

```bash
wb chat
```

Example:

```text
You:
Add authentication.

CLI-X:
I'll inspect the current application first...

✓ Router inspected
✓ Existing user structure found
→ Planning authentication

...
```

---

# `wb edit`

Optional shortcut for one-shot modifications.

```bash
wb edit "Add a pricing page"
```

---

# `wb build`

Build and validate.

```bash
wb build
```

---

# `wb dev`

Start the development environment.

```bash
wb dev
```

---

# `wb deploy`

Deploy the project.

```bash
wb deploy
```

---

# `wb config`

Configure:

```text
AI provider
Model
API keys
CLI-X Cloud
AWS
Deployment
Preferences
```

---

# `wb doctor`

Diagnose the local environment.

Checks:

```text
Node.js
npm
Git
Project structure
Dependencies
AI configuration
AWS configuration
Build tools
Deployment configuration
```

---

# Project Structure

The proposed CLI-X repository:

```text
cli-x/
│
├── package.json
├── tsconfig.json
├── README.md
│
├── src/
│   │
│   ├── cli/
│   │   ├── index.ts
│   │   ├── commands/
│   │   │   ├── create.ts
│   │   │   ├── chat.ts
│   │   │   ├── edit.ts
│   │   │   ├── build.ts
│   │   │   ├── dev.ts
│   │   │   ├── deploy.ts
│   │   │   ├── config.ts
│   │   │   └── doctor.ts
│   │   │
│   │   └── ui/
│   │
│   ├── application/
│   │   ├── agent-manager.ts
│   │   ├── project-manager.ts
│   │   ├── session-manager.ts
│   │   ├── build-manager.ts
│   │   └── deployment-manager.ts
│   │
│   ├── agent/
│   │   ├── website-agent.ts
│   │   ├── prompts/
│   │   ├── context/
│   │   └── tools/
│   │
│   ├── models/
│   │   ├── model-provider.ts
│   │   ├── model-router.ts
│   │   ├── model-registry.ts
│   │   └── providers/
│   │       ├── cloud.ts
│   │       ├── bedrock.ts
│   │       ├── openai.ts
│   │       ├── anthropic.ts
│   │       └── google.ts
│   │
│   ├── tools/
│   │   ├── filesystem/
│   │   ├── shell/
│   │   ├── package-manager/
│   │   ├── validation/
│   │   ├── project/
│   │   ├── git/
│   │   └── deployment/
│   │
│   ├── project/
│   │   ├── project-manager.ts
│   │   ├── project-state.ts
│   │   ├── project-memory.ts
│   │   └── dependency-manager.ts
│   │
│   ├── validation/
│   │   ├── validator.ts
│   │   ├── build-validator.ts
│   │   ├── type-validator.ts
│   │   ├── test-validator.ts
│   │   └── runtime-validator.ts
│   │
│   ├── deployment/
│   │   ├── deployment-provider.ts
│   │   └── providers/
│   │       ├── local.ts
│   │       └── amplify.ts
│   │
│   ├── config/
│   │
│   └── utils/
│
├── templates/
│   ├── react/
│   ├── next/
│   └── ...
│
├── tests/
│
└── docs/
    ├── architecture.md
    ├── agent.md
    ├── models.md
    └── tools.md
```

---

# Important Architectural Rule

The dependency direction should remain:

```text
CLI
 ↓
Application
 ↓
Agent
 ↓
Models / Tools
 ↓
Project / System
```

Not:

```text
CLI
 ↓
Python
 ↓
FastAPI
 ↓
AI
 ↓
CLI
```

The core runtime should remain TypeScript/Node.js.

---

# Why Python Is Not Part of the Core MVP

The previous architecture contained:

```text
TypeScript
 ↓
Python subprocess
 ↓
FastAPI
 ↓
AI generator
```

This introduced:

* duplicate backend implementations
* Python environment management
* dependency synchronization
* subprocess communication
* stdout/JSON protocol problems
* multiple AI implementations
* duplicated configuration

CLI-X does not require Python for its core agent runtime.

Python can be introduced later for specialized workloads if a real requirement appears.

---

# Why FastAPI Is Not Part of the Core CLI

FastAPI can still be used for a future hosted backend, but it should not be required for local CLI operation.

Local mode should work like:

```text
CLI
 ↓
Strands
 ↓
Model Provider
 ↓
Tools
 ↓
Project
```

Cloud mode can work like:

```text
CLI
 ↓
CLI-X Cloud API
 ↓
Strands
 ↓
Model Provider
 ↓
Tools
```

This keeps local and cloud architecture conceptually consistent.

---

# CLI-X Cloud

CLI-X Cloud is an optional hosted backend that removes the need for users to configure AI providers.

```text
User
 ↓
CLI-X CLI
 ↓ HTTPS
CLI-X Cloud
 ↓
Authentication
 ↓
Session
 ↓
Strands Agent
 ↓
Model Router
 ↓
AI Provider
```

The cloud backend can eventually provide:

* hosted model access
* usage limits
* model routing
* team accounts
* project synchronization
* analytics
* billing
* shared project sessions

The npm package must never contain private provider credentials.

---

# Security Model

Security is a first-class requirement because CLI-X executes commands and modifies files.

## Filesystem

The agent should primarily operate inside the project directory.

Paths should be normalized and validated.

---

## Shell

Commands should be classified.

```text
Safe
 ├── npm install
 ├── npm run build
 ├── npm test
 ├── git status
 └── git diff

Potentially dangerous
 ├── rm
 ├── force push
 ├── system configuration
 └── destructive commands
```

Dangerous operations should require confirmation or be blocked.

---

## Credentials

Never:

```text
write API keys into project files
```

Prefer:

```text
Environment variables
OS credential storage
Secure cloud-side secrets
AWS IAM
```

---

# Session Management

Each project has a persistent session.

```text
Project
   │
   ├── Project State
   ├── Project Memory
   ├── Chat History
   └── Agent Configuration
```

A session contains:

```text
sessionId
projectId
model
messages
tool calls
tool results
createdAt
updatedAt
```

---

# Multiple Chats

The MVP can start with:

```text
1 project = 1 primary chat
```

Future versions can support:

```text
Project
 ├── Main Chat
 ├── UI Chat
 ├── Backend Chat
 ├── Debug Chat
 └── Deployment Chat
```

All chats share the same project state.

---

# Multi-Agent Future Architecture

The initial version should use one primary agent.

Future versions can introduce specialized agents:

```text
                 Main Agent
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
     UI Agent    Backend Agent  QA Agent
        │            │            │
        └────────────┼────────────┘
                     ▼
                Project State
```

This should only be implemented after the single-agent architecture is stable.

---

# Development Phases

The project will be developed in phases.

---

# Phase 0 — Architecture Reset

Goal:

Create a clean foundation.

Tasks:

* Remove dependency on the Python build engine
* Remove duplicate backend architecture
* Establish TypeScript as the core runtime
* Establish clean module boundaries
* Define interfaces
* Define project state
* Define tool contracts
* Define model contracts

Deliverable:

```text
Clean TypeScript CLI
+
Clean architecture
+
Compilable project
```

---

# Phase 1 — CLI Foundation

Implement:

```bash
wb create
wb chat
wb edit
wb build
wb dev
wb config
wb doctor
```

Requirements:

* Commander
* CLI UI
* configuration system
* project detection
* project initialization

No sophisticated AI yet.

---

# Phase 2 — Strands Agent

Integrate:

```text
Strands Agents SDK
```

Create:

```text
WebsiteAgent
```

Implement:

* agent initialization
* system prompt
* tool registration
* model abstraction
* conversation handling
* agent execution loop

Deliverable:

```text
User
 ↓
CLI
 ↓
Strands Agent
 ↓
Tool
 ↓
Project
```

---

# Phase 3 — Tool System

Implement the fundamental tools.

### Filesystem

```text
read_file
write_file
edit_file
delete_file
list_directory
search_code
```

### Shell

```text
run_command
```

### Package Manager

```text
install_dependency
```

### Project

```text
get_project_state
update_project_state
```

---

# Phase 4 — Model Gateway

Implement the provider abstraction.

```text
ModelProvider
ModelRouter
ModelRegistry
```

First provider:

```text
CLI-X Cloud / selected provider
```

Then:

```text
Bedrock
OpenAI
Anthropic
Google
```

The exact provider implementation order depends on available credentials and development resources.

---

# Phase 5 — Website Generation

Implement:

```bash
wb create
```

Workflow:

```text
Prompt
 ↓
Requirements
 ↓
Architecture
 ↓
Technology
 ↓
Design
 ↓
Project creation
 ↓
Code generation
 ↓
Dependencies
 ↓
Build
 ↓
Validation
```

---

# Phase 6 — Persistent Project Chat

Implement:

```bash
wb chat
```

Add:

```text
Chat history
Project memory
Context retrieval
Model selection
Session management
```

The user can continue modifying the same project.

---

# Phase 7 — Self-Repair

Implement:

```text
Build
 ↓
Error
 ↓
Agent
 ↓
Diagnosis
 ↓
Edit
 ↓
Build
 ↓
Success
```

Support:

```text
TypeScript errors
Build errors
Lint errors
Test failures
Runtime errors
Dependency errors
```

This phase is critical to making CLI-X feel like an actual coding agent.

---

# Phase 8 — Development Server

Implement:

```bash
wb dev
```

Responsibilities:

* start dev server
* monitor output
* detect runtime errors
* provide URL
* optionally allow agent-assisted debugging

Example:

```text
✓ Development server started

Local:
http://localhost:5173
```

---

# Phase 9 — Deployment

Initial deployment target:

```text
AWS Amplify
```

Workflow:

```text
Build
 ↓
Validate
 ↓
Prepare deployment
 ↓
Deploy
 ↓
Verify
 ↓
Return URL
```

---

# Phase 10 — Model Router

Introduce intelligent model selection.

```text
Task
 ↓
Classifier
 ↓
Model selection
 ↓
Execution
```

Add:

```text
/model auto
```

Users can still override the model.

---

# Phase 11 — CLI-X Cloud

Build the hosted backend.

```text
CLI
 ↓
CLI-X Cloud
 ↓
Strands
 ↓
Model Gateway
 ↓
Providers
```

This enables:

* zero-config AI
* managed credentials
* model routing
* usage limits
* cloud sessions
* future accounts/subscriptions

---

# Hackathon MVP

The hackathon version should not attempt to implement every planned feature.

The MVP should focus on one extremely strong vertical slice.

## Target Demo

Start with an empty directory.

```bash
npm install -g cli-x
```

Then:

```bash
wb create
```

User enters:

```text
Build a modern SaaS dashboard for university students.

Students should be able to:
- manage assignments
- track exams
- see deadlines
- view productivity statistics

Use a modern responsive dark interface.
```

CLI-X:

```text
Analyzing requirements...

✓ Requirements identified
✓ Architecture planned
✓ Technology selected
✓ Project initialized

Generating website...

✓ Components created
✓ Styling created
✓ Dependencies installed

Running validation...

✓ TypeScript passed
✓ Build passed

Starting development server...

http://localhost:5173
```

Then:

```bash
wb chat
```

User:

```text
Add a calendar page and connect it to the dashboard.
```

Agent:

```text
Inspecting project...

✓ Existing router found
✓ Dashboard architecture understood
✓ Calendar architecture planned

Implementing...

✓ Calendar page created
✓ Dashboard updated
✓ Navigation updated

Validating...

✓ Build passed
```

Then:

```text
User:
Make the dashboard more premium and add animations.
```

Agent modifies the existing project.

Finally:

```bash
wb deploy
```

and produces a deployed URL.

---

# Hackathon Priority

The implementation priority should be:

```text
1. Working agent
2. Working tools
3. Reliable website generation
4. Persistent project chat
5. Validation
6. Self-repair
7. Model abstraction
8. AWS integration
9. Deployment
10. UI polish
```

The project should prioritize one complete working workflow over many incomplete features.

---

# Definition of Done

A feature is not considered complete until it can:

```text
Work
 ↓
Persist
 ↓
Validate
 ↓
Recover from errors
```

For example:

A website generator is not complete when it produces files.

It is complete when:

```text
Prompt
 ↓
Website generated
 ↓
Dependencies installed
 ↓
Build works
 ↓
Dev server starts
 ↓
User can request modifications
 ↓
Agent modifies existing project
 ↓
Project still builds
```

---

# What We Are NOT Building Initially

The MVP will not attempt to build:

* A full IDE
* A visual drag-and-drop website builder
* A complete cloud IDE
* A custom programming language
* A general-purpose coding agent for every programming domain
* Dozens of deployment providers
* Dozens of AI providers
* A complex enterprise authentication platform
* Multi-agent orchestration before single-agent reliability
* A Python backend for core functionality

CLI-X is specifically optimized for:

> **AI-assisted website development from the terminal.**

---

# Design Principle: Website Specialization

CLI-X should know about websites.

The agent should understand concepts such as:

```text
Pages
Routes
Components
Layouts
Responsive design
Navigation
Forms
Authentication
APIs
State
Data fetching
SEO
Accessibility
Performance
Deployment
Environment variables
```

This specialization differentiates CLI-X from a generic coding agent.

---

# Long-Term Vision

Eventually CLI-X should be capable of:

```text
"Build me a website for my startup."
```

and autonomously:

```text
Understand business requirements
        ↓
Create information architecture
        ↓
Design UI
        ↓
Select technology
        ↓
Generate project
        ↓
Implement frontend
        ↓
Implement backend
        ↓
Configure database
        ↓
Configure authentication
        ↓
Run application
        ↓
Test
        ↓
Fix errors
        ↓
Improve UI
        ↓
Optimize
        ↓
Deploy
        ↓
Return URL
```

Then the user continues:

```text
"Add Stripe payments."

"Make the landing page more professional."

"Add dark mode."

"Make it mobile friendly."

"Fix the login bug."

"Add an admin dashboard."

"Deploy the latest version."
```

CLI-X should understand that all of these requests refer to the **same evolving project**.

---

# Final Architecture

The complete system can be summarized as:

```text
                           USER
                            │
                            ▼
                     ┌─────────────┐
                     │   CLI-X     │
                     │   Terminal  │
                     └──────┬──────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │ Application Layer│
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  STRANDS AGENT   │
                  │                  │
                  │ Understand       │
                  │ Plan             │
                  │ Act              │
                  │ Validate         │
                  │ Repair           │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  MODEL GATEWAY   │
                  │  MODEL ROUTER    │
                  └────────┬─────────┘
                           │
             ┌─────────────┼──────────────┐
             │             │              │
             ▼             ▼              ▼
          Bedrock        OpenAI        Google
             │             │              │
             └─────────────┼──────────────┘
                           │
                           ▼
                    ┌────────────┐
                    │   TOOLS    │
                    ├────────────┤
                    │ Files      │
                    │ Shell      │
                    │ npm        │
                    │ Git        │
                    │ Build      │
                    │ Test       │
                    │ Deploy     │
                    └─────┬──────┘
                          │
                          ▼
                  ┌─────────────────┐
                  │ REAL WEBSITE    │
                  │                 │
                  │ src/            │
                  │ public/         │
                  │ package.json    │
                  └────────┬────────┘
                           │
                           ▼
                    VALIDATION
                           │
                    ┌──────┴──────┐
                    │             │
                   PASS          FAIL
                    │             │
                    ▼             ▼
                 Complete       Repair
                                  │
                                  └──────► Agent
```

---

# The Core Loop

Everything in CLI-X ultimately comes down to this:

```text
                  ┌───────────────┐
                  │     USER      │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │    AGENT      │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │     TOOLS     │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │    PROJECT    │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │   VALIDATE    │
                  └───────┬───────┘
                          │
                     ┌────┴────┐
                     │         │
                    PASS      FAIL
                     │         │
                     ▼         ▼
                   DONE      REPAIR
                               │
                               └──────► AGENT
```

This loop is the heart of CLI-X.

---

# Development Philosophy

CLI-X should follow one simple rule:

> **One feature that works is better than five features that almost work.**

The goal is not to build the largest AI coding platform.

The goal is to build a **reliable autonomous website development agent**.

The agent should be able to:

```text
Understand.
Plan.
Build.
Run.
Validate.
Repair.
Remember.
Iterate.
Deploy.
```

---

# Project Status

CLI-X is currently undergoing an architectural restructuring.

The existing prototype contains useful components including a TypeScript CLI, command structure, filesystem utilities, templates, deployment abstractions, and project configuration concepts.

The new architecture consolidates the core runtime around:

```text
TypeScript
+
Strands Agents SDK
+
Model Gateway
+
Tool System
+
Project Engine
+
Validation
+
Deployment
```

The previous multi-runtime Python/FastAPI architecture is not part of the core target architecture.

---

# Summary

CLI-X is not intended to be:

```text
Prompt → Code
```

It is intended to be:

```text
Prompt
  ↓
Understand Project
  ↓
Plan
  ↓
Use AI Model
  ↓
Use Development Tools
  ↓
Modify Real Files
  ↓
Run Project
  ↓
Validate
  ↓
Repair
  ↓
Remember
  ↓
Continue Conversation
  ↓
Deploy
```

The long-term goal is to make building a website feel like having an experienced development agent inside the terminal.

**CLI-X — Your website development agent in the terminal.**

```

This structure deliberately keeps **Bedrock optional** rather than making an unsupported assumption that the hackathon supplies Bedrock inference. The hackathon materials explicitly list **Strands Agents SDK** under the Build It AI stack and say AWS open-source projects or AWS services are required to win a prize. :contentReference[oaicite:0]{index=0} :contentReference[oaicite:1]{index=1}

Also, I would **not start coding the whole thing at once**. The correct implementation order is essentially:

**Phase 0 → clean architecture → Phase 1 CLI → Phase 2 Strands → Phase 3 tools → Phase 4 model gateway → Phase 5 generation → Phase 6 persistent chat → Phase 7 self-repair → Phase 8 dev server → Phase 9 deployment.**

That gives your team a very clear definition of what to build next instead of continuing to patch the current repository's Python/FastAPI/duplicate-backend architecture.
```
