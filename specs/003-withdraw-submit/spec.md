# Feature Specification: Submit Withdrawal and Success Confirmation

**Feature Branch**: `003-withdraw-submit`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "US3 – Submit Withdrawal and Success Confirmation (Refined with API contract + Success UI)"

## Clarifications

### Session 2026-01-11

- Q: How should the successful withdrawal data be passed to the success screen for displaying the account digits? → A: Pass withdrawal data through React Router navigation state when navigating to /withdraw/success
- Q: Where should error messages be displayed when withdrawal submission fails? → A: Display error inline above the submit button in the footer area
- Q: What should happen if a user navigates directly to /withdraw/success without withdrawal data in navigation state? → A: Redirect to /withdraw automatically (no error shown to user)
- Q: What should happen if the success-check.png image fails to load or is missing? → A: Display a CSS-based checkmark icon (Unicode ✓ or inline SVG) as fallback
- Q: Should withdrawal submission attempts be logged for observability? → A: Log success and failure events to browser console for debugging and monitoring

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Submit Withdrawal Request (Priority: P1) 🎯 MVP

As a user on the Withdraw screen with a selected bank account, I want to submit my withdrawal request so that my rewards are transferred to my chosen account.

**Why this priority**: Core transaction functionality - enables the primary purpose of the withdraw flow. Without submission, the entire flow is incomplete.

**Independent Test**: Can be fully tested by selecting an account on /withdraw, clicking "Retirar fondos", and verifying the API request is sent with correct parameters and the loading state is managed properly.

**Acceptance Scenarios**:

1. **Given** I am on the Withdraw screen with a bank account selected and a valid withdrawal amount, **When** I click the "Retirar fondos" button, **Then** the system sends a POST request to /withdrawals with userId, amount, bankAccountId, and currency
2. **Given** I click "Retirar fondos", **When** the request is in progress, **Then** the button shows "Procesando..." and becomes disabled to prevent duplicate submissions
3. **Given** I rapidly click "Retirar fondos" three times, **When** processing the first request, **Then** only one API call is made and subsequent clicks are ignored
4. **Given** the withdrawal submission is in progress, **When** the API responds with success, **Then** I am navigated to /withdraw/success
5. **Given** the withdrawal submission fails, **When** the API returns an error, **Then** I remain on /withdraw, see an error message, and can retry

---

### User Story 2 - View Success Confirmation (Priority: P1) 🎯 MVP

As a user whose withdrawal was successfully submitted, I want to see a clear confirmation message so that I know my request was processed.

**Why this priority**: Essential for user confidence and transaction completion. Users need immediate feedback that their money transfer was initiated.

**Independent Test**: Can be tested by mocking a successful POST /withdrawals response, navigating to /withdraw/success, and verifying the success image, title, description with account digits, and the "Regresar a Rewards" button are displayed correctly.

**Acceptance Scenarios**:

1. **Given** I successfully submitted a withdrawal, **When** I arrive at /withdraw/success, **Then** I see the success-check.png image centered on the screen
2. **Given** I am on the success screen, **When** viewing the confirmation, **Then** I see the title "¡Tu retiro fue exitoso!" and a description that includes my selected account's last 4 digits
3. **Given** I am on the success screen, **When** I want to return to the main rewards view, **Then** I see a "Regresar a Rewards" button in the footer
4. **Given** I click "Regresar a Rewards", **When** navigating back, **Then** the system returns me to /rewards and refetches my balance and transaction history to show updated data

---

### User Story 3 - Handle Submission Errors (Priority: P2)

As a user whose withdrawal submission failed, I want to understand what went wrong and be able to retry so that I can complete my withdrawal.

**Why this priority**: Important for reliability and user experience, but submission success (US1) and success confirmation (US2) must work first.

**Independent Test**: Can be tested by mocking failed POST /withdrawals responses (404, 500, Problem Details), verifying error messages are displayed with correct detail text, retry button works, and no duplicate submissions occur on retry.

**Acceptance Scenarios**:

1. **Given** my withdrawal submission fails with a Problem Details response, **When** the error is received, **Then** I see the error detail message and an announced alert for screen readers
2. **Given** the API returns a 404 with type "bank-account-not-found", **When** I see the error, **Then** the message indicates my selected account is no longer valid and I can reselect an account
3. **Given** I see an error message, **When** I click the retry button, **Then** the system attempts the submission again without creating duplicate requests
4. **Given** multiple network failures occur, **When** I retry each time, **Then** the system never sends duplicate withdrawal requests

---

### User Story 4 - Cooldown Warning Awareness (Priority: P3)

As a user viewing the withdraw or success screen, I want to see a warning about cooldown restrictions so that I understand why I might not be able to make another withdrawal immediately.

**Why this priority**: Nice-to-have informational feature that helps set expectations but doesn't block core withdrawal functionality.

**Independent Test**: Can be tested by verifying the warning card with brake icon and Spanish message is visible on both /withdraw and /withdraw/success screens in the persistent footer.

**Acceptance Scenarios**:

1. **Given** I am on the Withdraw screen, **When** viewing the screen, **Then** I see a persistent footer with a warning card stating "Debes esperar unos minutos antes de realizar otro retiro con el mismo monto"
2. **Given** I am on the Success screen, **When** viewing the confirmation, **Then** the same warning card remains visible in the footer
3. **Given** the backend enforces a cooldown restriction, **When** my submission is blocked, **Then** I see an additional alert message announced to screen readers indicating the action was blocked

---

### Edge Cases

- What happens if the user navigates directly to /withdraw/success without completing a withdrawal?
  - The system automatically redirects to /withdraw without showing an error message

- What happens if the selected bank account is deleted from another device between selection and submission?
  - The API returns a 404 error with type "bank-account-not-found", and the UI displays "The specified bank account does not exist or is not accessible" with the ability to reselect

- What happens if the network connection is lost during submission?
  - The submission times out after 5 seconds (per existing timeout pattern), displays a network error message, and allows retry

- What happens if the user refreshes the page during submission?
  - The pending request is cancelled (browser behavior), no duplicate submission occurs, and the user returns to the withdraw screen

- What happens if the withdrawal amount becomes invalid (balance changes) while on the screen?
  - The backend validates the amount on submission; if invalid, returns an error that the UI displays

- What happens if the user clicks the back button on the success screen?
  - The browser navigates back to /withdraw, which should clear the selected account state (natural navigation behavior)

## Requirements *(mandatory)*

### Functional Requirements

**Submission Interaction**

- **FR-001**: The primary action button on the Withdraw screen MUST be labeled "Retirar fondos" when idle
- **FR-002**: System MUST validate that userId, amount, bankAccountId, and currency are available in application state before enabling submission
- **FR-003**: System MUST call POST http://localhost:3000/withdrawals when the user clicks "Retirar fondos"
- **FR-004**: System MUST include headers `accept: application/json` and `Content-Type: application/json` in the POST request
- **FR-005**: System MUST send request body with fields: userId (string UUID), amount (number), bankAccountId (string UUID), currency (string)
- **FR-006**: System MUST set an in-progress state immediately when submission starts
- **FR-007**: System MUST prevent duplicate submissions while a request is pending
- **FR-008**: System MUST ignore repeated button clicks during submission processing

**Loading State**

- **FR-009**: System MUST change the button label to "Procesando..." while the request is in progress
- **FR-010**: System MUST disable the button with visual disabled styling during submission
- **FR-011**: System MUST announce non-urgent loading status updates to assistive technologies using role="status" or aria-live="polite"

**Success Handling**

- **FR-012**: System MUST navigate to /withdraw/success when POST /withdrawals returns a 200 or 201 success response, passing the withdrawal response data (including bankAccountId and account last 4 digits) via React Router navigation state
- **FR-012a**: System MUST make the withdrawal data from navigation state available to the success screen for displaying account information
- **FR-013**: System MUST NOT refetch balance or transactions until the user clicks "Regresar a Rewards" on the success screen

**Error Handling**

- **FR-014**: System MUST remain on /withdraw when POST /withdrawals returns an error response
- **FR-015**: System MUST remove the loading state and re-enable the button when an error occurs
- **FR-016**: System MUST display an error message inline above the submit button in the footer area, derived from the API response (using `detail` field from Problem Details when available)
- **FR-017**: System MUST announce blocking errors to assistive technologies using role="alert" or aria-live="assertive"
- **FR-018**: System MUST provide a retry action that allows resubmission without creating duplicate requests
- **FR-019**: When API returns status 404 with type "bank-account-not-found", System MUST display the error detail "The specified bank account does not exist or is not accessible"
- **FR-020**: When displaying bank account not found error, System MUST allow the user to navigate back to account selection

**Success Screen Display**

- **FR-021**: Success screen MUST redirect to /withdraw if no withdrawal data is present in navigation state (prevents direct navigation without completed withdrawal)
- **FR-021a**: Success screen MUST display the image from /client/src/assets/success-check.png, with CSS-based checkmark icon fallback (Unicode ✓ or inline SVG) if image fails to load
- **FR-022**: Success screen MUST display the title "¡Tu retiro fue exitoso!" with exact text match
- **FR-023**: Success screen MUST display a description "Procesamos tu solicitud y enviamos tu recompensa a tu cuenta bancaria terminada en {number}" where {number} is replaced with the account's last 4 digits from the withdrawal data passed via navigation state
- **FR-024**: Success screen title MUST use typography: Poppins font, 600 weight, 24px size, 32px line-height, center-aligned, color #0F172A
- **FR-025**: Success screen description MUST use typography: Poppins font, 400 weight, 16px size, 24px line-height, center-aligned, color #334155
- **FR-026**: Success screen title container MUST be width 327px, height 32px
- **FR-027**: Success screen description container MUST be width 327px, height 72px

**Success Screen Footer**

- **FR-028**: Success screen MUST display the persistent footer with the warning card
- **FR-029**: Success screen primary action button MUST be labeled "Regresar a Rewards"
- **FR-030**: System MUST navigate to /rewards when "Regresar a Rewards" is clicked
- **FR-031**: System MUST refetch rewards summary and transactions after navigating to /rewards from the success screen

**Persistent Footer (Withdraw Warning)**

- **FR-032**: The withdraw footer MUST persist on both /withdraw and /withdraw/success screens
- **FR-033**: The footer warning card MUST display the message "Debes esperar unos minutos antes de realizar otro retiro con el mismo monto" with exact text match
- **FR-034**: The warning card MUST use role="note" for non-blocking informational content
- **FR-035**: The warning card MUST display the icon from /src/assets/brake-warning-llustration.png with alt text "Advertencia", width 32, height 32
- **FR-036**: The primary action button in the footer MUST maintain aria-label attribute
- **FR-037**: The primary action button in the footer MUST maintain aria-disabled attribute consistent with disabled state

**Cooldown Enforcement**

- **FR-038**: When the backend returns an error response indicating cooldown enforcement, System MUST display the error message to the user
- **FR-039**: Cooldown blocking errors MUST be announced via role="alert" or aria-live="assertive"
- **FR-040**: The warning card message MUST remain visible on success screen regardless of cooldown status

**Accessibility**

- **FR-041**: All interactive elements MUST be keyboard operable (Tab, Enter, Space)
- **FR-042**: All interactive elements MUST have visible focus states with 2px outline and 3:1 contrast ratio
- **FR-043**: Success screen MUST move focus to the success title on mount for screen reader discoverability
- **FR-044**: Loading states MUST use role="status" or aria-live="polite" for non-urgent updates
- **FR-045**: Error states MUST use role="alert" or aria-live="assertive" for urgent notifications

**Reliability**

- **FR-046**: System MUST be resilient to double clicks during slow network conditions
- **FR-047**: System MUST NOT create duplicate withdrawal submissions from repeated button taps
- **FR-048**: Retry functionality MUST be predictable and MUST NOT create duplicate submissions
- **FR-049**: System MUST use the same 5-second timeout pattern for POST /withdrawals as other API calls

**Observability**

- **FR-050**: System MUST log successful withdrawal submissions to browser console including withdrawal ID, amount, currency, and bankAccountId (for debugging and monitoring)
- **FR-051**: System MUST log failed withdrawal submissions to browser console including error type, status code, and error detail (for debugging and operational monitoring)
- **FR-052**: Logged events MUST include timestamp and be formatted for easy filtering and analysis

### Key Entities

- **Withdrawal Request**: Represents the user's submitted withdrawal transaction
  - Attributes: id (UUID), userId (UUID), amount (number), bankAccountId (UUID), currency (string), status (string, e.g., "pending"), createdAt (ISO datetime string)
  - Created via POST /withdrawals API endpoint
  - Success response includes all attributes listed above
  - Used to confirm successful submission and display transaction details

- **Problem Details Error**: Standard error response format from API
  - Attributes: type (URL), title (string), status (number), detail (string), instance (string), bankAccountId (UUID)
  - Returned when withdrawal submission fails
  - The `detail` field provides the user-facing error message
  - The `type` field indicates the error category (e.g., "bank-account-not-found")

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the entire withdrawal submission flow (select account, submit, view confirmation) in under 30 seconds under normal network conditions
- **SC-002**: 100% of rapid triple-click attempts on "Retirar fondos" result in only one API call (zero duplicate submissions)
- **SC-003**: Users receive visual confirmation of submission within 200ms of clicking "Retirar fondos" (loading state appears immediately)
- **SC-004**: 100% of successful withdrawals display the correct last 4 digits of the selected account on the success screen
- **SC-005**: Users can successfully retry failed submissions 100% of the time without creating duplicate withdrawal requests
- **SC-006**: Screen reader users receive appropriate announcements for all loading, error, and success states (validated through automated tests and manual testing)
- **SC-007**: Users returning to /rewards from success screen see updated balance reflecting the withdrawal within 2 seconds
- **SC-008**: The warning card message is visible on 100% of /withdraw and /withdraw/success screen views
- **SC-009**: Zero layout shifts occur when transitioning between loading, error, and success states (CLS = 0)
- **SC-010**: 95% of users successfully complete withdrawal submission on their first attempt (no errors, no confusion)

## Assumptions

1. **API Availability**: We assume the POST /withdrawals endpoint is implemented and available at http://localhost:3000/withdrawals with the exact contract specified
2. **Authentication**: We assume the userId is available from the application's authentication state (consistent with existing x-user-id header pattern)
3. **Currency Consistency**: We assume the currency from the rewards balance (used throughout the app) is the same currency used for withdrawals
4. **Success Image**: We assume the success-check.png image exists at /client/src/assets/success-check.png; if the image fails to load, a CSS-based checkmark icon (Unicode ✓ or inline SVG) serves as fallback
5. **Navigation State**: We assume React Router's navigation state can persist the withdrawal response data (including id, bankAccountId, amount, currency, status, createdAt, and account last 4 digits) when navigating to the success screen
6. **Balance Refetch**: We assume the existing rewards summary hook (useRewardsSummary) has a refetch mechanism that can be triggered on navigation back to /rewards
7. **Error Response Format**: We assume all API errors follow the Problem Details format with type, title, status, detail, instance fields
8. **Cooldown Enforcement**: We assume cooldown validation happens on the backend; the frontend only displays the warning and error messages
9. **Existing Patterns**: We assume the submission button styling, loading states, and error handling follow the patterns established in 002-withdraw feature
10. **Font Availability**: We assume Poppins font is available in the application or can be loaded via Google Fonts or similar

## Dependencies

- **002-withdraw feature**: Requires the withdraw screen (/withdraw) with account selection functionality to be implemented and working
- **POST /withdrawals API**: Requires backend endpoint to be implemented and deployed
- **useRewardsSummary hook**: Requires the existing hook to support refetch/cache invalidation
- **React Router**: Requires React Router for navigation and state management between screens
- **Assets**: Requires success-check.png and brake-warning-llustration.png images

## Out of Scope

- **Backend Implementation**: The POST /withdrawals API endpoint implementation is out of scope - only the frontend submission flow is covered
- **Account Linking**: Adding new bank accounts or managing account verification is out of scope
- **Withdrawal History**: Viewing a list of past withdrawals is out of scope (separate feature)
- **Transaction Fees**: Calculating or displaying withdrawal fees is out of scope
- **Partial Withdrawals**: Allowing users to withdraw less than their full balance is out of scope (amount is pre-filled with full balance per 002-withdraw)
- **Multi-Currency**: Converting between currencies or handling multiple currency balances is out of scope
- **Email Notifications**: Sending confirmation emails after successful withdrawal is out of scope
- **Receipt Download**: Providing a downloadable receipt or PDF confirmation is out of scope
- **Cooldown Enforcement Logic**: Backend cooldown validation and timing logic is out of scope - frontend only displays messages
