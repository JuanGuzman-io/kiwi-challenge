# Research & Technology Decisions: Rewards Overview (Rewards Home)

**Feature**: 001-rewards-home
**Date**: 2026-01-11
**Context**: Frontend implementation of rewards balance and transaction history display

## Overview

This document resolves all technology decisions and unknowns identified in the planning phase (plan.md Phase 0). Each decision is justified based on constitution compliance, bundle size, browser support, and development simplicity.

---

## Decision 1: Date Formatting Library

### Question
How to format dates in Spanish locale for month headers (e.g., "Septiembre 2025", "Agosto 2025") and transaction dates?

### Options Evaluated
1. **Native Intl.DateTimeFormat API** (zero dependencies)
2. **date-fns with es locale** (~2.5KB gzipped with es locale)

### Decision: Native Intl.DateTimeFormat API

**Rationale**:
- **Zero dependencies**: Aligns with Constitution Principle I (minimal dependencies)
- **Browser support**: Fully supported in all target browsers (Chrome, Firefox, Safari, Edge - last 2 versions; iOS Safari, Android Chrome) per clarification
- **Built-in localization**: Spanish locale (es-ES) available natively
- **API simplicity**: Direct integration without external library
- **Bundle size**: No additional bytes

**Implementation Pattern**:
```typescript
// Month header formatting
const monthFormatter = new Intl.DateTimeFormat('es-ES', {
  month: 'long',
  year: 'numeric'
});
// Output: "Septiembre 2025"

// Transaction date formatting
const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
});
// Output: "15 sept 2025"
```

**Alternatives Considered**:
- **date-fns**: Rejected due to additional 2.5KB bundle size when native API provides equivalent functionality. Would be reconsidered if complex date manipulation (parsing, arithmetic) were required, but spec only needs formatting.

---

## Decision 2: API Client Pattern

### Question
How to structure API calls with x-user-id header injection, 5-second timeout handling, and error management?

### Options Evaluated
1. **Fetch API with custom wrapper**
2. **Axios with interceptors** (~5KB gzipped)
3. **React Query** (~12KB gzipped) with built-in state management

### Decision: Fetch API with Custom Wrapper

**Rationale**:
- **Zero dependencies**: Native browser API, aligns with Constitution Principle I
- **Timeout support**: AbortController + setTimeout provides 5-second timeout (FR-053)
- **Header injection**: Simple middleware pattern for x-user-id (FR-021)
- **Error handling**: try/catch with custom error types for timeout/network/API failures
- **Constitution compliance**: "Keep dependencies minimal and intentional" (Principle I)

**Implementation Pattern**:
```typescript
// client/src/features/rewards/api/rewardsApi.ts
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'x-user-id': getUserId(), // From auth context
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new APIError(response.status, await response.json());
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new TimeoutError('Request exceeded 5 seconds');
    }
    throw error;
  }
}
```

**Alternatives Considered**:
- **Axios**: Rejected. Timeout support and interceptors are valuable, but Fetch + AbortController provides equivalent functionality without 5KB overhead. Would reconsider if multiple complex interceptors or request/response transformation pipelines were needed.
- **React Query**: Rejected. Caching and background refetching are powerful features, but spec doesn't require data caching (FR-024 uses cursor-based pagination, which works with fresh data). 12KB overhead not justified for this feature's requirements. Would reconsider for features needing optimistic updates or background sync.

---

## Decision 3: State Management

### Question
How to manage loading/error/data states for API calls in custom hooks?

### Options Evaluated
1. **useState + useEffect** (zero dependencies)
2. **React Query** (built-in state management, ~12KB)
3. **Custom hook abstraction over useState/useEffect**

### Decision: Custom Hook Abstraction over useState + useEffect

**Rationale**:
- **Zero dependencies**: Builds on React primitives
- **Reusability**: Encapsulates loading/error/data pattern for both hooks (useRewardsSummary, useRewardsTransactions)
- **Type safety**: TypeScript generics provide type inference
- **Constitution compliance**: Simple patterns over complexity (Principle II: "Avoid unnecessary abstractions; use React directly")
- **Testability**: Custom hooks easily testable with @testing-library/react-hooks

**Implementation Pattern**:
```typescript
// client/src/features/rewards/hooks/useAsyncData.ts
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

function useAsyncData<T>(
  fetcher: () => Promise<T>,
  dependencies: React.DependencyList = []
): AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcher();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  }, [fetcher]);

  useEffect(() => {
    refetch();
  }, dependencies);

  return { ...state, refetch };
}
```

**Alternatives Considered**:
- **Raw useState + useEffect**: Rejected due to code duplication across two hooks with identical loading/error patterns. Custom abstraction reduces duplication while staying simple.
- **React Query**: Rejected (same rationale as Decision 2). Caching not required, and 12KB overhead not justified.

---

## Decision 4: Routing Library

### Question
Which routing solution for /rewards → /withdraw navigation (FR-012)?

### Options Evaluated
1. **React Router v6** (industry standard, ~9KB gzipped)
2. **TanStack Router** (type-safe, newer, ~11KB)
3. **Next.js-style file-based routing** (requires framework change)

### Decision: React Router v6

**Rationale**:
- **Industry standard**: Mature, widely adopted, extensive documentation
- **TypeScript support**: Full TypeScript integration with typed params/location
- **Navigation patterns**: Supports imperative navigation (useNavigate) for "Retirar" button (FR-012)
- **Bundle size**: 9KB is reasonable for routing functionality
- **Constitution compliance**: Intentional dependency for core functionality (Principle I)
- **Ecosystem**: Strong integration with React Testing Library for route testing

**Implementation Pattern**:
```typescript
// client/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RewardsHome } from './features/rewards/components/RewardsHome';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/rewards" element={<RewardsHome />} />
        <Route path="/withdraw" element={<div>Withdrawal Flow (separate feature)</div>} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Alternatives Considered**:
- **TanStack Router**: Rejected. While type-safe routing is valuable, React Router v6 provides sufficient TypeScript support for this feature's needs (single navigation action). TanStack Router's advantages (file-based routing, advanced type safety) don't justify 2KB extra overhead and less mature ecosystem for this use case.
- **File-based routing (Next.js)**: Rejected. Requires full framework adoption (Next.js/Remix), which is out of scope for adding a single feature. Constitution mandates Vite + React (Technology Stack section).

---

## Decision 5: Testing Framework

### Question
Which testing tools for React component and hook testing to achieve Constitution Principle IV (85%+ coverage)?

### Options Evaluated
1. **Vitest + React Testing Library + MSW** (Vite-native, fast)
2. **Jest + React Testing Library + MSW** (mature, widely adopted)

### Decision: Vitest + React Testing Library + MSW

**Rationale**:
- **Vite integration**: Native Vite support, uses same config as dev server
- **Performance**: 5-10x faster than Jest due to native ESM support
- **API compatibility**: Jest-compatible API minimizes learning curve
- **MSW integration**: Mock Service Worker (MSW) for realistic API mocking (FR-054-058: log API failures)
- **React Testing Library**: Industry standard for component testing with accessibility-first approach
- **Constitution compliance**: Aligns with Technology Stack (Vite 7.2.4 build tool)

**Implementation Pattern**:
```typescript
// client/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      statements: 85,
      branches: 85,
      functions: 85,
      lines: 85,
    },
  },
});

// client/tests/setup.ts
import { server } from './mocks/server';
import '@testing-library/jest-dom';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Alternatives Considered**:
- **Jest**: Rejected due to slower performance with Vite projects. Jest requires additional configuration (babel, transform plugins) to work with Vite/ESM, while Vitest works natively. Would reconsider if migrating from existing Jest setup, but starting fresh with Vite makes Vitest the natural choice.

---

## Decision 6: Accessibility Testing

### Question
How to validate WCAG 2.1 AA compliance (FR-046, Constitution Principle II)?

### Options Evaluated
1. **Manual keyboard + screen reader testing only**
2. **axe-core automated testing + manual validation**
3. **jest-axe in component tests + manual validation**

### Decision: jest-axe in Component Tests + Manual Validation

**Rationale**:
- **Automated coverage**: jest-axe catches 30-40% of WCAG issues automatically (color contrast, ARIA attributes, semantic HTML)
- **Continuous validation**: Tests fail on accessibility regressions during development
- **Manual complement**: Keyboard navigation (FR-042) and screen reader announcements (FR-029, FR-036) validated manually (automated tools can't fully test interactive behavior)
- **Low overhead**: jest-axe is a Vitest plugin with minimal performance impact
- **Constitution compliance**: Mandatory WCAG 2.1 AA requires systematic validation

**Implementation Pattern**:
```typescript
// client/tests/features/rewards/RewardsHome.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RewardsHome } from '../../../src/features/rewards/components/RewardsHome';

expect.extend(toHaveNoViolations);

test('RewardsHome should have no accessibility violations', async () => {
  const { container } = render(<RewardsHome />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Manual Testing Checklist** (documented in quickstart.md):
- [ ] Tab key navigates through all interactive elements (FR-042)
- [ ] Enter/Space activate "Retirar" and "Load more" buttons
- [ ] Focus indicators visible on all interactive elements (FR-045)
- [ ] Screen reader announces loading states (role="status" / aria-live="polite") (FR-029)
- [ ] Screen reader announces errors (role="alert" / aria-live="assertive") (FR-036)
- [ ] Disabled "Retirar" button communicated to screen readers (aria-disabled)

**Alternatives Considered**:
- **Manual testing only**: Rejected. Too slow and error-prone for continuous validation. Manual testing is essential complement, but not sufficient alone for 56+ functional requirements.
- **axe-core without jest integration**: Rejected. Browser extension useful for spot-checks, but doesn't provide CI/CD automation. jest-axe enables "shift-left" accessibility testing.

---

## Decision 7: Icon Management

### Question
How to source and integrate arrow_right_line icon for "Retirar" button (FR-065)?

### Options Evaluated
1. **Heroicons library** (MIT licensed, React components)
2. **Lucide React** (MIT licensed, tree-shakeable, React components)
3. **Custom SVG inline** (zero dependencies)

### Decision: Lucide React

**Rationale**:
- **Tree-shakeable**: Only imports arrow-right icon (~0.5KB), not entire library
- **React components**: First-class React integration with props (size, color, className)
- **Consistent styling**: Easy to apply accent color (#043960) via props (FR-062)
- **MIT license**: No licensing concerns
- **Future scalability**: If additional icons needed (error icon, loading icon), library already integrated
- **Low overhead**: Single icon import is ~0.5KB, comparable to custom SVG + wrapper component

**Implementation Pattern**:
```typescript
// client/src/features/rewards/components/BalanceSummaryCard.tsx
import { ArrowRight } from 'lucide-react';

<button
  className="retirar-button"
  onClick={handleWithdraw}
  disabled={isDisabled}
>
  Retirar
  <ArrowRight size={16} color="#043960" />
</button>
```

**Alternatives Considered**:
- **Custom SVG inline**: Rejected. While it adds zero dependencies, it requires manually copying SVG markup, handling sizing/coloring via CSS, and creating a wrapper component for reusability. Lucide React provides this out-of-box for ~0.5KB. Would reconsider if this were the only icon needed and future icon usage unlikely, but Constitution allows up to 3 major dependencies per feature (Principle II), and we're only using 2 (React Router + Lucide).
- **Heroicons**: Rejected. Similar to Lucide but less tree-shakeable (larger bundle for single icon import). Lucide is specifically designed for tree-shaking efficiency.

---

## Decision 8: Currency Formatting

### Question
How to handle locale-specific currency formatting (FR-038, e.g., USD: $1,234.56, EUR: €1.234,56)?

### Options Evaluated
1. **Intl.NumberFormat API** (zero dependencies)
2. **Accounting.js or currency.js** (~2KB gzipped)

### Decision: Intl.NumberFormat API

**Rationale**:
- **Zero dependencies**: Native browser API
- **Locale-aware**: Automatically formats based on locale and currency code
- **Browser support**: Fully supported in all target browsers (clarification: modern evergreen browsers)
- **Constitution compliance**: Minimal dependencies (Principle I)
- **Future-proof**: Handles multiple currencies without code changes (spec assumes single currency per A-003, but implementation is currency-agnostic)

**Implementation Pattern**:
```typescript
// client/src/features/rewards/utils/formatCurrency.ts
export function formatCurrency(amount: number, currency: string, locale: string = 'es-ES'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency, // e.g., 'USD', 'EUR'
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Usage
formatCurrency(1234.56, 'USD', 'es-ES'); // → "$1,234.56"
formatCurrency(1234.56, 'EUR', 'es-ES'); // → "1.234,56 €"
```

**Alternatives Considered**:
- **Accounting.js/currency.js**: Rejected. While these libraries provide additional formatting options (e.g., negative number handling, custom symbols), Intl.NumberFormat covers all spec requirements (FR-038: consistent formatting, FR-040: signed amounts with +/- handled separately). Adding 2KB for equivalent functionality violates Constitution Principle I (minimal dependencies).

---

## Decision 9: Spanish Error Messages (Clarification-Driven)

### Question
How to structure user-friendly Spanish error messages (clarification: "No pudimos cargar tu balance. Por favor, intenta de nuevo.")?

### Approach: Centralized Error Messages Module

**Rationale**:
- **Consistency**: Single source of truth for all error messages (FR-033, FR-034, SC-015)
- **i18n-ready**: If future internationalization needed, messages easily extracted to translation files
- **Testability**: Error messages testable in isolation

**Implementation Pattern**:
```typescript
// client/src/features/rewards/constants/errorMessages.ts
export const ERROR_MESSAGES = {
  SUMMARY_LOAD_FAILED: 'No pudimos cargar tu balance. Por favor, intenta de nuevo.',
  TRANSACTIONS_LOAD_FAILED: 'No pudimos cargar tus transacciones. Por favor, intenta de nuevo.',
  NETWORK_ERROR: 'Parece que hay un problema de conexión. Por favor, verifica tu internet.',
  TIMEOUT: 'La solicitud tomó demasiado tiempo. Por favor, intenta de nuevo.',
} as const;
```

---

## Decision 10: Double-Tap Protection (FR-015)

### Question
How to prevent multiple navigations from rapid clicks on "Retirar" button?

### Approach: Disabled State During Navigation

**Rationale**:
- **Simple**: Single useState flag prevents multiple clicks
- **UX feedback**: Button shows disabled state during navigation
- **No dependencies**: Pure React pattern

**Implementation Pattern**:
```typescript
// client/src/features/rewards/components/BalanceSummaryCard.tsx
const [isNavigating, setIsNavigating] = useState(false);

const handleWithdraw = () => {
  if (isNavigating || balance <= 0 || isLoading) return;

  setIsNavigating(true);
  navigate('/withdraw');
  // Note: setIsNavigating(false) not needed - component unmounts on navigation
};

<button
  onClick={handleWithdraw}
  disabled={isNavigating || balance <= 0 || isLoading}
  aria-disabled={isNavigating || balance <= 0 || isLoading}
>
  Retirar
</button>
```

---

## Summary: Final Technology Stack

| Category | Technology | Size | Justification |
|----------|------------|------|---------------|
| **Framework** | React 19.2.0 | Base | Constitution mandate |
| **Build Tool** | Vite 7.2.4 | Base | Constitution mandate |
| **Language** | TypeScript 5.9.3 | Base | Constitution mandate |
| **Routing** | React Router v6 | ~9KB | Industry standard, mandatory for navigation (FR-012) |
| **Icons** | Lucide React | ~0.5KB | Tree-shakeable, single icon needed (FR-065) |
| **Testing** | Vitest + RTL + MSW + jest-axe | Dev | Vite-native, fast, accessibility coverage |
| **Date Formatting** | Intl.DateTimeFormat | 0KB | Native API, Spanish locale (FR-006, FR-039, FR-041) |
| **Currency Formatting** | Intl.NumberFormat | 0KB | Native API, locale-aware (FR-038) |
| **State Management** | Custom hooks (useState/useEffect) | 0KB | Simple patterns, no caching needed |
| **API Client** | Fetch + AbortController | 0KB | Native API, timeout support (FR-053) |

**Total Added Dependencies**: 2 (React Router + Lucide React) ≤ 3 max per Constitution Principle II ✅
**Total Bundle Impact**: ~9.5KB gzipped

---

## Open Questions Resolved

All Phase 0 research questions have been resolved with documented decisions and rationales. No further clarifications needed before proceeding to Phase 1 (Design Artifacts).

---

## Next Steps

Proceed to Phase 1:
1. Generate data-model.md (frontend state model)
2. Generate contracts/ (API contract documentation)
3. Generate quickstart.md (setup and testing procedures)
4. Update agent context with finalized technology choices
