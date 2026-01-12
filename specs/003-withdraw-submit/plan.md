# Implementation Plan: Submit Withdrawal and Success Confirmation

**Branch**: `003-withdraw-submit` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-withdraw-submit/spec.md`

## Summary

This feature implements the withdrawal submission flow and success confirmation screen, completing the withdraw journey started in 002-withdraw. Users can submit withdrawal requests to their selected bank accounts via POST /withdrawals API, receive visual feedback during processing, handle errors gracefully, and view success confirmation with account details. The feature includes inline error display, duplicate submission prevention, cooldown warnings, and accessibility-compliant interactions. Key focus: skeleton loading states for smooth navigation transitions between /withdraw and /withdraw/success screens.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with React 19.2.0
**Primary Dependencies**: React Router 7.12.0 (navigation state), Lucide React 0.562.0 (icons), MSW 2.12.7 (API mocking)
**Storage**: N/A (frontend only - backend persistence out of scope)
**Testing**: Vitest 4.0.16 + React Testing Library 16.3.1 + jest-axe 10.0.0
**Target Platform**: Web (responsive design, 375px mobile-first)
**Project Type**: Web application (React frontend extending existing rewards feature)
**Performance Goals**:
- Visual feedback within 200ms of button click (SC-003)
- Submission flow completion < 30 seconds under normal network (SC-001)
- Zero duplicate submissions on rapid clicks (SC-002)
- Zero layout shifts during state transitions (SC-009)

**Constraints**:
- WCAG 2.1 AA accessibility compliance (mandatory)
- No new major dependencies (Constitution Principle I)
- 85%+ test coverage for new components/hooks (Constitution Principle IV)
- Must integrate seamlessly with 002-withdraw feature
- 5-second API timeout pattern (consistent with existing API clients)

**Scale/Scope**:
- 2 new screens (WithdrawSubmitScreen enhancement, WithdrawSuccessScreen)
- 1 new API client function (POST /withdrawals)
- 1 new React hook (useWithdrawalSubmit)
- 4 user stories (2 P1 MVP, 1 P2, 1 P3)
- 52 functional requirements
- Supports withdrawal cooldown warnings on both screens

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Global Principles

**✅ Principle I: Production-Grade Engineering**
- Zero new major dependencies (extends existing: React Router state, fetch API)
- Maintains high cohesion: withdrawal logic encapsulated in hooks/API clients
- Clear separation: API layer, hooks, components, types
- All services/hooks will have unit tests

**✅ Principle II: React Frontend Architecture**
- Feature-based architecture: extends `/client/src/features/rewards/`
- Responsive design: mobile-first 375px base (per existing pattern)
- Clear user feedback: loading ("Procesando..."), error (inline), success (dedicated screen)
- Skeleton loaders for navigation transitions (user-requested focus)
- Custom components only (no UI libraries)
- WCAG 2.1 AA compliance: role="alert", role="status", focus management, keyboard navigation

**✅ Principle IV: Mandatory Testing Discipline**
- Unit tests for useWithdrawalSubmit hook
- Component tests for success screen, footer warning card
- Integration tests for submission flow (duplicate prevention, error handling)
- jest-axe validation for accessibility
- 85%+ coverage target

### No Violations

No complexity tracking needed - feature follows existing patterns from 002-withdraw.

## Project Structure

### Documentation (this feature)

```text
specs/003-withdraw-submit/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (navigation skeletons, state management)
├── data-model.md        # Phase 1 output (Withdrawal, Problem Details, navigation state)
├── quickstart.md        # Phase 1 output (test scenarios for submission flow)
├── contracts/           # Phase 1 output (POST /withdrawals OpenAPI spec)
│   └── post-withdrawals.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created yet)
```

### Source Code (repository root)

```text
client/
├── src/
│   ├── features/
│   │   └── rewards/
│   │       ├── api/
│   │       │   ├── bankAccountsApi.ts        # Existing (002-withdraw)
│   │       │   ├── rewardsApi.ts              # Existing (001-rewards-backend)
│   │       │   └── withdrawalsApi.ts          # NEW: POST /withdrawals client
│   │       ├── components/
│   │       │   ├── withdraw/
│   │       │   │   ├── AccountList.tsx        # Existing (002-withdraw)
│   │       │   │   ├── AccountListItem.tsx    # Existing (002-withdraw)
│   │       │   │   ├── AccountSelector.tsx    # Existing (002-withdraw)
│   │       │   │   ├── WithdrawScreen.tsx     # MODIFY: Add submission, footer, navigation skeleton
│   │       │   │   ├── WithdrawSuccessScreen.tsx  # NEW: Success confirmation
│   │       │   │   ├── WithdrawFooter.tsx     # NEW: Persistent footer with warning card
│   │       │   │   └── WithdrawWarningCard.tsx    # NEW: Cooldown warning card
│   │       │   └── ...
│   │       ├── hooks/
│   │       │   ├── useBankAccounts.ts         # Existing (002-withdraw)
│   │       │   ├── useRewardsSummary.ts       # Existing (001-rewards-backend)
│   │       │   └── useWithdrawalSubmit.ts     # NEW: Submission logic hook
│   │       ├── styles/
│   │       │   ├── withdraw.css               # Existing (002-withdraw)
│   │       │   └── withdrawSuccess.css        # NEW: Success screen styles
│   │       ├── types/
│   │       │   ├── api.types.ts               # Existing (APIError, TimeoutError)
│   │       │   ├── bankAccount.types.ts       # Existing (002-withdraw)
│   │       │   └── withdrawal.types.ts        # NEW: WithdrawalRequest, WithdrawalResponse, ProblemDetails
│   │       └── utils/
│   │           ├── logger.ts                  # Existing (logAPIFailure)
│   │           └── formatCurrency.ts          # Existing
│   └── assets/
│       ├── success-check.png                  # NEW: Success checkmark image
│       └── brake-warning-illustration.png     # Existing (from spec)
└── tests/
    ├── features/
    │   └── rewards/
    │       └── withdraw/
    │           ├── WithdrawScreen.test.tsx    # MODIFY: Add submission tests
    │           ├── WithdrawSuccessScreen.test.tsx  # NEW: Success screen tests
    │           ├── WithdrawFooter.test.tsx    # NEW: Footer component tests
    │           ├── useWithdrawalSubmit.test.ts     # NEW: Hook tests
    │           └── accessibility.test.tsx     # MODIFY: Add success screen tests
    └── mocks/
        └── handlers/
            └── withdrawalHandlers.ts          # NEW: MSW handlers for POST /withdrawals
```

**Structure Decision**: Extends the existing feature-based architecture under `client/src/features/rewards/`. New components, hooks, types, and API clients follow the established pattern from 001-rewards-backend and 002-withdraw features. Tests mirror the source structure under `client/tests/features/rewards/withdraw/`. This maintains consistency with Constitution Principle II (feature-based architecture, max 3-level nesting).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - table omitted.

## Architecture Decisions

### Navigation State Management

**Decision**: Use React Router navigation state to pass withdrawal response data from /withdraw to /withdraw/success.

**Rationale**:
- Consistent with existing 002-withdraw pattern (selectedAccount passed via location.state)
- Unidirectional data flow (submit → success)
- No additional state management libraries (Constitution Principle I)
- Built-in browser history support

**Implementation**:
```typescript
// After successful POST /withdrawals
navigate('/withdraw/success', {
  state: {
    withdrawalData: {
      id: response.id,
      bankAccountId: response.bankAccountId,
      amount: response.amount,
      currency: response.currency,
      lastFourDigits: selectedAccount.lastFourDigits,
    }
  }
});
```

**Guard**: Success screen redirects to /withdraw if navigation state is missing (FR-021).

### Skeleton Loading States for Smooth Navigation

**Decision**: Implement skeleton placeholders during navigation transitions to prevent layout shifts and improve perceived performance.

**Rationale**:
- User explicitly requested "skeleton for smooth transition in navigation"
- Reduces cumulative layout shift (CLS = 0, SC-009)
- Provides immediate visual feedback (< 200ms, SC-003, SC-004)
- Consistent with existing LoadingState patterns in 002-withdraw

**Implementation**:
1. **WithdrawScreen navigation skeleton**: Display skeleton while navigating to /withdraw/success
   - Shows during React Router transition
   - Matches success screen layout (image placeholder, text skeletons)
   - Duration: 50-100ms (typical React Router navigation)

2. **Success screen initial skeleton**: Display skeleton while mounting success screen
   - Shows immediately on mount
   - Fades to actual content once data is validated
   - Duration: synchronous (< 16ms)

**CSS Pattern**:
```css
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
```

### Duplicate Prevention Strategy

**Decision**: Use immediate state change (`isSubmitting` flag) + button disable, NOT debouncing.

**Rationale**:
- Synchronous guard prevents race conditions (`if (isSubmitting) return;`)
- Immediate visual feedback (button disabled on first click)
- Simpler to test (no timing dependencies)
- Consistent with 002-withdraw implementation (already proven in Phase 5)
- Aligns with Constitution Principle II (avoid premature optimization)

**Implementation**:
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  if (isSubmitting || !selectedAccount) return; // Guard
  setIsSubmitting(true); // Immediate state change
  try {
    const result = await submitWithdrawal(...);
    navigate('/withdraw/success', { state: { withdrawalData: result } });
  } catch (error) {
    // Display error inline, keep isSubmitting=false to allow retry
  } finally {
    setIsSubmitting(false);
  }
};
```

### Error Display Pattern

**Decision**: Display errors inline above the submit button in the footer area, NOT full-page overlays or toasts.

**Rationale**:
- Keeps error close to the action (submit button)
- Maintains visual context (selected account, amount remain visible)
- Follows form validation patterns (user expectation)
- Accessible: role="alert" for screen readers (FR-017)
- Allows retry without navigation

**Implementation**:
```tsx
<WithdrawFooter>
  {error && (
    <div role="alert" className="error-message">
      {error.detail || 'An error occurred. Please try again.'}
    </div>
  )}
  <WithdrawWarningCard />
  <button disabled={isButtonDisabled} onClick={handleSubmit}>
    {isSubmitting ? 'Procesando...' : 'Retirar fondos'}
  </button>
</WithdrawFooter>
```

### Image Fallback Pattern

**Decision**: Use CSS-based checkmark icon (inline SVG or Unicode ✓) as fallback if success-check.png fails to load.

**Rationale**:
- Ensures success indicator always visible (no broken images)
- Inline SVG/Unicode has zero latency (no network request)
- Graceful degradation for missing assets
- Accessible: `aria-label` on fallback

**Implementation**:
```tsx
const [imageLoaded, setImageLoaded] = useState(true);

<img
  src="/assets/success-check.png"
  onError={() => setImageLoaded(false)}
  style={{ display: imageLoaded ? 'block' : 'none' }}
/>
{!imageLoaded && (
  <div className="success-icon-fallback" aria-label="Success">
    ✓
  </div>
)}
```

### Observability Strategy

**Decision**: Log successful and failed withdrawal submissions to browser console with structured data.

**Rationale**:
- Enables debugging in development and production
- No backend logging infrastructure required (frontend-only feature)
- Structured format allows filtering/analysis
- Consistent with existing `logAPIFailure` utility

**Implementation**:
```typescript
// Success
console.log('[WITHDRAWAL_SUCCESS]', {
  timestamp: new Date().toISOString(),
  withdrawalId: response.id,
  amount: response.amount,
  currency: response.currency,
  bankAccountId: response.bankAccountId,
});

// Failure
console.error('[WITHDRAWAL_FAILURE]', {
  timestamp: new Date().toISOString(),
  errorType: error.type,
  statusCode: error.status,
  detail: error.detail,
});
```

## Implementation Strategy

### MVP Scope (User Stories 1-2, P1 Priority)

**Minimum Viable Product**:
1. **US1**: Submit withdrawal request
   - POST /withdrawals API integration
   - Loading state ("Procesando...")
   - Duplicate prevention (isSubmitting guard)
   - Navigation to success screen on 200/201

2. **US2**: View success confirmation
   - Success screen with title, description, account digits
   - "Regresar a Rewards" button
   - Redirect guard (if no navigation state)
   - Image with CSS fallback

**MVP Delivery**: Enables complete withdraw flow (002-withdraw account selection → 003-withdraw-submit submission → success confirmation → return to rewards).

### Incremental Delivery Beyond MVP

**Phase 2 (User Story 3, P2 Priority)**:
- Error handling with Problem Details format
- Inline error display above submit button
- Retry functionality without duplicates
- Bank account not found (404) specific error message

**Phase 3 (User Story 4, P3 Priority)**:
- Cooldown warning card with brake icon
- Persistent footer on /withdraw and /withdraw/success
- Warning message: "Debes esperar unos minutos antes de realizar otro retiro con el mismo monto"
- role="note" for non-blocking informational content

**Phase 4 (Polish & Cross-Cutting)**:
- Accessibility validation (jest-axe, keyboard navigation)
- Focus management (success title on mount)
- Observability (console logging for success/failure)
- Linting and type safety
- Manual cross-browser testing

### Parallel Opportunities

Tasks can be parallelized within each user story phase:
- **US1**: API client + hook development (parallel), then component integration (sequential)
- **US2**: Success screen component + styles (parallel), tests (after component)
- **US3**: Error message constants + error state handling (parallel)
- **US4**: Warning card component + footer component (parallel)

### Testing Strategy

**Test-Driven Development (TDD) Approach**:
1. Write tests FIRST for each component/hook
2. Implement functionality to pass tests
3. Refactor for quality (maintain green tests)

**Test Levels**:
- **Unit**: useWithdrawalSubmit hook, API client (withdrawalsApi.ts)
- **Component**: WithdrawSuccessScreen, WithdrawFooter, WithdrawWarningCard
- **Integration**: Full submission flow (duplicate prevention, error handling, navigation)
- **Accessibility**: jest-axe validation, keyboard navigation, screen reader announcements

**MSW Mocking**:
- Success: POST /withdrawals → 201 with withdrawal response
- Error scenarios: 404 (bank account not found), 500 (server error), timeout
- Cooldown enforcement: 429 with Problem Details

## Dependencies

### Feature Dependencies
- **002-withdraw**: Requires completed account selection flow (WithdrawScreen, AccountSelector)
- **001-rewards-backend**: Requires useRewardsSummary hook for balance refetch

### External Dependencies
- **POST /withdrawals API**: Backend endpoint must be implemented and available at `http://localhost:3000/withdrawals`
- **Assets**: success-check.png and brake-warning-illustration.png images must exist

### No New Package Dependencies
- ✅ React Router 7.12.0 (already installed)
- ✅ Lucide React 0.562.0 (already installed for icons)
- ✅ MSW 2.12.7 (already installed for API mocking)
- ✅ Vitest + React Testing Library + jest-axe (already installed)

## Risk Mitigation

### Risk: Backend API not ready
**Mitigation**: MSW handlers provide full API mocking for development and testing. Frontend can be fully implemented and tested independently.

### Risk: Navigation state lost on page refresh
**Mitigation**: Success screen redirects to /withdraw if state is missing (FR-021). User can restart flow without confusion.

### Risk: Duplicate submissions on slow networks
**Mitigation**: `isSubmitting` flag provides synchronous guard. Button disabled immediately on first click. Tested with rapid click scenario (SC-002, SC-003).

### Risk: Accessibility violations
**Mitigation**: jest-axe validation + manual screen reader testing. role="alert" for errors, role="status" for loading, focus management on success screen (FR-043).

### Risk: Layout shifts during navigation
**Mitigation**: Skeleton placeholders match final content dimensions. CLS = 0 target (SC-009). CSS grid/flexbox with fixed heights during loading.

## Next Steps

1. **Phase 0**: Generate research.md (navigation skeletons, state management patterns, error handling best practices)
2. **Phase 1**: Generate design artifacts
   - data-model.md (Withdrawal entities, navigation state shape)
   - contracts/post-withdrawals.yaml (OpenAPI spec)
   - quickstart.md (test scenarios for submission flow)
3. **Phase 2**: Run `/speckit.tasks` to generate tasks.md (implementation task breakdown)
4. **Phase 3**: Execute tasks in priority order (US1 → US2 → US3 → US4)
5. **Phase 4**: Verification and production readiness checklist

## Appendix: Functional Requirements Summary

**52 functional requirements** organized by category:

- **FR-001 to FR-008**: Submission interaction (button labels, API calls, duplicate prevention)
- **FR-009 to FR-011**: Loading state (button text, disabled styling, aria-live)
- **FR-012 to FR-013**: Success handling (navigation with state, deferred refetch)
- **FR-014 to FR-020**: Error handling (inline display, retry, Problem Details format)
- **FR-021 to FR-027**: Success screen display (redirect guard, image fallback, typography)
- **FR-028 to FR-031**: Success screen footer (warning card, return button)
- **FR-032 to FR-037**: Persistent footer (both screens, warning message, icons, aria)
- **FR-038 to FR-040**: Cooldown enforcement (error display, announcements)
- **FR-041 to FR-045**: Accessibility (keyboard, focus, ARIA, screen readers)
- **FR-046 to FR-049**: Reliability (double click prevention, slow networks, timeout)
- **FR-050 to FR-052**: Observability (console logging for success/failure, timestamps)

**10 success criteria** (measurable outcomes):
- SC-001: Complete flow < 30 seconds
- SC-002: 100% duplicate prevention on rapid clicks
- SC-003: Visual feedback < 200ms
- SC-004: 100% correct account digits displayed
- SC-005: 100% successful retries without duplicates
- SC-006: Screen reader announcements for all states
- SC-007: Updated balance < 2 seconds after return
- SC-008: Warning card visible on 100% of views
- SC-009: Zero layout shifts (CLS = 0)
- SC-010: 95% first-attempt success rate
