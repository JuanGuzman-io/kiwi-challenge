# Feature Specification: Withdraw - Choose Method and Amount

**Feature Branch**: `002-withdraw`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "US2 – Withdraw (Choose Method and Amount) - Allow the user to initiate a withdrawal by reviewing the withdrawal amount and selecting a withdrawal method or bank account before submitting the request"

## Clarifications

### Session 2026-01-11

- Q: What is the structure of the bank account data returned by GET /bank-accounts? → A: Object with {accounts: Array<{id, lastFourDigits, accountType, isActive, createdAt}>, count: number}
- Q: What placeholder text should the account selector display when no account is selected? → A: Selecciona una cuenta
- Q: Where should keyboard focus return after selecting an account and returning to the withdraw screen? → A: Return focus to the primary action button (now enabled) as the natural next action

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select Withdrawal Account (Priority: P1)

As a user with available rewards balance, I want to select a bank account for withdrawal so that I can receive my rewards funds in my preferred account.

**Why this priority**: This is the core capability - users must be able to select where their funds should be deposited. Without this, no withdrawal can occur.

**Independent Test**: Can be fully tested by navigating to /withdraw with a non-zero balance, selecting a bank account from the list, and verifying the account appears as selected. Delivers value by allowing users to specify where they want their money sent.

**Acceptance Scenarios**:

1. **Given** I have a rewards balance of $100 and multiple bank accounts linked, **When** I navigate to /withdraw, **Then** I see "Elige tu método de retiro" as the title, my $100 balance displayed prominently, and the primary action button is disabled
2. **Given** I am on the withdraw screen with no account selected, **When** I tap the account selector control, **Then** I navigate to /withdraw/accounts and see a list of my available bank accounts
3. **Given** I am viewing my list of bank accounts, **When** I select an account ending in 1234, **Then** I return to the withdraw screen and see the masked account "•••• 1234" displayed in the selector
4. **Given** I have selected a bank account, **When** I view the withdraw screen, **Then** the primary action button is now enabled
5. **Given** I am on the account selection screen with 5 accounts, **When** I use keyboard navigation (Tab/Arrow keys), **Then** I can navigate through all accounts and select one with Enter or Space

---

### User Story 2 - Handle Loading and Error States (Priority: P2)

As a user attempting to withdraw funds, I want clear feedback when the system is loading my accounts or encounters an error so that I understand what's happening and can take corrective action if needed.

**Why this priority**: Essential for user experience and error recovery, but secondary to the core account selection functionality. Users need to know when things are loading or have failed.

**Independent Test**: Can be tested by simulating slow network conditions or API failures and verifying appropriate loading indicators and error messages appear with retry options.

**Acceptance Scenarios**:

1. **Given** I navigate to /withdraw, **When** the system is fetching my bank accounts, **Then** I see a loading indicator or skeleton UI in the account selector area, and screen readers announce "Loading accounts"
2. **Given** the bank accounts API fails with a 500 error, **When** I am on the withdraw screen, **Then** I see a clear error message "No pudimos cargar tus cuentas bancarias" with a "Intentar de nuevo" retry button
3. **Given** I see an error message, **When** I tap the retry button, **Then** the system attempts to fetch my bank accounts again and shows loading state
4. **Given** my screen reader is enabled and accounts are loading, **When** the loading state changes, **Then** the screen reader announces the state via aria-live region

---

### User Story 3 - Prevent Duplicate Submissions (Priority: P2)

As a user ready to withdraw funds, I want protection against accidentally submitting the withdrawal multiple times so that I don't create duplicate transactions.

**Why this priority**: Important for data integrity and user confidence, but doesn't block the core selection flow. Prevents costly mistakes.

**Independent Test**: Can be tested by rapidly tapping the submit button multiple times and verifying only one submission occurs with appropriate visual feedback during processing.

**Acceptance Scenarios**:

1. **Given** I have selected a bank account, **When** I tap the primary action button, **Then** the button becomes disabled immediately to prevent double-taps
2. **Given** I have initiated a withdrawal submission, **When** the request is in progress, **Then** the button shows a loading indicator and remains disabled
3. **Given** I attempt to tap the submit button twice in rapid succession, **When** processing the first tap, **Then** the second tap is ignored and does not trigger another submission

---

### Edge Cases

- What happens when a user has zero bank accounts linked?
  - The account selector should show an empty state with a message "No tienes cuentas bancarias vinculadas" and provide guidance to add one

- What happens when the withdrawal amount is zero or balance is insufficient?
  - The withdraw screen should not be accessible if balance is $0 (handled by navigation guard or disabled state from US1)
  - If balance changes to $0 while on the screen, show an appropriate message

- What happens when network connectivity is lost while on the account selection screen?
  - If accounts are already loaded, user can still select from cached list
  - If not loaded, show offline error message with retry option

- What happens when a selected account is deleted/removed from another device?
  - On submission (US3), the API will return an error that the account no longer exists
  - The withdraw screen should handle this by clearing the selection and showing an error

- What happens when keyboard focus returns after selecting an account?
  - Focus returns to the primary action button (now enabled) as the natural next step in the workflow

## Requirements *(mandatory)*

### Functional Requirements

**Withdraw Screen Display**

- **FR-001**: System MUST display the title "Elige tu método de retiro" at the top of the withdraw screen (/withdraw)
- **FR-002**: System MUST display the total withdrawal amount using the current rewards balance from US1 (Rewards Home)
- **FR-003**: System MUST format the withdrawal amount with proper currency symbol and formatting (e.g., "$1,234.56")
- **FR-004**: System MUST pre-fill the withdrawal amount with the user's current rewards balance unless otherwise specified by design requirements
- **FR-005**: System MUST display a selectable control for choosing a withdrawal account/method

**Account Selection Interaction**

- **FR-006**: System MUST navigate to /withdraw/accounts when the user taps the account selector control
- **FR-007**: System MUST fetch available withdrawal accounts from GET /bank-accounts API endpoint
- **FR-008**: System MUST include x-user-id header in all API requests for authentication
- **FR-009**: System MUST display the list of available bank accounts retrieved from the API on the account selection screen
- **FR-010**: System MUST display each account item with a masked identifier showing only the last 4 digits (e.g., "•••• 1234")
- **FR-011**: System MUST allow each account item to be selectable with clear visual indication of selection state
- **FR-012**: System MUST return the user to the /withdraw screen when an account is selected
- **FR-013**: System MUST persist the selected account and display it in masked format on the withdraw screen

**Button States and Interaction**

- **FR-014**: System MUST display a primary action button on the withdraw screen
- **FR-015**: System MUST keep the primary action button disabled when no account is selected
- **FR-016**: System MUST enable the primary action button once a withdrawal account is selected
- **FR-017**: System MUST disable the primary action button while a withdrawal submission request is in progress
- **FR-018**: System MUST ignore button taps when the button is in disabled state
- **FR-019**: System MUST prevent duplicate submissions from rapid button taps using debouncing or immediate state change
- **FR-020**: System MUST display a loading indicator on the button while submission is in progress

**Loading States**

- **FR-021**: System MUST display a loading indicator or skeleton UI while fetching bank accounts
- **FR-022**: System MUST maintain stable layout during loading to prevent content shifting
- **FR-023**: System MUST announce loading states to assistive technologies using role="status" or aria-live="polite"

**Error Handling**

- **FR-024**: System MUST display a clear error message in Spanish when fetching bank accounts fails
- **FR-025**: System MUST provide a retry action button when account fetching fails
- **FR-026**: System MUST keep the withdraw screen visible and functional when errors occur (no full-page error states)
- **FR-027**: System MUST announce blocking errors to assistive technologies using role="alert" or aria-live="assertive"

**Accessibility**

- **FR-028**: System MUST make all interactive elements (account selector, account items, buttons) keyboard accessible
- **FR-029**: System MUST support Tab and Shift+Tab navigation through all interactive elements
- **FR-030**: System MUST allow account selection using Enter or Space keys
- **FR-031**: System MUST provide accessible labels for all interactive elements indicating their purpose and state
- **FR-032**: System MUST manage focus appropriately when navigating between withdraw and account selection screens
- **FR-033**: System MUST move focus to the screen title when navigating to the account selection screen
- **FR-034**: System MUST return focus to the primary action button when returning from account selection screen after selecting an account
- **FR-035**: System MUST ensure account items have accessible labels indicating account identity and selection state

**UI Design Constraints (From Design Specs)**

- **FR-036**: Withdraw screen container MUST have width: 375, height: 652, top: 54px, padding: 24px, gap: 24px, background: #FFFFFF
- **FR-037**: Title text MUST use font-weight: 600 (SemiBold), font-size: 24px, line-height: 32px, letter-spacing: 0%
- **FR-038**: "Monto total a retirar" label MUST use text small typography (regular weight)
- **FR-039**: Withdrawal amount value MUST use text 5xl typography (bold weight)
- **FR-040**: Withdraw amount section container MUST have width: 327, height: 494, gap: 24px
- **FR-041**: Primary action button disabled state MUST use background color #CBD5E1
- **FR-042**: Primary action button enabled state MUST use background color #33CAFF
- **FR-043**: Account selector MUST be visually identifiable as a selectable control (button or dropdown-like appearance)
- **FR-044**: Account selector MUST show placeholder text "Selecciona una cuenta" when no account is selected
- **FR-045**: Account selector MUST show the selected account in masked format once selected

**Performance and Reliability**

- **FR-046**: System MUST render the account list efficiently even with multiple accounts (up to 50 accounts)
- **FR-047**: System MUST remain responsive to user input during slow network conditions
- **FR-048**: System MUST handle repeated user input gracefully without creating race conditions
- **FR-049**: System MUST ensure zero duplicate withdrawal submissions can occur from the withdraw screen

### Key Entities

- **Bank Account**: Represents a user's linked bank account for receiving withdrawal funds
  - Attributes: unique identifier (id), last 4 digits (lastFourDigits, pre-masked from API), account type (accountType), active status (isActive), creation date (createdAt)
  - Retrieved from GET /bank-accounts API endpoint which returns: `{accounts: Array<{id: string, lastFourDigits: string, accountType: string, isActive: boolean, createdAt: string}>, count: number}`
  - The `id` field is used for API calls and selection tracking
  - The `lastFourDigits` field is displayed to user with bullet prefix (e.g., "•••• 1234")
  - The `accountType` field shows account type (e.g., "Checking", "Savings")
  - Only active accounts (isActive: true) should be selectable
  - Selected by user during withdrawal flow

- **Withdrawal Request**: Represents the user's intent to withdraw funds (created in US3, but prepared in US2)
  - Attributes: amount (from balance), selected account ID, timestamp, status
  - Amount is pre-filled from current rewards balance
  - Account is selected during US2 flow using the account's `id` field
  - Submitted in US3 (out of scope for this spec)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can navigate from the rewards home screen to the withdraw screen and see their balance displayed in under 1 second
- **SC-002**: Users can select a bank account from a list of up to 50 accounts without perceivable lag or UI freezing
- **SC-003**: 100% of rapid double-tap attempts on the submit button result in only one submission (zero duplicate submissions)
- **SC-004**: All loading states provide visual feedback within 200ms of the triggering action
- **SC-005**: Users can complete the account selection process using only keyboard navigation (100% keyboard accessible)
- **SC-006**: Screen reader users receive appropriate announcements for all loading and error states (validated through manual testing with VoiceOver, NVDA, or JAWS)
- **SC-007**: When account fetching fails, 100% of retry attempts successfully re-trigger the API call
- **SC-008**: The account list loads and displays within 2 seconds under normal network conditions
- **SC-009**: Zero layout shifts occur during loading states (CLS = 0)
- **SC-010**: 95% of users successfully select a withdrawal account on their first attempt (measured through user testing or analytics)

## Assumptions

1. **Balance Availability**: We assume the user's current rewards balance is available from the Rewards Home feature (US1) and can be accessed via shared state or refetched if needed
2. **Account Format**: We assume bank accounts are returned with sufficient information to display a masked identifier (last 4 digits) and a unique identifier for API calls
3. **Authentication**: We assume the x-user-id header authentication mechanism is already implemented and available
4. **Navigation**: We assume React Router or equivalent is configured for client-side routing between /withdraw and /withdraw/accounts
5. **Withdrawal Submission**: We assume the actual submission of the withdrawal (POST request) is handled in a separate user story (US3) - this spec only covers the setup and account selection
6. **Design System**: We assume the app has a consistent design system with defined typography tokens (text small, text 5xl, etc.) and color tokens
7. **Account Management**: We assume account linking/management is handled elsewhere - this flow only deals with selecting from existing accounts
8. **Currency**: We assume all amounts are displayed in the user's default currency (consistent with US1)
9. **Minimum Withdrawal**: We assume there are no minimum withdrawal amount restrictions that need to be enforced on this screen (or they are enforced elsewhere)
10. **Network Resilience**: We assume standard web/mobile app retry mechanisms are acceptable - no advanced offline-first or queue-based retry logic is required

## Dependencies

- **Rewards Home (US1)**: Requires access to the user's current rewards balance to display the withdrawal amount
- **Bank Accounts API**: Requires GET /bank-accounts endpoint to be implemented and functional
- **Authentication System**: Requires x-user-id header authentication to be configured and working
- **Routing**: Requires client-side routing to be set up for /withdraw and /withdraw/accounts routes
- **Design System**: Requires typography and color tokens to be defined in the app's design system

## Out of Scope

- **Withdrawal Submission**: Actually submitting the withdrawal request (POST) is handled in US3
- **Account Linking**: Adding or removing bank accounts is out of scope - users can only select from existing accounts
- **Partial Withdrawals**: Allowing users to withdraw less than their full balance is not included (amount is pre-filled with full balance)
- **Withdrawal History**: Viewing past withdrawals is not part of this flow
- **Transaction Fees**: Calculating or displaying withdrawal fees is not included
- **Multi-Currency**: Handling multiple currencies or currency conversion is out of scope
- **Withdrawal Limits**: Enforcing daily/monthly withdrawal limits is not included in this spec
- **Account Verification**: Verifying account ownership or requiring additional verification steps is out of scope
