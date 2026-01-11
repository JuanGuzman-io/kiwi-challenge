# Tasks: Rewards Overview (Rewards Home)

**Input**: Design documents from `/specs/001-rewards-home/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Test tasks are included as per constitution requirement (85%+ coverage for services, components, and hooks)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

This is a web frontend project with paths relative to `client/` directory:
- **Source**: `client/src/`
- **Tests**: `client/tests/`
- **Feature**: `client/src/features/rewards/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [X] T001 Install React Router v6 dependency in client/package.json via `cd client && pnpm add react-router-dom`
- [X] T002 [P] Install Lucide React icons dependency in client/package.json via `cd client && pnpm add lucide-react`
- [X] T003 [P] Install Vitest testing framework in client/package.json via `cd client && pnpm add -D vitest`
- [X] T004 [P] Install React Testing Library in client/package.json via `cd client && pnpm add -D @testing-library/react @testing-library/jest-dom`
- [X] T005 [P] Install MSW (Mock Service Worker) in client/package.json via `cd client && pnpm add -D msw`
- [X] T006 [P] Install jest-axe for accessibility testing in client/package.json via `cd client && pnpm add -D jest-axe`
- [X] T007 [P] Install @testing-library/react-hooks for hook testing in client/package.json via `cd client && pnpm add -D @testing-library/react-hooks`
- [X] T008 Configure Vitest in client/vite.config.ts with globals, jsdom environment, and 85% coverage thresholds
- [X] T009 Create directory structure for rewards feature in client/src/features/rewards/ with subdirectories: components/, hooks/, types/, utils/, constants/, api/, styles/
- [X] T010 [P] Create directory structure for shared components in client/src/components/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Routing Setup

- [X] T011 Setup React Router in client/src/App.tsx with BrowserRouter and Routes components
- [X] T012 Add /rewards route to client/src/App.tsx rendering RewardsHome component placeholder
- [X] T013 [P] Add /withdraw route to client/src/App.tsx with placeholder for withdrawal flow (out of scope)

### TypeScript Type Definitions

- [X] T014 [P] Create core domain types (RewardsSummary, TransactionType, Transaction, TransactionGroup) in client/src/features/rewards/types/rewards.types.ts
- [X] T015 [P] Create API types (PaginatedTransactions, APIError, TimeoutError) in client/src/features/rewards/types/api.types.ts
- [X] T016 [P] Create UI state types (AsyncState, AsyncDataReturn, PaginationState) in client/src/features/rewards/types/ui.types.ts

### API Client Infrastructure

- [X] T017 Create fetchWithTimeout utility function with AbortController and 5-second timeout in client/src/features/rewards/api/rewardsApi.ts
- [X] T018 Implement x-user-id header injection in fetchWithTimeout utility in client/src/features/rewards/api/rewardsApi.ts
- [X] T019 Create getSummary API function calling GET /rewards/summary in client/src/features/rewards/api/rewardsApi.ts
- [X] T020 Create getTransactions API function with cursor parameter calling GET /rewards/transactions in client/src/features/rewards/api/rewardsApi.ts

### Shared Components

- [X] T021 [P] Create LoadingState component with skeleton placeholder in client/src/components/LoadingState.tsx
- [X] T022 [P] Create ErrorState component with error message and retry button in client/src/components/ErrorState.tsx
- [X] T023 [P] Create EmptyState component with empty message in client/src/components/EmptyState.tsx

### Constants

- [X] T024 [P] Create Spanish error messages constants (SUMMARY_LOAD_FAILED, TRANSACTIONS_LOAD_FAILED, NETWORK_ERROR, TIMEOUT) in client/src/features/rewards/constants/errorMessages.ts
- [X] T025 [P] Create transaction type label mappings (CASHBACK→"Cashback", etc.) in client/src/features/rewards/constants/transactionLabels.ts

### Type Guards

- [X] T026 [P] Create isValidTransaction type guard in client/src/features/rewards/utils/typeGuards.ts
- [X] T027 [P] Create isValidRewardsSummary type guard in client/src/features/rewards/utils/typeGuards.ts
- [X] T028 [P] Create isValidPaginatedTransactions type guard in client/src/features/rewards/utils/typeGuards.ts

### MSW Test Infrastructure

- [X] T029 Create MSW handlers for GET /rewards/summary in client/tests/mocks/handlers.ts
- [X] T030 Create MSW handlers for GET /rewards/transactions with pagination in client/tests/mocks/handlers.ts
- [X] T031 Create MSW test server setup in client/tests/mocks/server.ts
- [X] T032 Create Vitest setup file importing MSW server in client/tests/setup.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Accumulated Rewards Balance (Priority: P1) 🎯 MVP

**Goal**: Enable users to view their current accumulated rewards balance prominently displayed on the Rewards screen

**Independent Test**: Open /rewards route and verify that the balance card displays the user's accumulated rewards amount in the correct currency format with "Monto acumulado" label

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T033 [P] [US1] Create useRewardsSummary hook test file with mock API in client/tests/features/rewards/useRewardsSummary.test.ts
- [X] T034 [P] [US1] Add test case: successful balance fetch returns data and loading=false in client/tests/features/rewards/useRewardsSummary.test.ts
- [X] T035 [P] [US1] Add test case: API error sets error state and loading=false in client/tests/features/rewards/useRewardsSummary.test.ts
- [X] T036 [P] [US1] Add test case: 5-second timeout triggers TimeoutError in client/tests/features/rewards/useRewardsSummary.test.ts
- [X] T037 [P] [US1] Add test case: refetch clears error and re-fetches data in client/tests/features/rewards/useRewardsSummary.test.ts

### Implementation for User Story 1

- [X] T038 [P] [US1] Create formatCurrency utility using Intl.NumberFormat in client/src/features/rewards/utils/formatCurrency.ts
- [X] T039 [US1] Create generic useAsyncData hook for loading/error/data pattern in client/src/features/rewards/hooks/useAsyncData.ts
- [X] T040 [US1] Implement useRewardsSummary hook using useAsyncData and getSummary API in client/src/features/rewards/hooks/useRewardsSummary.ts
- [X] T041 [US1] Create RewardsHeader component displaying "Rewards" title in client/src/features/rewards/components/RewardsHeader.tsx
- [X] T042 [US1] Create BalanceSummaryCard component with balance display, "Monto acumulado" label, and "Retirar" button placeholder in client/src/features/rewards/components/BalanceSummaryCard.tsx
- [X] T043 [US1] Integrate useRewardsSummary hook in BalanceSummaryCard component in client/src/features/rewards/components/BalanceSummaryCard.tsx
- [X] T044 [US1] Add loading state (LoadingState component) to BalanceSummaryCard in client/src/features/rewards/components/BalanceSummaryCard.tsx
- [X] T045 [US1] Add error state (ErrorState component) with retry to BalanceSummaryCard in client/src/features/rewards/components/BalanceSummaryCard.tsx
- [X] T046 [US1] Add currency formatting to balance amount in BalanceSummaryCard using formatCurrency in client/src/features/rewards/components/BalanceSummaryCard.tsx
- [X] T047 [US1] Create RewardsHome page component composing RewardsHeader and BalanceSummaryCard in client/src/features/rewards/components/RewardsHome.tsx

### Integration Tests for User Story 1

- [X] T048 [US1] Create BalanceSummaryCard component test with MSW mocks in client/tests/features/rewards/BalanceSummaryCard.test.tsx
- [X] T049 [US1] Add test: balance displays with correct currency formatting in client/tests/features/rewards/BalanceSummaryCard.test.tsx
- [X] T050 [US1] Add test: loading state shows skeleton placeholder in client/tests/features/rewards/BalanceSummaryCard.test.tsx
- [X] T051 [US1] Add test: error state shows Spanish error message and retry button in client/tests/features/rewards/BalanceSummaryCard.test.tsx
- [X] T052 [US1] Add test: zero balance displays "0.00" in client/tests/features/rewards/BalanceSummaryCard.test.tsx
- [X] T053 [US1] Add accessibility test: jest-axe finds no violations in BalanceSummaryCard in client/tests/features/rewards/BalanceSummaryCard.test.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can view their balance.

---

## Phase 4: User Story 2 - View Transaction History (Priority: P1) 🎯 MVP

**Goal**: Enable users to see a complete history of their reward transactions organized by month (newest first) with clear type labels and signed amounts

**Independent Test**: Seed user with multiple transactions (cashback, referral bonuses, withdrawals, income) and verify that GET /rewards/transactions returns the complete transaction list grouped by month with proper formatting and newest-first ordering

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T054 [P] [US2] Create useRewardsTransactions hook test file with mock API in client/tests/features/rewards/useRewardsTransactions.test.ts
- [X] T055 [P] [US2] Add test case: initial load fetches first page of transactions in client/tests/features/rewards/useRewardsTransactions.test.ts
- [X] T056 [P] [US2] Add test case: transactions ordered newest-first (descending createdAt) in client/tests/features/rewards/useRewardsTransactions.test.ts
- [X] T057 [P] [US2] Add test case: empty transactions array handled correctly in client/tests/features/rewards/useRewardsTransactions.test.ts
- [X] T058 [P] [US2] Add test case: API error sets error state and loading=false in client/tests/features/rewards/useRewardsTransactions.test.ts
- [X] T059 [P] [US2] Add test case: 5-second timeout triggers TimeoutError in client/tests/features/rewards/useRewardsTransactions.test.ts

### Utility Functions for User Story 2

- [X] T060 [P] [US2] Create formatDate utility using Intl.DateTimeFormat for Spanish locale in client/src/features/rewards/utils/formatDate.ts
- [X] T061 [P] [US2] Create formatMonthHeader utility for Spanish month names (e.g., "Septiembre 2025") in client/src/features/rewards/utils/formatMonthHeader.ts
- [X] T062 [P] [US2] Create formatSignedAmount utility adding +/- prefix to amounts in client/src/features/rewards/utils/formatSignedAmount.ts
- [X] T063 [P] [US2] Create groupTransactionsByMonth utility with useMemo for performance in client/src/features/rewards/utils/groupTransactionsByMonth.ts

### Implementation for User Story 2

- [X] T064 [US2] Implement useRewardsTransactions hook using useAsyncData and getTransactions API (initial load only, no pagination yet) in client/src/features/rewards/hooks/useRewardsTransactions.ts
- [X] T065 [US2] Create TransactionItem component displaying type, date, and signed amount in client/src/features/rewards/components/TransactionItem.tsx
- [X] T066 [US2] Add visual distinction (CSS classes) for incoming (+) vs outgoing (-) amounts in TransactionItem in client/src/features/rewards/components/TransactionItem.tsx
- [X] T067 [US2] Create TransactionList component with month grouping headers in client/src/features/rewards/components/TransactionList.tsx
- [X] T068 [US2] Integrate groupTransactionsByMonth utility in TransactionList component in client/src/features/rewards/components/TransactionList.tsx
- [X] T069 [US2] Add loading state (LoadingState component) to TransactionList in client/src/features/rewards/components/TransactionList.tsx
- [X] T070 [US2] Add error state (ErrorState component) with retry to TransactionList in client/src/features/rewards/components/TransactionList.tsx
- [X] T071 [US2] Add empty state (EmptyState component) "Aún no tienes actividad" to TransactionList in client/src/features/rewards/components/TransactionList.tsx
- [X] T072 [US2] Integrate TransactionList component in RewardsHome page in client/src/features/rewards/components/RewardsHome.tsx

### Integration Tests for User Story 2

- [X] T073 [US2] Create TransactionList component test with MSW mocks in client/tests/features/rewards/TransactionList.test.tsx
- [X] T074 [US2] Add test: transactions grouped by month with Spanish headers in client/tests/features/rewards/TransactionList.test.tsx
- [X] T075 [US2] Add test: transactions display in newest-first order in client/tests/features/rewards/TransactionList.test.tsx
- [X] T076 [US2] Add test: incoming transactions show + prefix and positive styling in client/tests/features/rewards/TransactionList.test.tsx
- [X] T077 [US2] Add test: outgoing transactions show - prefix and negative styling in client/tests/features/rewards/TransactionList.test.tsx
- [X] T078 [US2] Add test: empty state displays "Aún no tienes actividad" message in client/tests/features/rewards/TransactionList.test.tsx
- [X] T079 [US2] Add test: loading state shows skeleton placeholders in client/tests/feature/rewards/TransactionList.test.tsx
- [X] T080 [US2] Add test: error state shows Spanish error message and retry in client/tests/features/rewards/TransactionList.test.tsx
- [X] T081 [US2] Add accessibility test: jest-axe finds no violations in TransactionList in client/tests/features/rewards/TransactionList.test.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can view balance and transaction history (first page only).

---

## Phase 5: User Story 3 - Paginate Through Transaction History (Priority: P2)

**Goal**: Enable users to load more transactions as they scroll through history to view complete transaction history without performance issues

**Independent Test**: Seed user with 50+ transactions and verify that only the first page loads initially, and clicking "Load more" appends additional transactions without resetting the existing list

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T082 [P] [US3] Add test case: loadMore appends transactions without resetting existing list in client/tests/features/rewards/useRewardsTransactions.test.ts
- [ ] T083 [P] [US3] Add test case: hasMore flag correctly indicates more pages exist in client/tests/features/rewards/useRewardsTransactions.test.ts
- [ ] T084 [P] [US3] Add test case: loadingMore state true during pagination request in client/tests/features/rewards/useRewardsTransactions.test.ts
- [ ] T085 [P] [US3] Add test case: nextCursor passed correctly to getTransactions API in client/tests/features/rewards/useRewardsTransactions.test.ts
- [ ] T086 [P] [US3] Add test case: "Load more" button hidden when hasMore=false in client/tests/features/rewards/TransactionList.test.tsx

### Implementation for User Story 3

- [ ] T087 [US3] Extend useRewardsTransactions hook with pagination state (allTransactions, nextCursor, hasMore, loadingMore) in client/src/features/rewards/hooks/useRewardsTransactions.ts
- [ ] T088 [US3] Implement loadMore function in useRewardsTransactions that appends to allTransactions in client/src/features/rewards/hooks/useRewardsTransactions.ts
- [ ] T089 [US3] Create LoadMoreButton component with loading indicator and disabled state in client/src/features/rewards/components/LoadMoreButton.tsx
- [ ] T090 [US3] Add LoadMoreButton to TransactionList component with hasMore visibility logic in client/src/features/rewards/components/TransactionList.tsx
- [ ] T091 [US3] Update TransactionList to use allTransactions from useRewardsTransactions in client/src/features/rewards/components/TransactionList.tsx
- [ ] T092 [US3] Add loadingMore inline indicator to TransactionList in client/src/features/rewards/components/TransactionList.tsx

### Integration Tests for User Story 3

- [ ] T093 [US3] Add test: "Load more" button appends transactions without layout jump in client/tests/features/rewards/TransactionList.test.tsx
- [ ] T094 [US3] Add test: "Load more" button disabled while loadingMore=true in client/tests/features/rewards/TransactionList.test.tsx
- [ ] T095 [US3] Add test: "Load more" button hidden when hasMore=false in client/tests/features/rewards/TransactionList.test.tsx
- [ ] T096 [US3] Add test: pagination maintains month grouping across pages in client/tests/features/rewards/TransactionList.test.tsx

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Users can paginate through long transaction histories.

---

## Phase 6: User Story 4 - Initiate Withdrawal (Priority: P2)

**Goal**: Enable users to click a "Retirar" button from the balance summary to start the withdrawal process (navigation to /withdraw route)

**Independent Test**: Click the "Retirar" button and verify navigation to /withdraw route. Button should be disabled when balance is zero or while the summary is loading.

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T097 [P] [US4] Add test case: "Retirar" button navigates to /withdraw when clicked in client/tests/features/rewards/BalanceSummaryCard.test.tsx
- [ ] T098 [P] [US4] Add test case: "Retirar" button disabled when balance is zero in client/tests/features/rewards/BalanceSummaryCard.test.tsx
- [ ] T099 [P] [US4] Add test case: "Retirar" button disabled while loading=true in client/tests/features/rewards/BalanceSummaryCard.test.tsx
- [ ] T100 [P] [US4] Add test case: double-tap on "Retirar" only triggers one navigation in client/tests/features/rewards/BalanceSummaryCard.test.tsx

### Implementation for User Story 4

- [ ] T101 [US4] Import useNavigate hook from React Router in BalanceSummaryCard in client/src/features/rewards/components/BalanceSummaryCard.tsx
- [ ] T102 [US4] Implement handleWithdraw function with navigation to /withdraw in BalanceSummaryCard in client/src/features/rewards/components/BalanceSummaryCard.tsx
- [ ] T103 [US4] Add double-tap protection (isNavigating state) to handleWithdraw in BalanceSummaryCard in client/src/features/rewards/components/BalanceSummaryCard.tsx
- [ ] T104 [US4] Wire "Retirar" button onClick to handleWithdraw in BalanceSummaryCard in client/src/features/rewards/components/BalanceSummaryCard.tsx
- [ ] T105 [US4] Add disabled logic (balance<=0 || loading || isNavigating) to "Retirar" button in BalanceSummaryCard in client/src/features/rewards/components/BalanceSummaryCard.tsx
- [ ] T106 [US4] Add aria-disabled attribute to "Retirar" button for accessibility in BalanceSummaryCard in client/src/features/rewards/components/BalanceSummaryCard.tsx

**Checkpoint**: All four primary user stories should now be independently functional. Users can view balance, view transaction history, paginate, and initiate withdrawals.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories - styling, accessibility validation, performance testing, and documentation

### Styling

- [ ] T107 [P] Create base CSS styles for rewards feature (design system tokens, colors, spacing) in client/src/features/rewards/styles/rewards.css
- [ ] T108 [P] Style RewardsHeader component matching FR-001 specifications in client/src/features/rewards/styles/rewards.css
- [ ] T109 [P] Style BalanceSummaryCard component matching FR-054 specifications (width: 327px, padding: 16px, border-radius: 8px, border: 1px #E2E8EF) in client/src/features/rewards/styles/rewards.css
- [ ] T110 [P] Style "Retirar" button matching FR-055-056 specifications (width: 64px, height: 20px, pill shape, padding: 2px 4px, accent color #043960, trailing icon) in client/src/features/rewards/styles/rewards.css
- [ ] T111 [P] Style transaction list with month grouping headers matching FR-006 in client/src/features/rewards/styles/rewards.css
- [ ] T112 [P] Add responsive styles for mobile-first design (375px base, scaling to larger viewports) matching FR-059 in client/src/features/rewards/styles/rewards.css
- [ ] T113 [P] Add visual distinction styles for incoming (+, positive color) vs outgoing (-, negative color) transactions matching FR-009 in client/src/features/rewards/styles/rewards.css
- [ ] T114 [P] Add focus state styles for all interactive elements matching FR-045 in client/src/features/rewards/styles/rewards.css

### Accessibility Validation

- [ ] T115 Create manual accessibility testing checklist in client/tests/features/rewards/accessibility-checklist.md
- [ ] T116 Validate keyboard navigation (Tab through all interactive elements) per FR-042
- [ ] T117 Validate Enter/Space activate all buttons (Retirar, Load more, Retry) per FR-043
- [ ] T118 Validate aria-label attributes on all interactive elements per FR-044
- [ ] T119 Validate visible focus states on all interactive elements per FR-045
- [ ] T120 Validate screen reader announcements (role="status" for loading, role="alert" for errors) per FR-029, FR-036
- [ ] T121 Run jest-axe on all components and verify no violations

### Performance Testing

- [ ] T122 Measure balance load time (should be < 2 seconds) per SC-001 using Chrome DevTools Performance tab
- [ ] T123 Measure Cumulative Layout Shift (CLS should be 0) per SC-008 using Chrome DevTools Lighthouse
- [ ] T124 Test with 1,000+ transactions to verify no performance degradation per SC-004
- [ ] T125 Profile groupTransactionsByMonth with React DevTools Profiler to verify memoization works per FR-052

### Logging & Observability

- [ ] T126 [P] Implement API failure logging in fetchWithTimeout per FR-054, FR-055
- [ ] T127 [P] Implement page load time tracking per FR-056
- [ ] T128 [P] Implement client-side error logging per FR-057
- [ ] T129 [P] Verify no sensitive data logged (balance, transactions, user IDs) per FR-058

### Documentation

- [ ] T130 [P] Update client/README.md with rewards feature overview
- [ ] T131 [P] Document environment variables (.env.development, .env.production) for API_BASE_URL
- [ ] T132 [P] Document testing procedures (unit, component, accessibility, performance)

### Final Validation

- [ ] T133 Run complete test suite and verify 85%+ coverage per Constitution Principle IV via `pnpm test:coverage`
- [ ] T134 Run linter and fix any issues via `pnpm lint`
- [ ] T135 Build for production and verify no errors via `pnpm build`
- [ ] T136 Run quickstart.md validation following all setup steps from clean state
- [ ] T137 Validate all 65 functional requirements (FR-001 through FR-065) manually against running application
- [ ] T138 Validate all 15 success criteria (SC-001 through SC-015) manually against running application

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion (can run parallel to US1)
- **User Story 3 (Phase 5)**: Depends on User Story 2 completion (extends useRewardsTransactions hook)
- **User Story 4 (Phase 6)**: Depends on User Story 1 completion (extends BalanceSummaryCard component)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ Independent
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ Independent (can run parallel to US1)
- **User Story 3 (P2)**: Depends on US2 (extends same hook) ⚠️ Extends US2
- **User Story 4 (P2)**: Depends on US1 (extends same component) ⚠️ Extends US1

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Types/utilities before hooks
- Hooks before components
- Components before integration tests
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**: Tasks T002-T007 marked [P] can run in parallel

**Phase 2 (Foundational)**: Within each subsection, [P] tasks can run in parallel:
- T014-T016 (types) parallel
- T024-T025 (constants) parallel with types
- T026-T028 (type guards) parallel with constants

**Phase 3 (US1)**: All test tasks (T033-T037) can run in parallel, T038 (formatCurrency) parallel with tests

**Phase 4 (US2)**: All test tasks (T054-T059) can run in parallel, all utility tasks (T060-T063) can run in parallel

**Phase 5 (US3)**: Test tasks (T082-T086) can run in parallel

**Phase 6 (US4)**: Test tasks (T097-T100) can run in parallel

**Phase 7 (Polish)**: Tasks T107-T114 (styles), T126-T129 (logging), T130-T132 (docs) can all run in parallel

**Cross-Story Parallelism**: After Foundational phase completes:
- US1 and US2 can start in parallel (different components/hooks)
- After US1+US2 complete: US3 and US4 can start in parallel (extend different components)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Create useRewardsSummary hook test file with mock API in client/tests/features/rewards/useRewardsSummary.test.ts"
Task: "Add test case: successful balance fetch returns data and loading=false in client/tests/features/rewards/useRewardsSummary.test.ts"
Task: "Add test case: API error sets error state and loading=false in client/tests/features/rewards/useRewardsSummary.test.ts"
Task: "Add test case: 5-second timeout triggers TimeoutError in client/tests/features/rewards/useRewardsSummary.test.ts"
Task: "Add test case: refetch clears error and re-fetches data in client/tests/features/rewards/useRewardsSummary.test.ts"

# Launch formatCurrency utility in parallel with tests:
Task: "Create formatCurrency utility using Intl.NumberFormat in client/src/features/rewards/utils/formatCurrency.ts"
```

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task: "Create useRewardsTransactions hook test file with mock API in client/tests/features/rewards/useRewardsTransactions.test.ts"
Task: "Add test case: initial load fetches first page of transactions in client/tests/features/rewards/useRewardsTransactions.test.ts"
Task: "Add test case: transactions ordered newest-first (descending createdAt) in client/tests/features/rewards/useRewardsTransactions.test.ts"
Task: "Add test case: empty transactions array handled correctly in client/tests/features/rewards/useRewardsTransactions.test.ts"
Task: "Add test case: API error sets error state and loading=false in client/tests/features/rewards/useRewardsTransactions.test.ts"
Task: "Add test case: 5-second timeout triggers TimeoutError in client/tests/features/rewards/useRewardsTransactions.test.ts"

# Launch all utility functions for User Story 2 together:
Task: "Create formatDate utility using Intl.DateTimeFormat for Spanish locale in client/src/features/rewards/utils/formatDate.ts"
Task: "Create formatMonthHeader utility for Spanish month names (e.g., 'Septiembre 2025') in client/src/features/rewards/utils/formatMonthHeader.ts"
Task: "Create formatSignedAmount utility adding +/- prefix to amounts in client/src/features/rewards/utils/formatSignedAmount.ts"
Task: "Create groupTransactionsByMonth utility with useMemo for performance in client/src/features/rewards/utils/groupTransactionsByMonth.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T032) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T033-T053)
4. Complete Phase 4: User Story 2 (T054-T081)
5. **STOP and VALIDATE**: Test User Stories 1 & 2 independently
   - Verify balance display works
   - Verify transaction history displays with month grouping
   - Verify error states show Spanish messages
   - Verify accessibility (keyboard, screen reader)
6. Deploy/demo if ready (MVP with read-only balance + history view)

### Incremental Delivery

1. Complete Setup + Foundational (Phases 1-2) → Foundation ready
2. Add User Story 1 (Phase 3) → Test independently → Deploy/Demo (balance only)
3. Add User Story 2 (Phase 4) → Test independently → Deploy/Demo (MVP - balance + history!)
4. Add User Story 3 (Phase 5) → Test independently → Deploy/Demo (add pagination)
5. Add User Story 4 (Phase 6) → Test independently → Deploy/Demo (add withdrawal button)
6. Polish (Phase 7) → Production-ready system
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (Phases 1-2)
2. Once Foundational is done:
   - Developer A: User Story 1 (Phase 3)
   - Developer B: User Story 2 (Phase 4)
3. After US1 & US2 complete:
   - Developer A: User Story 4 (Phase 6) - extends BalanceSummaryCard from US1
   - Developer B: User Story 3 (Phase 5) - extends useRewardsTransactions from US2
4. Stories complete and integrate independently
5. Team collaborates on Phase 7 (Polish)

### Recommended Order for Solo Developer

1. Phases 1-2 (Setup + Foundational)
2. Phase 3 (US1 - View Balance) - Get balance display working first
3. Phase 4 (US2 - View History) - Add transaction history (creates MVP with US1+US2)
4. Phase 5 (US3 - Pagination) - Add scalability for long histories
5. Phase 6 (US4 - Withdrawal Button) - Add call-to-action
6. Phase 7 (Polish) - Production hardening

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Independent stories**: Each user story should be independently completable and testable
- **TDD approach**: Verify tests fail before implementing (especially critical for Unit Tests)
- **Commit strategy**: Commit after each task or logical group
- **Checkpoint validation**: Stop at any checkpoint to validate story independently before moving forward
- **85%+ coverage target**: Focus on hook and component tests (core business logic)
- **WCAG 2.1 AA**: All interactive elements must be keyboard accessible with visible focus states
- **Memoization**: Critical for US2 transaction grouping - test with 1,000+ transactions
- **Cursor pagination**: Critical for US3 - maintains consistent ordering when new transactions added

### Avoid

- Vague tasks without file paths
- Working on same file in parallel (conflicts)
- Cross-story dependencies that break independence
- Skipping tests (constitution requires 85%+ coverage)
- Over-optimization (only memoize groupTransactionsByMonth per FR-052)
- Adding UI libraries (violates Constitution Principle II)
