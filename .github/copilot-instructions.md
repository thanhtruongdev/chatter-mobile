# Project Guidelines

## Architecture

- This workspace uses Expo Router for route mapping only. Keep route files in app/ as thin wrappers that render screens exported from src/modules.
- Business logic and feature UI live in src/modules/<feature>/.
- Keep module boundaries strict: import across modules through each module's index.ts public API, not deep internal paths.
- Shared cross-feature code belongs in src/core. Reusable app-level UI primitives currently live in components/ui.

## Build And Verify

- Install dependencies: npm install
- Start development server: npm run start
- Run Android build/dev client: npm run android
- Run iOS build/dev client: npm run ios
- Run web target: npm run web
- Lint code: npm run lint
- Reset starter scaffold (destructive to starter app content): npm run reset-project
- There is no test script configured yet. Do not invent a test command unless one is added to package.json.

## TypeScript And Imports

- TypeScript strict mode is enabled in tsconfig.json. Keep changes type-safe and avoid any.
- Use the existing path alias @/\* (mapped to repository root) for internal imports.
- Prefer named exports for components and module APIs.

## UI And Styling

- Use theme tokens from constants/theme.ts. Avoid hardcoded colors when equivalent tokens exist.
- Prefer StyleSheet.create for static styles and inline style objects only for truly dynamic values.
- Keep cross-platform behavior explicit where needed (for example safe-area and Android top inset handling).

## Expo Router Conventions

- app/(auth)/login/index.tsx demonstrates the expected route-wrapper pattern:
  - Route file default-exports a small component that returns a screen from src/modules.
- Keep routing concerns in app/, and keep screen implementation details in src/modules.

## Key References

- docs/project-structure.md: module architecture and boundaries.
- docs/react-native-code-rules.md: React Native coding standards used by this project.
- constants/theme.ts: design tokens and color usage.
