---
description: "Task list for Submit Withdrawal and Success Confirmation feature"
---

# Tasks: Submit Withdrawal and Success Confirmation

**Input**: Design documents from `/specs/003-withdraw-submit/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: TDD approach - tests are written FIRST for each component/hook, then implementation

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend structure**: `client/src/features/rewards/` (extends existing rewards feature)
- **Tests**: `client/tests/features/rewards/withdraw/`
- All paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and assets

- [X] T001 [P] Add success-check.png image to client/src/assets/
- [X] T002 [P] Verify brake-warning-illustration.png exists in client/src/assets/
- [X] T003 Create withdrawal.types.ts with WithdrawalRequest, WithdrawalResponse, ProblemDetails, WithdrawSuccessLocationState interfaces in client/src/features/rewards/types/

**Checkpoint**: Assets and type definitions ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core API client and MSW mocks that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Create withdrawalsApi.ts with submitWithdrawal() function and fetchWithTimeout helper in client/src/features/rewards/api/
- [X] T005 [P] Create withdrawalHandlers.ts with MSW handlers (success 201, error 404/500/429, timeout) in client/tests/mocks/handlers/
- [X] T006 Register withdrawal handlers in client/tests/mocks/server.ts handlers array
- [X] T007 [P] Create withdrawalsApi.test.ts with unit tests for submitWithdrawal API client in client/tests/features/rewards/withdraw/

**Checkpoint**: Foundation ready - API client tested, mocks working, user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Submit Withdrawal Request (Priority: P1) 🎯 MVP

**Goal**: Enable users to submit withdrawal requests with duplicate prevention and loading feedback

**Independent Test**: Select account on /withdraw, click "Retirar fondos", verify API request sent with correct parameters, button shows "Procesando...", navigation to /withdraw/success occurs on 201 response

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T008 [P] [US1] Create useWithdrawalSubmit.test.ts with tests for hook (submit success, handle errors, prevent duplicates, clear errors) in client/tests/features/rewards/withdraw/
- [ ] T009 [US1] Add submission tests to WithdrawScreen.test.tsx (submit on button click, prevent rapid clicks, display loading state) in client/tests/features/rewards/withdraw/

### Implementation for User Story 1

- [ ] T010 [P] [US1] Create useWithdrawalSubmit.ts hook with submitWithdrawal, isSubmitting, error, clearError in client/src/features/rewards/hooks/
- [ ] T011 [P] [US1] Create WithdrawWarningCard.tsx component with brake icon and cooldown message in client/src/features/rewards/components/withdraw/
- [ ] T012 [P] [US1] Create WithdrawFooter.tsx component accepting children (button) and always rendering WithdrawWarningCard in client/src/features/rewards/components/withdraw/
- [ ] T013 [US1] Modify WithdrawScreen.tsx to integrate useWithdrawalSubmit hook, add handleSubmit with isSubmitting guard, update button to show "Procesando..." during submission in client/src/features/rewards/components/withdraw/
- [ ] T014 [US1] Add WithdrawFooter to WithdrawScreen.tsx wrapping the submit button and warning card in client/src/features/rewards/components/withdraw/
- [ ] T015 [US1] Implement navigation to /withdraw/success with withdrawalData in state (including lastFourDigits from selectedAccount) on successful submission in client/src/features/rewards/components/withdraw/WithdrawScreen.tsx
- [ ] T016 [US1] Add console logging for [WITHDRAWAL_SUCCESS] with timestamp, withdrawalId, amount, currency, bankAccountId in client/src/features/rewards/components/withdraw/WithdrawScreen.tsx
- [ ] T017 [US1] Update withdraw.css to extend footer styles for WithdrawFooter and warning card in client/src/features/rewards/styles/
- [ ] T018 [US1] Run tests for User Story 1 and verify all pass (useWithdrawalSubmit.test.ts, WithdrawScreen.test.tsx submission tests)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can submit withdrawals with duplicate prevention, see loading state, and navigate to success screen on 201 response

---

## Phase 4: User Story 2 - View Success Confirmation (Priority: P1) 🎯 MVP

**Goal**: Display success confirmation screen with account details and return navigation

**Independent Test**: Mock successful POST /withdrawals response, navigate to /withdraw/success with navigation state, verify success image, title "¡Tu retiro fue exitoso!", description with account digits, "Regresar a Rewards" button displayed correctly

### Tests for User Story 2

- [ ] T019 [P] [US2] Create WithdrawSuccessScreen.test.tsx with tests (display title/description, show account digits, redirect if no state, image fallback, navigate to /rewards on button click, accessibility) in client/tests/features/rewards/withdraw/
- [ ] T020 [P] [US2] Create WithdrawFooter.test.tsx with tests (render children, always include warning card, display error if provided) in client/tests/features/rewards/withdraw/

### Implementation for User Story 2

- [ ] T021 [P] [US2] Create withdrawSuccess.css with styles for success screen (image, title typography Poppins 600 24px, description typography Poppins 400 16px, layout, skeleton) in client/src/features/rewards/styles/
- [ ] T022 [US2] Create WithdrawSuccessScreen.tsx component with navigation state validation, redirect guard (FR-021), success image with onError handler for fallback (FR-021a) in client/src/features/rewards/components/withdraw/
- [ ] T023 [US2] Add success content to WithdrawSuccessScreen.tsx (title "¡Tu retiro fue exitoso!", description with lastFourDigits, skeleton loading state) in client/src/features/rewards/components/withdraw/
- [ ] T024 [US2] Add WithdrawFooter to WithdrawSuccessScreen.tsx with "Regresar a Rewards" button in client/src/features/rewards/components/withdraw/
- [ ] T025 [US2] Implement navigation to /rewards with refetch on "Regresar a Rewards" button click (FR-031) in client/src/features/rewards/components/withdraw/WithdrawSuccessScreen.tsx
- [ ] T026 [US2] Add focus management to WithdrawSuccessScreen.tsx (focus success title on mount, FR-043) using useEffect and useRef in client/src/features/rewards/components/withdraw/
- [ ] T027 [US2] Add /withdraw/success route to App.tsx routing configuration in client/src/
- [ ] T028 [US2] Run tests for User Story 2 and verify all pass (WithdrawSuccessScreen.test.tsx, WithdrawFooter.test.tsx)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - complete withdraw flow from account selection → submission → success → return to rewards

---

## Phase 5: User Story 3 - Handle Submission Errors (Priority: P2)

**Goal**: Display error messages inline with retry functionality for failed withdrawal submissions

**Independent Test**: Mock failed POST /withdrawals responses (404, 500, Problem Details), verify error messages displayed with correct detail text, retry button works, no duplicate submissions on retry

### Tests for User Story 3

- [X] T029 [P] [US3] Add error handling tests to WithdrawScreen.test.tsx (display error on API failure, show Problem Details detail field, retry after error without duplicates, handle 404 bank account not found) in client/tests/features/rewards/withdraw/
- [X] T030 [P] [US3] Add error scenario tests to useWithdrawalSubmit.test.ts (handle TimeoutError, handle network error, parse Problem Details) in client/tests/features/rewards/withdraw/

### Implementation for User Story 3

- [X] T031 [P] [US3] Extend errorMessages.ts with withdrawal-specific error messages (WITHDRAWAL_FAILED, BANK_ACCOUNT_NOT_FOUND, NETWORK_ERROR) in client/src/features/rewards/constants/
- [X] T032 [US3] Add error state display to WithdrawScreen.tsx (inline error message above button in footer with role="alert", FR-016, FR-017) in client/src/features/rewards/components/withdraw/
- [X] T033 [US3] Implement error handling in handleSubmit (catch block sets error state, logs [WITHDRAWAL_FAILURE] with timestamp/errorType/statusCode/detail, FR-051) in client/src/features/rewards/components/withdraw/WithdrawScreen.tsx
- [X] T034 [US3] Add retry functionality to WithdrawScreen.tsx (button re-enabled on error, clearError on retry, no duplicate submissions, FR-018, FR-020) in client/src/features/rewards/components/withdraw/
- [X] T035 [US3] Handle specific error types (404 bank-account-not-found displays specific message, FR-019) in client/src/features/rewards/components/withdraw/WithdrawScreen.tsx
- [X] T036 [US3] Add error message styling to withdraw.css (inline display, red color, accessible contrast) in client/src/features/rewards/styles/
- [ ] T037 [US3] Run tests for User Story 3 and verify all pass (error handling tests in WithdrawScreen.test.tsx, useWithdrawalSubmit.test.ts)

**Checkpoint**: All user stories (US1, US2, US3) should now be independently functional - submission with loading, success confirmation, and error handling with retry

---

## Phase 6: User Story 4 - Cooldown Warning Awareness (Priority: P3)

**Goal**: Display cooldown warning on both withdraw and success screens to set user expectations

**Independent Test**: Verify warning card with brake icon and Spanish message visible on 100% of /withdraw and /withdraw/success screen views in persistent footer

### Tests for User Story 4

- [X] T038 [P] [US4] Add cooldown warning tests to WithdrawScreen.test.tsx (warning card visible, correct message text, role="note") in client/tests/features/rewards/withdraw/
- [X] T039 [P] [US4] Add cooldown warning tests to WithdrawSuccessScreen.test.tsx (warning card visible, persistent on success screen) in client/tests/features/rewards/withdraw/
- [X] T040 [P] [US4] Create WithdrawWarningCard.test.tsx with tests (render brake icon, display message, role="note", alt text on icon) in client/tests/features/rewards/withdraw/

### Implementation for User Story 4

- [X] T041 [US4] Verify WithdrawWarningCard.tsx displays brake-warning-illustration.png with alt="Advertencia", width 32, height 32 (FR-035) in client/src/features/rewards/components/withdraw/
- [X] T042 [US4] Verify WithdrawWarningCard.tsx displays message "Debes esperar unos minutos antes de realizar otro retiro con el mismo monto" with exact text match (FR-033) in client/src/features/rewards/components/withdraw/
- [X] T043 [US4] Add role="note" to WithdrawWarningCard.tsx container (FR-034) in client/src/features/rewards/components/withdraw/
- [X] T044 [US4] Add warning card styling to withdraw.css (light yellow background #FEF3C7, border #FDE047, dark yellow text #78350F, flexbox layout) in client/src/features/rewards/styles/
- [X] T045 [US4] Verify WithdrawFooter.tsx always renders WithdrawWarningCard on both screens (FR-032) in client/src/features/rewards/components/withdraw/
- [ ] T046 [US4] Run tests for User Story 4 and verify all pass (WithdrawWarningCard.test.tsx, warning tests in WithdrawScreen/WithdrawSuccessScreen tests)

**Checkpoint**: All 4 user stories complete - full feature functional with submission, success, error handling, and cooldown warnings

---

## Phase 7: Navigation Skeleton (User-Requested Enhancement)

**Goal**: Add skeleton loading states for smooth transitions between /withdraw and /withdraw/success screens (zero layout shifts, CLS = 0)

**Independent Test**: Navigate from /withdraw to /withdraw/success, verify skeleton appears during transition, matches final content dimensions, fades to actual content

### Tests for Navigation Skeleton

- [X] T047 [P] Add navigation skeleton tests to WithdrawScreen.test.tsx (skeleton shows during navigation, useNavigation hook integration) in client/tests/features/rewards/withdraw/
- [X] T048 [P] Add skeleton tests to WithdrawSuccessScreen.test.tsx (skeleton shows on mount while validating state, matches content dimensions) in client/tests/features/rewards/withdraw/

### Implementation for Navigation Skeleton

- [X] T049 [P] Create WithdrawSuccessScreenSkeleton.tsx component with skeleton placeholders (image, title, description matching final dimensions) in client/src/features/rewards/components/withdraw/
- [X] T050 [P] Add skeleton styles to withdrawSuccess.css (shimmer animation, background gradients, matching dimensions) in client/src/features/rewards/styles/
- [X] T051 Import useNavigation from react-router-dom in WithdrawScreen.tsx and detect navigation state in client/src/features/rewards/components/withdraw/
- [X] T052 Show WithdrawSuccessScreenSkeleton in WithdrawScreen.tsx when navigating to /withdraw/success (navigation.state === 'loading' && navigation.location?.pathname === '/withdraw/success') in client/src/features/rewards/components/withdraw/
- [X] T053 Show WithdrawSuccessScreenSkeleton in WithdrawSuccessScreen.tsx while validating navigation state (before redirect guard completes) in client/src/features/rewards/components/withdraw/
- [ ] T054 Run tests for navigation skeleton and verify CLS = 0 (WithdrawScreen.test.tsx, WithdrawSuccessScreen.test.tsx skeleton tests)

**Checkpoint**: Navigation transitions are smooth with zero layout shifts (SC-009)

---

## Phase 8: Accessibility & Polish

**Purpose**: Ensure WCAG 2.1 AA compliance, keyboard navigation, screen reader support, and comprehensive test coverage

- [ ] T055 [P] Add accessibility tests to accessibility.test.tsx for WithdrawScreen (keyboard navigation, focus indicators, aria-live for loading/errors) in client/tests/features/rewards/withdraw/
- [ ] T056 [P] Add accessibility tests to accessibility.test.tsx for WithdrawSuccessScreen (focus management, aria-live, jest-axe validation) in client/tests/features/rewards/withdraw/
- [ ] T057 [P] Verify all interactive elements have visible focus states (2px outline, 3:1 contrast ratio, FR-042) in client/src/features/rewards/styles/withdraw.css and withdrawSuccess.css
- [ ] T058 [P] Verify loading states use role="status" or aria-live="polite" (FR-044) in WithdrawScreen.tsx
- [ ] T059 [P] Verify error states use role="alert" or aria-live="assertive" (FR-045) in WithdrawScreen.tsx
- [ ] T060 [P] Verify all buttons have aria-label and aria-disabled attributes (FR-036, FR-037) in WithdrawScreen.tsx and WithdrawSuccessScreen.tsx
- [ ] T061 Run jest-axe validation on all components (WithdrawScreen, WithdrawSuccessScreen, WithdrawFooter, WithdrawWarningCard) and verify 0 violations
- [ ] T062 [P] Run ESLint on all new files (withdrawalsApi.ts, useWithdrawalSubmit.ts, WithdrawSuccessScreen.tsx, WithdrawFooter.tsx, WithdrawWarningCard.tsx) and fix errors
- [ ] T063 [P] Run TypeScript compiler and verify no type errors in withdrawal.types.ts and all components
- [ ] T064 Run full test suite (pnpm test) and verify all 59 existing tests + new tests pass (target: 85%+ coverage)
- [ ] T065 Verify all 52 functional requirements met (FR-001 through FR-052) using spec.md checklist
- [ ] T066 Verify all 10 success criteria met (SC-001 through SC-010) using quickstart.md test scenarios

**Checkpoint**: Feature meets all accessibility requirements (WCAG 2.1 AA), 85%+ test coverage, all functional requirements verified

---

## Phase 9: Integration & Verification

**Purpose**: End-to-end validation and documentation

- [ ] T067 [P] Manual test: Complete happy path (select account → submit → success → return to rewards) in < 30 seconds (SC-001)
- [ ] T068 [P] Manual test: Rapid triple-click "Retirar fondos" results in only ONE API call (SC-002, SC-003)
- [ ] T069 [P] Manual test: Success screen displays correct last 4 digits for all test accounts (SC-004)
- [ ] T070 [P] Manual test: Retry after error works without duplicate submissions (SC-005)
- [ ] T071 [P] Manual test: Direct navigation to /withdraw/success redirects to /withdraw gracefully
- [ ] T072 [P] Manual test: Image fallback works if success-check.png missing or fails to load
- [ ] T073 [P] Manual test: Warning card visible on both /withdraw and /withdraw/success screens (SC-008)
- [ ] T074 [P] Manual test: Navigate /withdraw → /withdraw/success → back button returns to /withdraw cleanly
- [ ] T075 [P] Run quickstart.md test scenarios for all 4 user stories and verify all pass
- [ ] T076 [P] Cross-browser testing (Chrome, Firefox, Safari) on /withdraw and /withdraw/success screens
- [ ] T077 [P] Manual screen reader testing (VoiceOver or NVDA) for loading/error/success announcements (SC-006)
- [ ] T078 Create VERIFICATION.md documenting all FR validation, SC validation, test results, architecture compliance in specs/003-withdraw-submit/
- [ ] T079 Update CLAUDE.md with any new patterns or commands from 003-withdraw-submit feature in repository root
- [ ] T080 Run pnpm build and verify production build succeeds with no errors

**Checkpoint**: Feature fully verified, documented, and ready for production deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 US1 → P1 US2 → P2 US3 → P3 US4)
- **Navigation Skeleton (Phase 7)**: Depends on US1 and US2 completion (needs WithdrawScreen and WithdrawSuccessScreen)
- **Accessibility & Polish (Phase 8)**: Depends on all user stories being complete
- **Integration & Verification (Phase 9)**: Depends on all previous phases

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Extends US1 error handling but independently testable
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Informational feature, no blocking dependencies

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Hook/API client before component integration
- Component structure before styling
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- Phase 1: All 3 setup tasks marked [P] can run in parallel
- Phase 2: Tasks T004, T005, T007 marked [P] can run in parallel (T006 depends on T005)
- Phase 3 (US1): Tests T008/T009, components T010/T011/T012 can start in parallel
- Phase 4 (US2): Tests T019/T020, styles/components T021/T022 can start in parallel
- Phase 5 (US3): Tests T029/T030, error messages T031 can start in parallel
- Phase 6 (US4): All tests T038/T039/T040 can run in parallel
- Phase 7: Tests T047/T048, components T049/T050 can run in parallel
- Phase 8: Most polish tasks marked [P] can run in parallel (linting, accessibility, type checking)
- Phase 9: All manual tests marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Create useWithdrawalSubmit.test.ts with tests for hook in client/tests/features/rewards/withdraw/"
Task: "Add submission tests to WithdrawScreen.test.tsx in client/tests/features/rewards/withdraw/"

# Launch all parallel components for User Story 1 together:
Task: "Create useWithdrawalSubmit.ts hook in client/src/features/rewards/hooks/"
Task: "Create WithdrawWarningCard.tsx component in client/src/features/rewards/components/withdraw/"
Task: "Create WithdrawFooter.tsx component in client/src/features/rewards/components/withdraw/"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup (3 tasks)
2. Complete Phase 2: Foundational (4 tasks) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (11 tasks) - Submit withdrawal request
4. Complete Phase 4: User Story 2 (10 tasks) - Success confirmation
5. **STOP and VALIDATE**: Test US1+US2 end-to-end independently
6. Deploy/demo if ready - **MVP delivers complete withdraw flow**

**MVP Delivery**: Enables complete withdraw journey (002-withdraw account selection → 003-withdraw-submit submission → success confirmation → return to rewards)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (7 tasks)
2. Add User Story 1 → Test independently → Deploy/Demo (11 tasks, **MVP submission**)
3. Add User Story 2 → Test independently → Deploy/Demo (10 tasks, **MVP complete flow**)
4. Add User Story 3 → Test independently → Deploy/Demo (9 tasks, **error handling**)
5. Add User Story 4 → Test independently → Deploy/Demo (6 tasks, **cooldown warnings**)
6. Add Navigation Skeleton → Validate CLS = 0 → Deploy/Demo (8 tasks, **smooth transitions**)
7. Polish + Verification → Production ready (24 tasks)

**Total**: 80 tasks across 9 phases

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (7 tasks)
2. Once Foundational is done:
   - Developer A: User Story 1 (11 tasks)
   - Developer B: User Story 2 (10 tasks)
   - Developer C: User Story 3 (9 tasks)
3. Stories complete and integrate independently
4. Polish & verification done together

---

## Task Summary

**Total Tasks**: 80

**By Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 4 tasks
- Phase 3 (US1 - Submit Withdrawal): 11 tasks
- Phase 4 (US2 - Success Confirmation): 10 tasks
- Phase 5 (US3 - Error Handling): 9 tasks
- Phase 6 (US4 - Cooldown Warning): 6 tasks
- Phase 7 (Navigation Skeleton): 8 tasks
- Phase 8 (Accessibility & Polish): 12 tasks
- Phase 9 (Integration & Verification): 14 tasks
- Polish tasks: 3 tasks (integrated into phases)

**By User Story**:
- User Story 1 (P1 MVP): 11 tasks
- User Story 2 (P1 MVP): 10 tasks
- User Story 3 (P2): 9 tasks
- User Story 4 (P3): 6 tasks

**Parallelizable Tasks**: 42 tasks marked [P] (52.5% can run in parallel within phases)

**MVP Scope**: Phases 1-4 (28 tasks) delivers complete withdraw submission and success confirmation flow

**Independent Test Criteria**:
- US1: Select account, submit, verify API call with correct params, loading state, navigation to success
- US2: Mock successful submission, verify success screen displays title/description/account digits/button
- US3: Mock API errors, verify inline error display, retry functionality, no duplicates
- US4: Verify warning card visible on both screens with correct message and icon

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label (US1, US2, US3, US4) maps task to specific user story for traceability
- Each user story should be independently completable and testable
- TDD approach: Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Navigation skeleton focus**: Phase 7 specifically addresses user's request for smooth transitions
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Constitution compliance: Zero new major dependencies, 85%+ test coverage, WCAG 2.1 AA accessibility
