# Research: Submit Withdrawal and Success Confirmation

**Feature**: 003-withdraw-submit | **Date**: 2026-01-11
**Status**: Phase 0 - Technical Research

## Purpose

This document resolves technical unknowns and establishes implementation patterns before detailed design (Phase 1). It addresses the user's specific request for "skeleton for smooth transition in navigation" alongside other critical implementation decisions.

## Research Questions

### Q1: How to implement skeleton loading states for smooth navigation transitions?

**Context**: User specifically requested "Add skeleton for a smooth transition in navigation". Need to determine best approach for skeleton states during React Router navigation.

**Research**:

**Option A: React Router `useNavigation` hook**
- React Router 7.x provides `useNavigation()` hook with `state` property
- Returns `state: "idle" | "loading" | "submitting"`
- Can detect navigation state changes in real-time
- Example:
```typescript
const navigation = useNavigation();
const isNavigating = navigation.state === "loading";

return (
  <>
    {isNavigating && <NavigationSkeleton />}
    {!isNavigating && <ActualContent />}
  </>
);
```

**Option B: Component-level loading state**
- Each component manages its own mounting/loading state
- Use `useState` + `useEffect` to show skeleton on mount
- Simpler but less smooth (no transition detection)
- Example:
```typescript
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  setIsLoading(false); // Hide skeleton after mount
}, []);
```

**Option C: Suspense + React.lazy**
- Wrap routes in `<Suspense fallback={<Skeleton />}>`
- Code-splitting with `React.lazy()` for route components
- Built-in React pattern for async loading
- Example:
```typescript
<Suspense fallback={<SuccessScreenSkeleton />}>
  <Routes>
    <Route path="/withdraw/success" element={<WithdrawSuccessScreen />} />
  </Routes>
</Suspense>
```

**Decision**: **Option A (useNavigation hook)**

**Rationale**:
- Detects actual navigation transitions (user requested "smooth transition in navigation")
- Built-in to React Router 7.x (no new dependencies)
- Can show skeleton during route change (addresses CLS = 0 goal)
- More responsive than component-level state (no flash of content)
- Aligns with React Router best practices

**Implementation Pattern**:
```typescript
// WithdrawScreen.tsx - Show skeleton during navigation to success
import { useNavigation } from 'react-router-dom';

function WithdrawScreen() {
  const navigation = useNavigation();
  const isNavigatingToSuccess = navigation.state === 'loading' &&
                                 navigation.location?.pathname === '/withdraw/success';

  if (isNavigatingToSuccess) {
    return <WithdrawSuccessScreenSkeleton />;
  }

  return <ActualWithdrawScreen />;
}

// WithdrawSuccessScreen.tsx - Show skeleton while validating state
function WithdrawSuccessScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const withdrawalData = location.state?.withdrawalData;

  // Redirect guard (FR-021)
  useEffect(() => {
    if (!withdrawalData) {
      navigate('/withdraw', { replace: true });
    }
  }, [withdrawalData, navigate]);

  // Show skeleton during redirect (< 16ms, synchronous)
  if (!withdrawalData) {
    return <WithdrawSuccessScreenSkeleton />;
  }

  return <ActualSuccessContent data={withdrawalData} />;
}
```

**Skeleton Component Pattern**:
```css
/* Reusable skeleton shimmer animation */
.skeleton {
  background: linear-gradient(90deg, #E2E8F0 0%, #CBD5E1 50%, #E2E8F0 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: 8px;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Skeleton placeholders match final content dimensions */
.skeleton-image {
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.skeleton-title {
  width: 327px;
  height: 32px;
  margin: 24px auto 16px;
}

.skeleton-description {
  width: 327px;
  height: 72px;
  margin: 0 auto;
}
```

---

### Q2: How to handle React Router navigation state persistence and validation?

**Context**: Withdrawal response data must be passed from /withdraw to /withdraw/success via navigation state (per clarification Q1 answer).

**Research**:

**Problem**: Navigation state is lost on page refresh or direct navigation.

**Validation Strategy**:
1. **Guard pattern**: Check for state on mount, redirect if missing
2. **TypeScript type safety**: Define location state interface
3. **Default values**: Avoid crashes if state is partially missing

**Implementation**:
```typescript
// types/withdrawal.types.ts
export interface WithdrawSuccessLocationState {
  withdrawalData: {
    id: string;
    bankAccountId: string;
    amount: number;
    currency: string;
    lastFourDigits: string; // From selectedAccount, not API response
    status: string;
    createdAt: string;
  };
}

// WithdrawSuccessScreen.tsx
function WithdrawSuccessScreen() {
  const location = useLocation() as { state?: WithdrawSuccessLocationState };
  const navigate = useNavigate();
  const withdrawalData = location.state?.withdrawalData;

  // Guard: Redirect if no data (FR-021)
  useEffect(() => {
    if (!withdrawalData) {
      console.warn('[WITHDRAW_SUCCESS] No withdrawal data found, redirecting to /withdraw');
      navigate('/withdraw', { replace: true });
    }
  }, [withdrawalData, navigate]);

  // Show skeleton during redirect (prevents flash of broken UI)
  if (!withdrawalData) {
    return <WithdrawSuccessScreenSkeleton />;
  }

  return (
    <div className="success-screen">
      <img src="/assets/success-check.png" alt="Success" />
      <h1>¡Tu retiro fue exitoso!</h1>
      <p>
        Procesamos tu solicitud y enviamos tu recompensa a tu cuenta bancaria
        terminada en {withdrawalData.lastFourDigits}
      </p>
    </div>
  );
}
```

**Edge Cases Handled**:
- ✅ Direct navigation to /withdraw/success (redirects to /withdraw)
- ✅ Page refresh on success screen (redirects to /withdraw)
- ✅ Browser back button after success (returns to /withdraw, clears selection)
- ✅ Missing fields in withdrawalData (TypeScript optional chaining)

---

### Q3: How to prevent duplicate submissions with immediate visual feedback?

**Context**: FR-019, FR-046, FR-049 require zero duplicate submissions on rapid clicks with immediate feedback (< 200ms).

**Research**:

**Option A: Debouncing**
- Delay execution by 300-500ms
- Ignores rapid clicks within debounce window
- Pros: Simple implementation
- Cons: Delayed feedback (violates SC-003: < 200ms requirement)

**Option B: Immediate state change + guard**
- Set `isSubmitting=true` synchronously on first click
- Guard: `if (isSubmitting) return;` prevents re-entry
- Button disabled immediately (visual feedback)
- Pros: Instant feedback, no race conditions
- Cons: None (proven in 002-withdraw Phase 5)

**Option C: Request ID tracking**
- Generate unique request ID on submit
- Track in-flight requests in state
- Pros: Supports multiple concurrent requests (not needed here)
- Cons: Over-engineering for single-action flow

**Decision**: **Option B (Immediate state change)**

**Rationale**:
- Synchronous guard eliminates race conditions
- Immediate visual feedback (< 16ms, one frame)
- Already implemented and tested in 002-withdraw (WithdrawScreen.tsx:65-69)
- Aligns with Constitution Principle II (avoid premature optimization)
- Simpler to test (no timing dependencies)

**Implementation**:
```typescript
function WithdrawScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ProblemDetails | null>(null);

  const handleSubmit = async () => {
    // Guard: Prevent duplicate submissions (FR-019)
    if (isSubmitting || !selectedAccount) return;

    setIsSubmitting(true); // Immediate state change (< 16ms)
    setError(null); // Clear previous errors

    try {
      const result = await submitWithdrawal({
        userId: 'test-user-001', // TODO: Get from auth context
        amount: summary.balance,
        bankAccountId: selectedAccount.id,
        currency: summary.currency,
      });

      // Log success (FR-050)
      console.log('[WITHDRAWAL_SUCCESS]', {
        timestamp: new Date().toISOString(),
        withdrawalId: result.id,
        amount: result.amount,
        currency: result.currency,
        bankAccountId: result.bankAccountId,
      });

      // Navigate to success screen with data (FR-012)
      navigate('/withdraw/success', {
        state: {
          withdrawalData: {
            ...result,
            lastFourDigits: selectedAccount.lastFourDigits,
          },
        },
      });
    } catch (err) {
      // Log failure (FR-051)
      console.error('[WITHDRAWAL_FAILURE]', {
        timestamp: new Date().toISOString(),
        errorType: err.type,
        statusCode: err.status,
        detail: err.detail,
      });

      setError(err as ProblemDetails);
    } finally {
      setIsSubmitting(false); // Allow retry on error
    }
  };

  const isButtonDisabled = !selectedAccount || isSubmitting;

  return (
    <>
      <AccountSelector />
      <WithdrawFooter>
        {error && (
          <div role="alert" className="error-message">
            {error.detail || 'An error occurred. Please try again.'}
          </div>
        )}
        <WithdrawWarningCard />
        <button
          disabled={isButtonDisabled}
          aria-disabled={isButtonDisabled}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Procesando...' : 'Retirar fondos'}
        </button>
      </WithdrawFooter>
    </>
  );
}
```

**Test Coverage**:
- ✅ Single click submits once
- ✅ Rapid triple-click submits once (SC-002)
- ✅ Button disabled immediately on click (SC-003)
- ✅ Button shows "Procesando..." during submission (FR-009)
- ✅ Button re-enabled on error to allow retry (FR-018)

---

### Q4: How to handle Problem Details error responses from the API?

**Context**: FR-014 to FR-020 specify Problem Details format (RFC 7807) for API errors.

**Research**:

**Problem Details Format** (per spec):
```json
{
  "type": "https://api.example.com/errors/bank-account-not-found",
  "title": "Bank Account Not Found",
  "status": 404,
  "detail": "The specified bank account does not exist or is not accessible",
  "instance": "/withdrawals",
  "bankAccountId": "bank-account-001"
}
```

**Error Handling Strategy**:

1. **Type Definition**:
```typescript
// types/withdrawal.types.ts
export interface ProblemDetails {
  type: string;          // Error category URL
  title: string;         // Human-readable title
  status: number;        // HTTP status code
  detail: string;        // User-facing error message (FR-016)
  instance: string;      // Request path
  bankAccountId?: string; // Optional context
}
```

2. **API Client Error Parsing**:
```typescript
// api/withdrawalsApi.ts
export async function submitWithdrawal(
  request: WithdrawalRequest
): Promise<WithdrawalResponse> {
  const url = `${API_BASE_URL}/withdrawals`;

  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      // Parse Problem Details from response body
      const problemDetails = await response.json().catch(() => ({
        type: 'unknown-error',
        title: 'Unknown Error',
        status: response.status,
        detail: `Request failed with status ${response.status}`,
        instance: '/withdrawals',
      }));

      throw problemDetails as ProblemDetails;
    }

    return await response.json();
  } catch (error) {
    // Re-throw timeout errors, network errors as-is
    if (error instanceof TimeoutError || error instanceof TypeError) {
      throw error;
    }
    // Re-throw Problem Details
    throw error;
  }
}
```

3. **Component Error Display**:
```typescript
// WithdrawScreen.tsx
const [error, setError] = useState<ProblemDetails | null>(null);

// In catch block:
setError(err as ProblemDetails);

// In render:
{error && (
  <div role="alert" className="error-message" aria-live="assertive">
    {error.detail || 'An error occurred. Please try again.'}
  </div>
)}
```

**Error-Specific Handling**:
- **404 + type="bank-account-not-found"**: Show "The specified bank account does not exist or is not accessible" (FR-019)
- **500**: Show generic error with detail field
- **Timeout**: Show "Request exceeded 5 seconds" (existing TimeoutError)
- **Network failure**: Show "Network error. Please check your connection."

---

### Q5: How to implement the persistent footer with warning card on both screens?

**Context**: FR-032 to FR-037 specify persistent footer on /withdraw and /withdraw/success with cooldown warning.

**Research**:

**Component Architecture**:

**Option A: Shared footer component**
- Single `<WithdrawFooter>` component
- Accepts children (button, error message)
- Always includes `<WithdrawWarningCard>`
- Used by both WithdrawScreen and WithdrawSuccessScreen

**Option B: Duplicate footer in each screen**
- Repeat footer logic in both components
- Pros: More flexible per-screen customization
- Cons: Violates DRY, harder to maintain

**Decision**: **Option A (Shared component)**

**Rationale**:
- Ensures consistent warning message across both screens (FR-032)
- Single source of truth for footer styling
- Easier to update warning message globally
- Reusable architecture (Constitution Principle I)

**Implementation**:
```typescript
// components/withdraw/WithdrawFooter.tsx
interface WithdrawFooterProps {
  children: React.ReactNode; // Primary action button
}

export function WithdrawFooter({ children }: WithdrawFooterProps) {
  return (
    <footer className="withdraw-footer">
      <WithdrawWarningCard />
      {children}
    </footer>
  );
}

// components/withdraw/WithdrawWarningCard.tsx
export function WithdrawWarningCard() {
  return (
    <div role="note" className="warning-card">
      <img
        src="/src/assets/brake-warning-illustration.png"
        alt="Advertencia"
        width={32}
        height={32}
      />
      <p>
        Debes esperar unos minutos antes de realizar otro retiro con el mismo monto
      </p>
    </div>
  );
}

// Usage in WithdrawScreen.tsx
<WithdrawFooter>
  {error && <div role="alert">{error.detail}</div>}
  <button onClick={handleSubmit}>
    {isSubmitting ? 'Procesando...' : 'Retirar fondos'}
  </button>
</WithdrawFooter>

// Usage in WithdrawSuccessScreen.tsx
<WithdrawFooter>
  <button onClick={() => navigate('/rewards')}>
    Regresar a Rewards
  </button>
</WithdrawFooter>
```

**Styling**:
```css
/* withdraw.css (extended) */
.withdraw-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 24px;
  border-top: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.warning-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #FEF3C7; /* Light yellow background */
  border-radius: 8px;
  border: 1px solid #FDE047;
}

.warning-card img {
  flex-shrink: 0;
}

.warning-card p {
  font-family: Poppins, sans-serif;
  font-size: 14px;
  line-height: 20px;
  color: #78350F; /* Dark yellow text */
  margin: 0;
}
```

---

### Q6: How to handle image loading failures with CSS fallback?

**Context**: FR-021a specifies CSS-based checkmark fallback if success-check.png fails to load.

**Research**:

**Fallback Strategy**:

**Option A: onError handler + state**
- Detect image load failure with `<img onError={...}>`
- Toggle state to show CSS fallback
- Pros: Reactive, immediate fallback
- Cons: Requires state management

**Option B: CSS background-image with fallback**
- Use `background-image` with multiple URLs
- Browser tries each URL in order
- Pros: Pure CSS solution
- Cons: Less control over fallback appearance

**Option C: Inline SVG only (no PNG)**
- Skip PNG image entirely, use SVG checkmark
- Pros: Zero network requests, always works
- Cons: Doesn't match design spec (requires PNG)

**Decision**: **Option A (onError + state)**

**Rationale**:
- Spec requires PNG as primary (success-check.png)
- Fallback should be seamless (no layout shift)
- State allows fine-grained control over fallback appearance
- Accessible: can add aria-label to fallback

**Implementation**:
```typescript
// WithdrawSuccessScreen.tsx
function WithdrawSuccessScreen() {
  const [imageLoaded, setImageLoaded] = useState(true);

  return (
    <div className="success-screen">
      {imageLoaded ? (
        <img
          src="/src/assets/success-check.png"
          alt="Success"
          className="success-image"
          onError={() => {
            console.warn('[WITHDRAW_SUCCESS] Image failed to load, using fallback');
            setImageLoaded(false);
          }}
        />
      ) : (
        <div className="success-icon-fallback" aria-label="Success">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#10B981" />
            <path
              d="M8 12L11 15L16 9"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
      {/* Rest of success content */}
    </div>
  );
}
```

**CSS**:
```css
/* withdrawSuccess.css */
.success-image {
  width: 120px;
  height: 120px;
  display: block;
  margin: 0 auto 24px;
}

.success-icon-fallback {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.success-icon-fallback svg {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}
```

**Accessibility**: Fallback SVG has `aria-label="Success"` for screen readers.

---

## Summary of Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| **Navigation skeletons** | useNavigation hook from React Router | Detects route transitions, smooth UX, zero dependencies |
| **State persistence** | Guard pattern with redirect | Handles missing state gracefully, prevents crashes |
| **Duplicate prevention** | Immediate state change + guard | Synchronous, instant feedback, no race conditions |
| **Error handling** | Problem Details parsing | Standard format, user-facing detail field, accessible |
| **Persistent footer** | Shared WithdrawFooter component | DRY principle, consistent across both screens |
| **Image fallback** | onError + inline SVG fallback | Graceful degradation, accessible, matches spec |

## Open Questions

**None** - All critical implementation decisions resolved.

## Next Phase

**Phase 1**: Generate design artifacts
- data-model.md (Withdrawal entities, navigation state shape)
- contracts/post-withdrawals.yaml (OpenAPI spec for POST /withdrawals)
- quickstart.md (test scenarios for submission flow)
