# Health App Monorepo

This repository hosts the Health App platform, including the Expo-powered mobile application and the Express-based API server. The workspace is managed with npm workspaces so shared tooling and dependencies live at the repository root.

## Projects

- **apps/mobile** – React Native / Expo client for managing wellness data and Apple Health integrations.
- **apps/server** – Express REST API that aggregates health metrics and orchestrates sync jobs.
- **infrastructure** – Infrastructure-as-code, automation, and deployment assets.

## Tooling

- **TypeScript** with a shared `tsconfig.base.json` for consistent compiler settings.
- **ESLint** and **Prettier** configured centrally to enforce code quality and formatting across apps.

Install dependencies and develop with:

```bash
npm install
npm run lint
npm run typecheck
```
