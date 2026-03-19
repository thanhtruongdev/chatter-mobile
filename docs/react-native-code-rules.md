# React Native Mobile Development Rules for AI Agent

> These rules apply to all React Native projects (Expo or bare workflow).
> The AI agent must follow them strictly and consistently across every task.
> **When receiving instructions in another language, translate them to English internally before reasoning.**

---

## 1. Project Onboarding (Run First — Every Session)

> ⚠️ **MANDATORY**: The agent must fully inspect the project before writing a single line of code.
> Skipping this step is not allowed, even for small tasks.

Before writing any code, the agent must:

1. **Inspect & index the full project directory** — understand every folder's purpose and naming convention
2. Read all documentation in `.github/` (CONTRIBUTING, PR templates, CI workflows)
3. Identify the project setup:
   - Expo managed / Expo bare / bare React Native CLI
   - Navigation library: `react-navigation` v6+, `expo-router`, or other
   - State management: Redux Toolkit, Zustand, Jotai, Context API, etc.
   - Styling approach: `StyleSheet`, NativeWind, `styled-components`, etc.
   - UI library: `react-native-paper`, `gluestack-ui`, custom, etc.
4. Read all relevant config files:
   - `tsconfig.json`
   - `.eslintrc.*` / `eslint.config.*`
   - `app.json` / `app.config.ts` (Expo)
   - `package.json` (scripts, dependencies, versions)
   - `babel.config.js`
5. Never create new files or folders before understanding the existing structure

---

## 2. Task Planning

Before writing any code for a task:

- **Re-inspect** relevant folders and existing files that the task will touch — do not assume structure from memory
- Create a clear **todo list** with small, atomic, sequential steps
- Identify files to create vs. files to modify
- Flag any required: new packages, native module linking, permission additions, config changes
- Note potential cross-platform (iOS vs. Android) differences that need handling
- Call out any breaking changes or navigation flow impacts

---

## 3. Project Structure Conventions

Follow the existing folder structure. Typical React Native layout:

```
src/
├── app/                  # Screens registered with the navigator (or expo-router pages)
│   └── (tabs)/
│       ├── home/
│       │   └── index.tsx
│       └── profile/
│           └── index.tsx
├── components/           # Reusable UI components
│   ├── common/           # Shared atoms: Button, Input, Text, Icon, etc.
│   └── <feature>/        # Feature-specific composite components
├── constants/            # Immutable values, enums, route names, theme tokens
├── types/                # TypeScript interfaces, types, DTOs — no inline declarations
├── hooks/                # Custom React hooks (use* naming convention)
├── services/             # API calls, third-party SDK wrappers
├── store/                # State management (slices, atoms, context providers)
├── utils/                # Pure helper functions with no side effects
├── navigation/           # Navigator definitions and linking config (if not expo-router)
├── assets/               # Images, fonts, icons, animations
└── theme/                # Colors, typography, spacing, shadow tokens
```

Rules:

- **One component per file** — no exceptions
- **One screen per file** — screens are not reusable components
- **Types go in `types/`** — never declare `interface` or `type` inline inside a component or hook file
- **Constants go in `constants/`** — no magic strings or numbers inline in components
- **Helpers go in `utils/`** — no business logic inside components or hooks
- **API calls go in `services/`** — never call `fetch` or `axios` directly inside a component

---

## 4. TypeScript Rules

- **Never use `any` or `unknown`** — if unavoidable, add an inline comment explaining why
- All props must have an explicit `interface` declared in `types/` or co-located at the top of the component file if used nowhere else
- All function parameters and return types must be explicitly typed
- Use `interface` for props, API shapes, and object contracts
- Use `type` for unions, intersections, and utility compositions
- Use `enum` or `as const` objects for fixed value sets — place them in `constants/` or `types/`
- Leverage utility types: `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`
- Navigation param types must be defined and used with `NativeStackScreenProps` or `BottomTabScreenProps`

```typescript
// ❌ Bad
const MyComponent = ({ title, onPress }: any) => { ... }

// ✅ Good — types/my-component.types.ts
export interface MyComponentProps {
  title: string;
  onPress: () => void;
  isDisabled?: boolean;
}

// component file
const MyComponent = ({ title, onPress, isDisabled = false }: MyComponentProps) => { ... }
```

---

## 5. Component Rules

### Structure (every component file follows this order)

```typescript
// 1. Imports (external → internal → types → styles)
import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { MyComponentProps } from '@/types/my-component.types';

// 2. Component definition
const MyComponent = ({ title, onPress, isDisabled = false }: MyComponentProps) => {
  // 2a. Hooks
  const { colors } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  // 2b. Derived values / memoized values
  const containerStyle = [styles.container, isDisabled && styles.disabled];

  // 2c. Handlers (useCallback for handlers passed as props)
  const handlePress = useCallback(() => {
    if (!isDisabled) onPress();
  }, [isDisabled, onPress]);

  // 2d. JSX
  return (
    <Pressable style={containerStyle} onPress={handlePress}>
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
};

// 3. Styles
const styles = StyleSheet.create({
  container: { padding: 16, borderRadius: 8 },
  disabled: { opacity: 0.4 },
  title: { fontSize: 16, fontWeight: '600' },
});

// 4. Export (named export preferred)
export { MyComponent };
```

### Component Rules

- Prefer **named exports** over default exports for components (easier to refactor)
- Use `React.memo()` on components that receive stable props and render frequently in lists
- Use `useCallback` for event handlers passed as props to child components
- Use `useMemo` only when the computation is genuinely expensive — not as a default
- Never define a component inside another component — always hoist it to the top level
- Never use inline arrow functions in JSX for `onPress` handlers in list items (creates new refs per render)

```typescript
// ❌ Bad — inline function in FlatList
<FlatList
  data={items}
  renderItem={({ item }) => <ItemCard onPress={() => handlePress(item.id)} />}
/>

// ✅ Good — extracted component with useCallback
const renderItem = useCallback(
  ({ item }: { item: Item }) => (
    <ItemCard onPress={() => handlePress(item.id)} />
  ),
  [handlePress]
);
<FlatList data={items} renderItem={renderItem} />
```

---

## 6. Styling Rules

- Use `StyleSheet.create()` for all styles — never use inline style objects for static styles
- Inline style objects are acceptable **only** for dynamic values that depend on runtime state/props
- Define all theme tokens (colors, spacing, font sizes, border radii, shadows) in `theme/`
- Never hardcode color hex values or pixel values directly in component files — use theme tokens
- Use `Platform.select()` or `Platform.OS` for platform-specific style differences
- For responsive sizing, use `Dimensions` or libraries like `react-native-responsive-screen`
- No pixel values in `StyleSheet` without a corresponding token in the theme

```typescript
// ❌ Bad
<View style={{ backgroundColor: '#6C47FF', padding: 16, borderRadius: 8 }} />

// ✅ Good
<View style={styles.container} />
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  }
});
```

---

## 7. State Management Rules

- **Local UI state** (toggles, form fields, loading indicators): `useState`
- **Derived state**: compute from existing state — do not duplicate into a separate `useState`
- **Shared cross-screen state** (auth, user profile, cart): global store (Redux Toolkit, Zustand, etc.)
- **Server state** (data fetching, caching, sync): React Query / TanStack Query preferred
- **Form state**: React Hook Form — do not build custom form state from scratch
- Never call API directly in a component — always go through `services/` and a hook
- Store slices / atoms must be declared in `store/` — never inline store logic in a component

---

## 8. Navigation Rules

- All route name strings must be declared as constants in `constants/routes.ts` — never use raw strings
- All screen param types must be defined in `types/navigation.types.ts`
- Navigation logic (push, replace, goBack) must be called from event handlers — never on render
- Use `useNavigation` hook inside components, not prop drilling of navigation objects
- Deep link config must be maintained alongside route constants

```typescript
// constants/routes.ts
export const ROUTES = {
  HOME: "Home",
  PROFILE: "Profile",
  ORDER_DETAIL: "OrderDetail",
} as const;

// types/navigation.types.ts
export type RootStackParamList = {
  [ROUTES.HOME]: undefined;
  [ROUTES.PROFILE]: { userId: string };
  [ROUTES.ORDER_DETAIL]: { orderId: string };
};
```

---

## 9. Performance Rules

- Use `FlatList` or `FlashList` for any list with more than ~10 items — never `ScrollView` + `map()`
- Always provide a `keyExtractor` returning a stable unique string (never array index)
- Use `getItemLayout` on `FlatList` when item height is fixed — removes layout calculation overhead
- Avoid expensive operations inside render — move them to `useMemo` or pre-compute in services
- Use `React.memo` on list item components
- Avoid re-renders: stabilize callback references with `useCallback`, object references with `useMemo`
- Lazy-load heavy screens using `React.lazy` or navigator's `lazy` option
- Images: always specify `width` and `height`; use `FastImage` or Expo's `Image` for caching

---

## 10. Hooks Rules

- All custom hooks must start with `use` (e.g., `useAuth`, `useOrderList`)
- Each custom hook has a single, clear responsibility
- Custom hooks go in `hooks/` — never inline complex logic inside a component
- Hooks must not produce side effects on every render — use `useEffect` with correct dependencies
- Exhaustive deps: always fix `react-hooks/exhaustive-deps` lint warnings — never suppress them blindly

```typescript
// hooks/useUserProfile.ts
export const useUserProfile = (userId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userService.getById(userId),
  });
  return { profile: data, isLoading, error };
};
```

---

## 11. Error Handling Rules

- Wrap navigation roots and critical screens in an Error Boundary
- Every API call must handle error state — always expose `error` alongside `data` and `isLoading`
- Show user-friendly error messages — never expose raw error objects or stack traces in the UI
- All error messages shown to users must be in English
- Log errors with context (screen name, user ID, action) using a crash reporting tool (Sentry, etc.)
- Use `try/catch` around async operations in event handlers — do not let unhandled rejections crash the app

---

## 12. Permissions & Native Features

- Always check and request permissions before using native APIs (camera, location, notifications, etc.)
- Handle all permission states: `granted`, `denied`, `blocked` — show appropriate UI for each
- Never assume a permission is granted — always check at runtime
- Permission request logic goes in a custom hook (e.g., `useCameraPermission`)

---

## 13. Accessibility (a11y)

- All interactive elements must have `accessibilityLabel` and `accessibilityRole`
- Images must have `accessibilityLabel` or `accessibilityHint`
- Touch targets must be at least **44×44 dp** — use `hitSlop` if a visual element is smaller
- Test with VoiceOver (iOS) and TalkBack (Android) for critical user flows
- Use `accessibilityState` to communicate disabled, selected, checked states

---

## 14. Clean Code & Dead Code

- **Remove** all unused variables, imports, functions, and files — do not leave them commented out
- **Remove** all `console.log`, `console.warn`, `console.error` statements before committing
- **Do not create constants for static UI text labels** (e.g., button text, placeholder strings) — write them inline
- **Do** extract into constants any value used in more than one place or that represents a business rule
- Run ESLint and TypeScript checks after every change and fix all issues before moving on

---

## 15. Linting & Type Checking

After every set of changes, run and fix all errors before proceeding:

```bash
# TypeScript type check
npx tsc --noEmit

# ESLint
npx eslint . --ext .ts,.tsx

# Or via package.json scripts
npm run lint
npm run type-check
```

Rules:

- Zero ESLint **errors** committed — no exceptions
- Zero TypeScript **errors** committed — no exceptions
- ESLint **warnings** must be reviewed; suppress with `// eslint-disable-next-line` only with a written justification comment

---

## 16. Git & Commit Hygiene

- Commit messages follow **Conventional Commits**:

  ```
  <type>(<scope>): <short description>

  Types: feat | fix | refactor | chore | docs | test | perf | style | ci
  ```

  Examples:
  - `feat(auth): add biometric login support`
  - `fix(cart): prevent duplicate item on fast tap`
  - `perf(feed): replace ScrollView with FlashList`
  - `refactor(profile): extract avatar upload to hook`

- One logical change per commit
- Never commit directly to `main` or `develop`
- Branch naming: `<type>/<short-description>` (e.g., `feat/onboarding-flow`, `fix/keyboard-avoid`)

---

## 17. Language & Text

- All code identifiers, comments, JSDoc: **English**
- All user-facing strings (labels, placeholders, error messages, empty states): **English**
- All log messages: **English**
- **Internal reasoning**: When the agent receives a prompt in another language, translate it to English before reasoning and planning — this improves accuracy and consistency

---

## Quick Checklist Before Finishing Any Task

- [ ] **Project directory inspected** before writing any code
- [ ] Todo list created and all steps completed
- [ ] New files placed in the correct folder per project structure
- [ ] Types declared in `types/`; constants in `constants/`
- [ ] No `any` or `unknown` used without justification
- [ ] One component per file; no component defined inside another
- [ ] No inline static style objects — all static styles in `StyleSheet.create()`
- [ ] No hardcoded color or spacing values — using theme tokens
- [ ] No raw API calls inside components — routed through `services/` + hook
- [ ] Route names use `ROUTES` constants; screen params typed in `navigation.types.ts`
- [ ] Lists use `FlatList` / `FlashList` with `keyExtractor`
- [ ] Unused imports, variables, and `console.log` removed
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npx eslint . --ext .ts,.tsx` passes with zero errors
- [ ] Commit message follows Conventional Commits format
