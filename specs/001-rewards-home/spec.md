# Feature Specification: Rewards Overview (Rewards Home)

**Feature Branch**: `001-rewards-home`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "Rewards Overview screen displaying accumulated balance and transaction history with withdrawal capability"

## Clarifications

### Session 2026-01-11

- Q: What is the acceptable API response time threshold before showing an error state? → A: 5 seconds - Show error after 5s timeout (allows for slower connections)
- Q: Which browsers and devices must be officially supported for this feature? → A: Modern evergreen browsers only (Chrome, Firefox, Safari, Edge - last 2 versions; iOS Safari, Android Chrome)
- Q: What tone and level of detail should error messages use? → A: User-friendly with action (e.g., "No pudimos cargar tu balance. Por favor, intenta de nuevo.")
- Q: What level of logging and monitoring should be implemented for this feature? → A: Basic client-side logging (errors, API failures, load times)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Accumulated Rewards Balance (Priority: P1)

As a user, I want to see my current accumulated rewards balance prominently displayed when I open the Rewards screen, so I can quickly understand how much I have earned and whether I can make a withdrawal.

**Why this priority**: This is the primary value proposition of the feature - users need to know their balance before taking any action. Without this, the feature has no value.

**Independent Test**: Can be fully tested by opening the /rewards route and verifying that the balance card displays the user's accumulated rewards amount in the correct currency format. Delivers immediate value by showing users their current rewards status.

**Acceptance Scenarios**:

1. **Given** a user with a positive balance, **When** they open /rewards, **Then** they see their balance displayed in the summary card with currency and amount
2. **Given** a user with zero balance, **When** they open /rewards, **Then** they see "0.00" displayed in the summary card
3. **Given** the API is loading, **When** they open /rewards, **Then** they see a skeleton/loader placeholder for the balance while maintaining layout stability

---

### User Story 2 - View Transaction History (Priority: P1)

As a user, I want to see a complete history of my reward transactions organized by month, so I can understand where my rewards came from and track my earning activity over time.

**Why this priority**: This provides transparency and builds trust. Users need to understand not just their balance, but how they accumulated it. This is equally critical to balance display for an MVP.

**Independent Test**: Can be tested by seeding a user with multiple transactions (cashback, referral bonuses, withdrawals, income) and verifying that GET /rewards/transactions returns the complete transaction list grouped by month with proper formatting and newest-first ordering.

**Acceptance Scenarios**:

1. **Given** a user with transactions, **When** they open /rewards, **Then** they see transactions grouped by month headers (e.g., "Septiembre 2025", "Agosto 2025") with newest first
2. **Given** a user with transactions, **When** viewing the list, **Then** each transaction shows title/type, date, and signed amount with visual distinction between incoming (+) and outgoing (-)
3. **Given** a user with no transactions, **When** they open /rewards, **Then** they see a clear "no activity yet" message while the balance card remains visible
4. **Given** the transaction API is loading, **When** they open /rewards, **Then** they see skeleton/loader placeholders for the transaction list while keeping the balance card visible

---

### User Story 3 - Paginate Through Transaction History (Priority: P2)

As a user, I want to load more transactions as I scroll through my history, so I can view my complete transaction history without experiencing performance issues or overwhelming the interface.

**Why this priority**: Essential for users with long transaction histories, but the feature is still usable with just the first page displayed. This enables scalability without breaking the core experience.

**Independent Test**: Can be tested by seeding a user with 50+ transactions and verifying that only the first page loads initially, and clicking "Load more" appends additional transactions without resetting the existing list.

**Acceptance Scenarios**:

1. **Given** a user with many transactions, **When** they scroll to the end of the first page, **Then** they see a "Load more" button
2. **Given** a user viewing the first page, **When** they click "Load more", **Then** the next page of transactions is appended to the list without resetting existing items
3. **Given** the next page is loading, **When** the user waits, **Then** they see an inline loading indicator and the "Load more" button is disabled
4. **Given** all transactions are loaded, **When** the user reaches the end, **Then** the "Load more" button is hidden or disabled

---

### User Story 4 - Initiate Withdrawal (Priority: P2)

As a user, I want to click a "Retirar" button from the balance summary, so I can start the process of withdrawing my rewards to my bank account.

**Why this priority**: This enables the primary call-to-action, but the feature is still valuable for users who just want to view their balance and history. The withdrawal flow itself is a separate feature.

**Independent Test**: Can be tested by clicking the "Retirar" button and verifying navigation to /withdraw route. The button should be disabled when balance is zero or while the summary is loading.

**Acceptance Scenarios**:

1. **Given** a user with a positive balance, **When** they click "Retirar", **Then** they are navigated to /withdraw
2. **Given** a user with zero balance, **When** they view the balance card, **Then** the "Retirar" button is disabled
3. **Given** the balance is loading, **When** they view the balance card, **Then** the "Retirar" button is disabled
4. **Given** a user clicks "Retirar" quickly twice, **When** the navigation occurs, **Then** only one navigation happens (resilient to double-tap)

---

### Edge Cases

- What happens when the rewards summary API fails to load? → Display clear error message with retry action while keeping layout stable
- What happens when the transactions API fails to load? → Display clear error message with retry action while keeping the balance card visible
- What happens when a user has thousands of transactions? → Pagination ensures only one page loads at a time, with cursor-based pagination for consistency
- What happens when new transactions are added while the user is viewing the list? → Cursor-based pagination ensures consistent ordering; new items appear on next page load
- What happens when a user loses network connection while loading more? → Show error state with retry option, existing transactions remain visible
- What happens when API returns invalid or malformed data? → Display error state and log for debugging, maintain layout stability
- What happens when date formatting fails for a transaction? → Fallback to ISO date format or show "Unknown date"
- What happens when currency is missing or invalid? → Default to empty string for currency symbol with amount only

## Requirements *(mandatory)*

### Functional Requirements

#### Display Requirements

- **FR-001**: System MUST display a header/title "Rewards" at the top of the screen
- **FR-002**: System MUST display the user's current accumulated rewards balance with currency and amount in a prominent summary card
- **FR-003**: System MUST display the label "Monto acumulado" above the balance amount
- **FR-004**: System MUST keep the balance card visible in all states (loading, empty, error)
- **FR-005**: System MUST display a transaction history list showing title/type, date, and signed amount for each transaction
- **FR-006**: System MUST group transactions by month with Spanish month name and year headers (e.g., "Septiembre 2025", "Agosto 2025")
- **FR-007**: System MUST display transactions in newest-first order (descending by date)
- **FR-008**: System MUST display signed amounts with positive (+) for incoming transactions and negative (-) for outgoing transactions
- **FR-009**: System MUST provide clear visual distinction between incoming and outgoing transactions
- **FR-010**: System MUST display transaction types including Cashback, Referral bonus, Withdrawal, and Income

#### Interaction Requirements

- **FR-011**: System MUST display a "Retirar" button in the balance summary card as a primary action
- **FR-012**: System MUST navigate to /withdraw when the "Retirar" button is clicked
- **FR-013**: System MUST disable the "Retirar" button when balance is zero or less
- **FR-014**: System MUST disable the "Retirar" button while the summary is loading
- **FR-015**: System MUST prevent multiple navigations from rapid clicks on the "Retirar" button (double-tap protection)
- **FR-016**: System MUST support pagination with a "Load more" button for transaction history
- **FR-017**: System MUST append new transactions when "Load more" is clicked without resetting existing items
- **FR-018**: System MUST disable the "Load more" button while loading the next page
- **FR-019**: System MUST hide or disable the "Load more" button when all transactions are loaded
- **FR-020**: System MUST maintain layout stability when loading more transactions (no content jump)

#### Data Requirements

- **FR-021**: System MUST include x-user-id header in all API requests
- **FR-022**: System MUST fetch balance and currency from GET /rewards/summary
- **FR-023**: System MUST fetch paginated transaction history from GET /rewards/transactions
- **FR-024**: System MUST use cursor-based pagination for transaction history to ensure consistency

#### State Management Requirements

- **FR-025**: System MUST display skeleton/loader placeholders while balance is loading
- **FR-026**: System MUST display skeleton/loader placeholders while transactions are loading
- **FR-027**: System MUST show inline loading indicator while loading next page of transactions
- **FR-028**: System MUST keep existing transactions visible while loading next page
- **FR-029**: System MUST announce loading status to assistive technology with role="status" or aria-live="polite"
- **FR-030**: System MUST display "no activity yet" message when user has no transactions
- **FR-031**: System MUST keep balance card visible in empty state
- **FR-032**: System MUST hide or disable "Load more" in empty state
- **FR-033**: System MUST display user-friendly error message with retry action when summary API fails or exceeds 5-second timeout (e.g., "No pudimos cargar tu balance. Por favor, intenta de nuevo.")
- **FR-034**: System MUST display user-friendly error message with retry action when transactions API fails or exceeds 5-second timeout (e.g., "No pudimos cargar tus transacciones. Por favor, intenta de nuevo.")
- **FR-035**: System MUST keep balance card visible when transactions API fails
- **FR-036**: System MUST announce errors to assistive technology with role="alert" or aria-live="assertive"
- **FR-037**: System MUST maintain layout stability in all states (avoid blank screen or content jump)

#### Formatting Requirements

- **FR-038**: System MUST format currency consistently across the entire screen
- **FR-039**: System MUST format dates consistently across transaction list and month headers
- **FR-040**: System MUST format signed amounts consistently with + or - prefix
- **FR-041**: System MUST format month group headers consistently with Spanish month name + year

#### Accessibility Requirements

- **FR-042**: System MUST support keyboard navigation for transaction list
- **FR-043**: System MUST make "Retirar", "Load more", and "Retry" buttons keyboard accessible (reachable and operable)
- **FR-044**: System MUST provide clear accessible names for all interactive elements (using aria-label where needed)
- **FR-045**: System MUST provide visible focus states for all interactive elements
- **FR-046**: System MUST comply with WCAG 2.1 AA standards

#### Compatibility Requirements

- **FR-047**: System MUST be fully functional on modern evergreen browsers: Chrome (last 2 versions), Firefox (last 2 versions), Safari (last 2 versions), Edge (last 2 versions)
- **FR-048**: System MUST be fully functional on mobile browsers: iOS Safari and Android Chrome
- **FR-049**: System MUST provide consistent user experience across all supported browsers and devices

#### Performance Requirements

- **FR-050**: System MUST NOT render an unbounded transaction list
- **FR-051**: System MUST use pagination to keep rendering predictable
- **FR-052**: System MUST memoize transaction grouping computation to avoid expensive re-calculations on every render
- **FR-053**: System MUST implement 5-second timeout for all API requests (summary and transactions)

#### Observability Requirements

- **FR-054**: System MUST log all API failures (summary and transactions endpoints) with error details
- **FR-055**: System MUST log API timeout events when requests exceed 5-second threshold
- **FR-056**: System MUST track and log page load time from route entry to balance display
- **FR-057**: System MUST log client-side errors that prevent feature functionality
- **FR-058**: System MUST NOT log sensitive user data (balance amounts, transaction details, user identifiers) in client-side logs

### UI Layout Constraints

- **FR-059**: Screen container MUST have width: 375px (mobile-first, responsive to larger viewports)
- **FR-060**: Screen container MUST have padding: 24px and gap: 24px
- **FR-061**: Screen container MUST have background color: #FFFFFF
- **FR-062**: Balance amount and "Retirar" button MUST use accent color: #043960
- **FR-063**: Summary card MUST have width: 327px, padding: 16px, gap: 8px, border-radius: 8px, border-width: 1px, border-color: #E2E8EF
- **FR-064**: "Retirar" button MUST have width: 64px, height: 20px, border-radius: pill shape, padding: 2px 4px 2px 4px
- **FR-065**: "Retirar" button MUST display trailing icon (arrow_right_line)

### Key Entities

- **User**: Represents the authenticated user viewing their rewards. Identified by x-user-id header. Has accumulated balance and transaction history.
- **Rewards Summary**: Represents the user's current balance state. Contains currency and amount fields.
- **Transaction**: Represents a single reward-related activity (credit or debit). Contains id, type (CASHBACK, REFERRAL_BONUS, WITHDRAWAL, INCOME), amount (signed), description/title, and timestamp (createdAt).
- **Transaction Page**: Represents a paginated set of transactions. Contains array of transactions, nextCursor for pagination, hasMore flag, and count.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view their current rewards balance within 2 seconds of opening the /rewards screen
- **SC-002**: Users can understand their transaction history by viewing month-grouped transactions with clear type labels and signed amounts
- **SC-003**: Users can successfully navigate to withdrawal flow by clicking "Retirar" button on first attempt
- **SC-004**: System supports displaying at least 1,000 transactions per user without performance degradation
- **SC-005**: 95% of users can successfully complete primary task (view balance and understand history) without errors
- **SC-006**: Screen remains fully functional and readable at mobile width (375px) and scales responsively to larger viewports
- **SC-007**: All interactive elements are keyboard accessible and screen reader compatible (WCAG 2.1 AA compliance)
- **SC-008**: Loading states maintain layout stability with zero layout shift (no content jump)
- **SC-009**: Error states provide clear actionable recovery paths (retry) in 100% of failure scenarios
- **SC-010**: Pagination appends new transactions without resetting existing view, maintaining user context

### User Experience Metrics

- **SC-011**: Users understand the difference between incoming and outgoing transactions through visual distinction
- **SC-012**: Month grouping helps users navigate their transaction history chronologically
- **SC-013**: "Retirar" button is discoverable and its disabled state is clearly communicated
- **SC-014**: Empty states provide clear guidance without confusion
- **SC-015**: Error messages are clear, non-technical, user-friendly (in Spanish), and actionable with visible retry options

## Assumptions *(documenting reasonable defaults)*

- **A-001**: Users are already authenticated, and x-user-id is available from authentication context
- **A-002**: Backend API endpoints (GET /rewards/summary, GET /rewards/transactions) already exist and follow documented contracts
- **A-003**: Currency format follows standard locale-specific formatting (e.g., USD: $1,234.56, EUR: €1.234,56)
- **A-004**: Date formatting uses Spanish locale for month names (Enero, Febrero, Marzo, etc.)
- **A-005**: Transaction types map to user-friendly labels (CASHBACK → "Cashback", REFERRAL_BONUS → "Referral bonus", WITHDRAWAL → "Withdrawal", INCOME → "Income")
- **A-006**: Default page size for transactions is 20 items per page (reasonable default for mobile scrolling)
- **A-007**: Withdrawal flow (/withdraw) is a separate feature and out of scope for this specification
- **A-008**: Bank account linking is handled separately and out of scope for this specification
- **A-009**: User remains on the same screen while loading more transactions (no route changes)
- **A-010**: Network retry logic uses exponential backoff with reasonable defaults (3 attempts max)
- **A-011**: Loading indicators use standard skeleton/shimmer patterns familiar to mobile users
- **A-012**: Focus management follows standard web accessibility patterns (focus visible on interactive elements)
- **A-013**: The arrow_right_line icon asset will be provided or sourced from a standard icon library
- **A-014**: Color contrast ratios meet WCAG AA standards for #043960 on white background
- **A-015**: Transaction descriptions are provided by the backend and don't require frontend transformation (beyond type mapping)
- **A-016**: All UI text including labels, buttons, error messages, and empty states are displayed in Spanish (consistent with "Monto acumulado" and "Retirar" labels)

## Dependencies

- **Backend API**: GET /rewards/summary and GET /rewards/transactions endpoints must be available and return data in expected format
- **Authentication Service**: x-user-id must be available from authentication context/session
- **Icon Assets**: arrow_right_line icon must be available or sourced
- **Routing Library**: Application must support client-side routing to /withdraw

## Out of Scope

- Withdrawal flow implementation (separate feature)
- Bank account management (separate feature)
- Rewards earning mechanisms (out of scope, assumes transactions are created by other systems)
- Real-time transaction updates (polling or WebSocket)
- Transaction filtering or search functionality
- Export transaction history
- Transaction details view (drill-down)
- Multi-currency support (assumes single currency per user)
- Dark mode or theme customization
