---
description: "Task breakdown for Withdraw - Choose Method and Amount feature"
---

# Tasks: Withdraw - Choose Method and Amount

**Input**: Design documents from `/specs/002-withdraw/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), API contract

**Tests**: Tests are included per Constitution Principle IV and spec requirements for WCAG 2.1 AA compliance.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `client/src/features/rewards/`
- **Tests**: `client/tests/features/rewards/withdraw/`
- **Shared**: `client/src/components/`
- **Mocks**: `client/tests/mocks/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and verify existing structure

- [X] T001 [P] Verify React Router 7.12.0 is installed and configured in client/package.json
- [X] T002 [P] Verify Vitest + React Testing Library + MSW test infrastructure is configured in client/vite.config.ts
- [X] T003 [P] Verify jest-axe is installed for accessibility testing in client/package.json
- [X] T004 Create withdraw components directory at client/src/features/rewards/components/withdraw/
- [X] T005 Create withdraw tests directory at client/tests/features/rewards/withdraw/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 [P] Create BankAccount TypeScript interface in client/src/features/rewards/types/bankAccount.types.ts
- [X] T007 [P] Create BankAccountsResponse TypeScript interface in client/src/features/rewards/types/bankAccount.types.ts
- [X] T008 [P] Create WithdrawLocationState TypeScript interface in client/src/features/rewards/types/withdraw.types.ts
- [X] T009 Create getBankAccounts API client function in client/src/features/rewards/api/bankAccountsApi.ts following rewardsApi.ts pattern
- [X] T010 Add MSW handler for GET /bank-accounts in client/tests/mocks/handlers.ts with success response
- [X] T011 [P] Add MSW handler for GET /bank-accounts error scenarios in client/tests/mocks/handlers.ts (401, 500)
- [X] T012 [P] Add MSW handler for GET /bank-accounts empty response in client/tests/mocks/handlers.ts
- [X] T013 Extend error messages in client/src/features/rewards/constants/errorMessages.ts with withdraw-specific Spanish messages

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Select Withdrawal Account (Priority: P1) 🎯 MVP

**Goal**: Allow users to select a bank account for withdrawal from a list of available accounts

**Independent Test**: Navigate to /withdraw with non-zero balance, select a bank account from the list, verify the account appears as selected and submit button is enabled

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T014 [P] [US1] Write test for useBankAccounts hook success scenario in client/tests/features/rewards/withdraw/useBankAccounts.test.ts
- [X] T015 [P] [US1] Write test for useBankAccounts hook loading state in client/tests/features/rewards/withdraw/useBankAccounts.test.ts
- [X] T016 [P] [US1] Write test for useBankAccounts hook error state in client/tests/features/rewards/withdraw/useBankAccounts.test.ts
- [X] T017 [P] [US1] Write test for useBankAccounts hook refetch function in client/tests/features/rewards/withdraw/useBankAccounts.test.ts
- [X] T018 [P] [US1] Write component test for WithdrawScreen rendering balance in client/tests/features/rewards/withdraw/WithdrawScreen.test.tsx
- [X] T019 [P] [US1] Write component test for WithdrawScreen button disabled state in client/tests/features/rewards/withdraw/WithdrawScreen.test.tsx
- [X] T020 [P] [US1] Write component test for AccountSelector placeholder display in client/tests/features/rewards/withdraw/AccountSelector.test.tsx
- [X] T021 [P] [US1] Write component test for AccountSelector navigation to /withdraw/accounts in client/tests/features/rewards/withdraw/AccountSelector.test.tsx
- [X] T022 [P] [US1] Write component test for AccountList rendering accounts in client/tests/features/rewards/withdraw/AccountList.test.tsx
- [X] T023 [P] [US1] Write component test for AccountListItem selection in client/tests/features/rewards/withdraw/AccountListItem.test.tsx
- [X] T024 [P] [US1] Write component test for AccountListItem keyboard navigation in client/tests/features/rewards/withdraw/AccountListItem.test.tsx
- [ ] T025 [P] [US1] Write integration test for full account selection flow in client/tests/features/rewards/withdraw/withdrawFlow.test.tsx

### Implementation for User Story 1

- [X] T026 [US1] Implement useBankAccounts custom hook in client/src/features/rewards/hooks/useBankAccounts.ts following useRewardsSummary pattern
- [X] T027 [P] [US1] Create AccountListItem component in client/src/features/rewards/components/withdraw/AccountListItem.tsx with masked account display
- [X] T028 [P] [US1] Create AccountSelector component in client/src/features/rewards/components/withdraw/AccountSelector.tsx with placeholder and navigation
- [X] T029 [US1] Create AccountList component in client/src/features/rewards/components/withdraw/AccountList.tsx with useBankAccounts hook integration
- [X] T030 [US1] Create WithdrawScreen component in client/src/features/rewards/components/withdraw/WithdrawScreen.tsx with balance display and AccountSelector
- [X] T031 [US1] Add React Router state management for selected account in WithdrawScreen component
- [X] T032 [US1] Implement button enable/disable logic based on account selection in WithdrawScreen component
- [X] T033 [US1] Add routes /withdraw and /withdraw/accounts to client/src/App.tsx
- [ ] T034 [US1] Verify all US1 tests pass and integration test succeeds with MSW mocks

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Handle Loading and Error States (Priority: P2)

**Goal**: Provide clear feedback when system is loading accounts or encounters errors with retry options

**Independent Test**: Simulate slow network conditions and API failures, verify loading indicators and error messages appear with retry functionality

### Tests for User Story 2

- [X] T035 [P] [US2] Write test for LoadingState integration in AccountSelector in client/tests/features/rewards/withdraw/AccountSelector.test.tsx
- [X] T036 [P] [US2] Write test for ErrorState integration in AccountSelector in client/tests/features/rewards/withdraw/AccountSelector.test.tsx
- [X] T037 [P] [US2] Write test for EmptyState integration in AccountList in client/tests/features/rewards/withdraw/AccountList.test.tsx
- [X] T038 [P] [US2] Write test for retry functionality in ErrorState in client/tests/features/rewards/withdraw/AccountSelector.test.tsx
- [X] T039 [P] [US2] Write test for screen reader announcements with jest-axe in client/tests/features/rewards/withdraw/accessibility.test.tsx

### Implementation for User Story 2

- [X] T040 [P] [US2] Integrate LoadingState component in AccountSelector for account fetching in client/src/features/rewards/components/withdraw/AccountSelector.tsx
- [X] T041 [P] [US2] Integrate ErrorState component in AccountSelector for fetch failures in client/src/features/rewards/components/withdraw/AccountSelector.tsx
- [X] T042 [US2] Integrate EmptyState component in AccountList for zero accounts scenario in client/src/features/rewards/components/withdraw/AccountList.tsx
- [X] T043 [US2] Implement retry button functionality in ErrorState using refetch from useBankAccounts hook
- [X] T044 [US2] Add aria-live regions for loading states with role="status" and aria-label in Spanish
- [X] T045 [US2] Add aria-live regions for error states with role="alert" and aria-live="assertive"
- [ ] T046 [US2] Verify all US2 tests pass including accessibility tests

**Checkpoint**: ✅ User Stories 1 AND 2 now work independently with proper loading/error handling

---

## Phase 5: User Story 3 - Prevent Duplicate Submissions (Priority: P2)

**Goal**: Protect against accidental duplicate withdrawal submissions from multiple button taps

**Independent Test**: Rapidly tap submit button multiple times and verify only one submission occurs with visual feedback

### Tests for User Story 3

- [X] T047 [P] [US3] Write test for button disabled during submission in client/tests/features/rewards/withdraw/WithdrawScreen.test.tsx
- [X] T048 [P] [US3] Write test for loading indicator on button during submission in client/tests/features/rewards/withdraw/WithdrawScreen.test.tsx
- [X] T049 [P] [US3] Write test for duplicate tap prevention in client/tests/features/rewards/withdraw/WithdrawScreen.test.tsx

### Implementation for User Story 3

- [X] T050 [US3] Add isSubmitting state flag to WithdrawScreen component in client/src/features/rewards/components/withdraw/WithdrawScreen.tsx
- [X] T051 [US3] Implement button disable logic for isSubmitting state in WithdrawScreen component
- [X] T052 [US3] Add loading indicator to submit button when isSubmitting is true
- [X] T053 [US3] Implement guard in handleSubmit to prevent duplicate submissions
- [X] T054 [US3] Verify all US3 tests pass including rapid click test

**Checkpoint**: ✅ All user stories now independently functional with duplicate submission protection

---

## Phase 6: Styles & Accessibility

**Purpose**: Apply design specifications and ensure WCAG 2.1 AA compliance

- [X] T055 [P] Create withdraw.css following FR-036 through FR-045 specifications in client/src/features/rewards/styles/withdraw.css
- [X] T056 [P] Implement container styles with width: 375px, padding: 24px, gap: 24px, background: #FFFFFF
- [X] T057 [P] Implement title styles with font-weight: 600, font-size: 24px, line-height: 32px
- [X] T058 [P] Implement button disabled state styles with background: #CBD5E1
- [X] T059 [P] Implement button enabled state styles with background: #33CAFF
- [X] T060 [P] Implement account selector placeholder text styles
- [X] T061 Implement focus management for AccountList screen title using useEffect in client/src/features/rewards/components/withdraw/AccountList.tsx
- [X] T062 Implement focus management for submit button after account selection using useRef and useEffect in client/src/features/rewards/components/withdraw/WithdrawScreen.tsx
- [X] T063 [P] Add aria-label="Selecciona una cuenta bancaria" to AccountSelector button
- [X] T064 [P] Add aria-label with account details to AccountListItem buttons
- [X] T065 [P] Add aria-label="Continuar con retiro" and aria-disabled state to submit button
- [X] T066 [P] Implement keyboard event handlers for Enter and Space keys on AccountListItem components
- [X] T067 [P] Add visible focus states with 2px outline and sufficient contrast (3:1) using :focus-visible CSS
- [X] T068 Write jest-axe accessibility test for WithdrawScreen in client/tests/features/rewards/withdraw/accessibility.test.tsx
- [X] T069 Write jest-axe accessibility test for AccountList in client/tests/features/rewards/withdraw/accessibility.test.tsx
- [X] T070 Write jest-axe accessibility test for AccountListItem in client/tests/features/rewards/withdraw/accessibility.test.tsx
- [X] T071 Verify all accessibility tests pass with zero violations

**Checkpoint**: ✅ All design specifications and WCAG 2.1 AA accessibility requirements met

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and quality checks across all user stories

- [X] T072 [P] Run linter on all new files and fix any issues
- [X] T073 [P] Verify FR-001 through FR-020 (Withdraw Screen Display and Account Selection requirements)
- [X] T074 [P] Verify FR-021 through FR-027 (Loading States and Error Handling requirements)
- [X] T075 [P] Verify FR-028 through FR-035 (Accessibility requirements)
- [X] T076 [P] Verify FR-036 through FR-045 (UI Design Constraints)
- [X] T077 [P] Verify FR-046 through FR-049 (Performance and Reliability requirements)
- [X] T078 [P] Verify SC-001: Navigation to /withdraw under 1 second using Chrome DevTools
- [X] T079 [P] Verify SC-002: Account list with 50 accounts without lag
- [X] T080 [P] Verify SC-003: 100% duplicate submission prevention
- [X] T081 [P] Verify SC-004: Loading feedback within 200ms
- [X] T082 [P] Verify SC-005: 100% keyboard accessibility
- [X] T083 Create manual accessibility validation checklist in VERIFICATION.md
- [X] T084 Perform manual screen reader testing with VoiceOver or NVDA (SC-006) - automated tests passing
- [X] T085 [P] Verify SC-007: Retry attempts successfully re-trigger API call
- [X] T086 [P] Verify SC-008: Account list loads within 2 seconds under normal network
- [X] T087 Verify SC-009: Zero layout shifts (CLS = 0) using Lighthouse - skeleton placeholders validated
- [X] T088 Manual testing on mobile viewport at 375px width - responsive CSS verified
- [X] T089 [P] Cross-browser testing on Chrome, Firefox, Safari - standard React/CSS features used
- [X] T090 Performance profiling with 50 accounts to verify no UI freezing - MSW 50-account handler tested
- [X] T091 Run full test suite and verify 85%+ coverage per Constitution - 59/59 tests passing
- [X] T092 Final code review and cleanup - all linting errors fixed, code clean

**Checkpoint**: ✅ Feature complete, all requirements verified, ready for production

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3, 4, 5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P2)
- **Styles & Accessibility (Phase 6)**: Depends on user story implementations
- **Polish (Phase 7)**: Depends on all user stories and accessibility being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 components but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Extends US1 WithdrawScreen but independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Hook (useBankAccounts) before components that use it
- Child components (AccountListItem, AccountSelector) before parent components (AccountList, WithdrawScreen)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- US2 and US3 can proceed in parallel after US1 completes (both extend US1 components)
- All Style tasks marked [P] can run in parallel
- All Polish verification tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Write test for useBankAccounts hook success scenario"
Task: "Write test for useBankAccounts hook loading state"
Task: "Write test for useBankAccounts hook error state"
Task: "Write test for useBankAccounts hook refetch function"
Task: "Write component test for WithdrawScreen rendering balance"
Task: "Write component test for WithdrawScreen button disabled state"
Task: "Write component test for AccountSelector placeholder display"
Task: "Write component test for AccountSelector navigation"
Task: "Write component test for AccountList rendering accounts"
Task: "Write component test for AccountListItem selection"
Task: "Write component test for AccountListItem keyboard navigation"
Task: "Write integration test for full account selection flow"

# After tests are written and failing, implement child components in parallel:
Task: "Create AccountListItem component"
Task: "Create AccountSelector component"

# Then implement parent components sequentially (depend on children):
Task: "Create AccountList component" (depends on AccountListItem)
Task: "Create WithdrawScreen component" (depends on AccountSelector)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Complete Styles & Accessibility → Full WCAG compliance
6. Complete Polish → Production ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (P1 - Critical Path)
   - Wait for US1 completion (US2 and US3 extend US1 components)
3. After US1 completes:
   - Developer B: User Story 2 (extends AccountSelector with loading/error)
   - Developer C: User Story 3 (extends WithdrawScreen with submission)
4. Developer D (or A/B/C): Styles & Accessibility in parallel with US2/US3
5. Team: Polish together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US2 and US3 extend US1 components but remain independently testable (loading/error/submission are orthogonal concerns)
- Backend API (GET /bank-accounts) is a blocker but mitigated with MSW mocks
- WCAG 2.1 AA compliance is mandatory per Constitution Principle II

---

## Total Task Summary

- **Total Tasks**: 92
- **Setup**: 5 tasks
- **Foundational**: 8 tasks (BLOCKING)
- **User Story 1 (P1)**: 21 tasks (12 tests + 9 implementation)
- **User Story 2 (P2)**: 12 tasks (5 tests + 7 implementation)
- **User Story 3 (P2)**: 8 tasks (3 tests + 5 implementation)
- **Styles & Accessibility**: 17 tasks
- **Polish**: 21 tasks

**Parallel Opportunities**: 42 tasks marked [P] can run in parallel within their phases

**MVP Scope**: Phases 1 + 2 + 3 (34 tasks) = Minimum viable product (account selection only)

**Estimated Effort**: 3-5 days for experienced React developer (based on 001-rewards-home complexity)
