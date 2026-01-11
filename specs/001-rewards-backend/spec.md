# Feature Specification: Rewards Application Backend API

**Feature Branch**: `001-rewards-backend`
**Created**: 2026-01-10
**Status**: Draft
**Input**: User description: "Build the backend for a Rewards application that matches the following product behavior, constraints, and non-goals. The goal is to support a single main screen (Rewards Home) that shows rewards balance and transaction history, and allows withdrawing funds to a linked bank account."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Rewards Balance and Transaction History (Priority: P1)

As a rewards program member, I want to view my accumulated rewards balance and complete transaction history so I can track my earnings and understand how my balance changes over time.

**Why this priority**: This is the core read functionality and the primary value proposition of the application. Users need to see their balance and history before they can make any withdrawal decisions. This represents the minimum viable product.

**Independent Test**: Can be fully tested by seeding a user with various transaction types (cashback, referral bonuses, withdrawals, income) and verifying that the API returns the correct computed balance and complete transaction list sorted by date. Delivers immediate value by showing users their current financial position in the rewards program.

**Acceptance Scenarios**:

1. **Given** a user with multiple transactions in their history, **When** they request their rewards home data, **Then** the system returns their current balance computed from all ledger entries and a complete transaction history ordered by most recent first
2. **Given** a user with a balance of $150.00 from cashback and referral bonuses, **When** they view their balance, **Then** the system displays $150.00 with a breakdown showing individual transaction amounts and types
3. **Given** a user with transactions spanning multiple months, **When** they request transaction history, **Then** the system returns all transactions with timestamps, amounts, types, and descriptions in chronological order
4. **Given** a new user with no transaction history, **When** they view their rewards home, **Then** the system returns a balance of $0.00 and an empty transaction list
5. **Given** a user who has made withdrawals, **When** they view their balance, **Then** the withdrawal amounts are correctly subtracted from their total credits

---

### User Story 2 - Withdraw Funds to Linked Bank Account (Priority: P2)

As a rewards program member, I want to withdraw my accumulated rewards to one of my linked bank accounts so I can convert my rewards into usable funds.

**Why this priority**: This is the primary write operation and completes the core user value loop (earn rewards → view balance → withdraw funds). Without this feature, rewards remain locked in the system with no way for users to realize their value.

**Independent Test**: Can be fully tested by seeding a user with a positive balance and linked bank accounts, initiating a withdrawal request, and verifying that: (1) a withdrawal record is created with COMPLETED status, (2) a WITHDRAWAL transaction is added to the ledger, (3) the user's balance decreases accordingly, and (4) subsequent balance queries reflect the new amount.

**Acceptance Scenarios**:

1. **Given** a user with a balance of $100.00 and at least one linked bank account, **When** they initiate a withdrawal of $50.00 to a selected bank account, **Then** the system creates a withdrawal record, deducts $50.00 from their balance, adds a WITHDRAWAL transaction to the ledger, and returns success with the new balance of $50.00
2. **Given** a user attempts to withdraw an amount greater than their current balance, **When** they submit the withdrawal request, **Then** the system rejects the request with a 400 Bad Request response and RFC 7807 error details indicating insufficient funds
3. **Given** a user attempts to withdraw an amount less than $1.00, **When** they submit the withdrawal request, **Then** the system rejects the request with a 400 Bad Request response and RFC 7807 error details indicating the minimum withdrawal amount is $1.00
4. **Given** a user with multiple linked bank accounts, **When** they select a specific account for withdrawal, **Then** the system records which account was used for audit and display purposes
5. **Given** a withdrawal completes successfully, **When** the user returns to the rewards home screen, **Then** they see the withdrawal reflected in both their updated balance and as a new transaction in their history with timestamp, amount, and the bank account used

---

### User Story 3 - View Linked Bank Accounts (Priority: P3)

As a rewards program member, I want to view my linked bank accounts so I can select one for withdrawals and verify which accounts are available.

**Why this priority**: This is a prerequisite for P2 (withdrawals) but lower priority because bank account management is typically a one-time or infrequent setup task. For the MVP, we can seed test accounts directly in the database.

**Independent Test**: Can be fully tested by seeding a user with multiple bank accounts, requesting the list of accounts, and verifying that all accounts are returned with masked account numbers and account type identifiers. Delivers value by allowing users to see their withdrawal options.

**Acceptance Scenarios**:

1. **Given** a user with three linked bank accounts, **When** they request their bank account list, **Then** the system returns all three accounts with masked account numbers and account type identifiers
2. **Given** a user with linked accounts, **When** viewing the account list, **Then** account numbers are masked for security (e.g., "****1234" showing only last 4 digits)
3. **Given** a new user with no linked accounts, **When** they request their account list, **Then** the system returns an empty list
4. **Given** a user viewing their bank accounts, **When** the data is returned, **Then** each account includes an identifier that can be used in withdrawal requests

---

### User Story 4 - Manual Balance Top-Up for Testing (Priority: P4)

As a developer or tester, I want to manually add funds to a user's rewards balance so I can test withdrawal flows and balance calculations without needing to simulate complex cashback or referral scenarios.

**Why this priority**: This is a developer/tester utility feature, not core user functionality. It's included to support efficient testing and demonstration but has no end-user value in production.

**Independent Test**: Can be fully tested by calling the top-up endpoint with a specified amount and user, then verifying that: (1) an INCOME transaction is created in the ledger, (2) the user's balance increases by the specified amount, and (3) the transaction appears in the user's history with a clear testing indicator.

**Acceptance Scenarios**:

1. **Given** a user with a balance of $50.00, **When** a tester adds $100.00 via the manual top-up endpoint, **Then** the system creates an INCOME transaction, increases the balance to $150.00, and marks the transaction with a source indicator like "MANUAL_TEST_TOPUP"
2. **Given** a tester wants to set up a test scenario, **When** they use the manual top-up endpoint, **Then** the added funds immediately appear in the user's balance and transaction history
3. **Given** the application is deployed to a production environment, **When** any request attempts to use the manual top-up endpoint, **Then** the system rejects the request as unavailable or unauthorized
4. **Given** a tester adds funds via the top-up endpoint, **When** viewing transaction history, **Then** the INCOME transaction is clearly labeled with a reason (e.g., "MANUAL_TEST_TOPUP") to distinguish it from real earnings

---

### Edge Cases

- What happens when a user attempts to withdraw exactly their current balance (boundary condition)?
  - System should allow this and reduce balance to $0.00

- What happens when a user attempts to withdraw an amount less than $1.00?
  - System rejects the request with a clear error message indicating the $1.00 minimum
  - This prevents micro-transaction processing overhead

- What happens when a user has pending withdrawals from a previous implementation (if status tracking is added)?
  - For this simplified version, all withdrawals complete immediately with COMPLETED status

- What happens when the same bank account is used for multiple withdrawals?
  - System should allow this and track each withdrawal independently with timestamps

- What happens when transaction history grows very large (e.g., 10,000+ transactions)?
  - System uses cursor-based pagination with a page size of 50 transactions per request
  - Cursor ensures consistent results even when new transactions are added during pagination
  - Frontend can request additional pages using the cursor from the previous response

- What happens when a user has only negative balance due to data migration or errors?
  - System should reject withdrawal attempts and display the negative balance (edge case requiring manual investigation)

- What happens when currency precision causes rounding issues (e.g., $0.001)?
  - System should use standard currency precision (2 decimal places for USD) and round consistently

- What happens when a user's identity header is missing or invalid?
  - In development/test: fall back to a deterministic seeded user (if configured)
  - In production: reject with 401 Unauthorized

- What happens when a user submits multiple concurrent withdrawal requests?
  - System uses database-level row locking to serialize withdrawal requests per user
  - Second request blocks until first completes, then processes if balance still permits
  - Prevents race conditions in balance calculation

## Clarifications

### Session 2026-01-10

- Q: How should the system handle concurrent withdrawal attempts for the same user? → A: Database-level row locking - block second request until first completes
- Q: What structured logging requirements should be specified for operational observability? → A: Log levels with structured fields (user_id, amount, transaction_id) for operations and errors
- Q: How should transaction history pagination be implemented? → A: Cursor-based with page size (e.g., 50 items per page, cursor for next page)
- Q: What is the minimum withdrawal amount that should be enforced? → A: $1.00 minimum (industry standard for micro-transaction prevention)
- Q: What standardized error response format should the API return? → A: RFC 7807 Problem Details (standard format with type, title, status, detail, instance)

## Requirements *(mandatory)*

### Functional Requirements

#### Core Balance and Ledger

- **FR-001**: System MUST compute rewards balance in real-time from the ledger by summing all credit transactions (CASHBACK, REFERRAL_BONUS, INCOME) and subtracting all debit transactions (WITHDRAWAL)
- **FR-002**: System MUST maintain a complete transaction ledger as the single source of truth for all balance changes
- **FR-003**: System MUST never store a balance field directly on user records; balance is always computed from the ledger
- **FR-004**: System MUST record every balance change as a transaction in the ledger with transaction type, amount, timestamp, and description
- **FR-005**: System MUST support four transaction types: CASHBACK (credit), REFERRAL_BONUS (credit), WITHDRAWAL (debit), and INCOME (credit for testing)

#### Transaction History

- **FR-006**: System MUST provide complete transaction history for each user showing all ledger entries with type, amount, timestamp, and description
- **FR-007**: System MUST order transaction history by most recent first (descending timestamp)
- **FR-008**: System MUST include descriptive information for each transaction (e.g., "Cashback from purchase", "Referral bonus for friend signup", "Withdrawal to Bank Account ****1234")
- **FR-009**: System MUST implement cursor-based pagination for transaction history with a default page size of 50 transactions
- **FR-010**: System MUST return a cursor token with each paginated response that can be used to fetch the next page of results
- **FR-011**: System MUST ensure cursor-based pagination returns consistent results even when new transactions are added between page requests

#### Withdrawal Functionality

- **FR-012**: System MUST allow users to initiate withdrawals to any of their linked bank accounts
- **FR-013**: System MUST validate that withdrawal amount does not exceed current available balance
- **FR-014**: System MUST reject withdrawal requests for amounts less than $1.00 (minimum withdrawal amount)
- **FR-015**: System MUST create a withdrawal record tracking the amount, target bank account, status, creation timestamp, and completion timestamp
- **FR-016**: System MUST complete all withdrawals immediately with COMPLETED status (simplified for demo purposes)
- **FR-017**: System MUST create a corresponding WITHDRAWAL transaction in the ledger when a withdrawal is processed
- **FR-018**: System MUST update the user's computed balance immediately after withdrawal completion
- **FR-019**: System MUST use database-level row locking to serialize concurrent withdrawal requests for the same user, preventing race conditions in balance calculation

#### Bank Account Management

- **FR-020**: System MUST allow users to view their list of linked bank accounts
- **FR-021**: System MUST mask bank account numbers for security, showing only the last 4 digits (e.g., "****1234")
- **FR-022**: System MUST associate each bank account with an account type identifier (e.g., "Checking", "Savings")
- **FR-023**: System MUST ensure all bank accounts are scoped to individual users (no cross-user account access)

#### User Identity and Ownership

- **FR-024**: System MUST enforce user ownership rules ensuring users can only access their own transactions, withdrawals, and bank accounts
- **FR-025**: System MUST accept a user identifier through a request header (e.g., x-user-id) for development and testing purposes
- **FR-026**: System MUST populate the current user context from the identity header for all authenticated requests
- **FR-027**: In development and test environments, system MAY fall back to a deterministic seeded user if the identity header is missing
- **FR-028**: In production environments, system MUST reject requests without a valid identity header with 401 Unauthorized
- **FR-029**: System MUST ensure the identity mechanism is explicitly disabled or secured in production to prevent identity spoofing

#### Testing and Development Utilities

- **FR-030**: System MUST provide an endpoint to manually add INCOME transactions for testing purposes
- **FR-031**: System MUST mark manual top-up transactions with a clear source indicator (e.g., "MANUAL_TEST_TOPUP") for audit clarity
- **FR-032**: System MUST document the manual top-up endpoint as development and testing only
- **FR-033**: System MUST disable or guard the manual top-up endpoint in production environments

#### Currency and Precision

- **FR-034**: System MUST use a single global currency (USD assumed) for all rewards and transactions
- **FR-035**: System MUST use standard currency precision (2 decimal places) for all monetary amounts
- **FR-036**: Multi-currency support is explicitly out of scope

#### Observability and Logging

- **FR-037**: System MUST log all key operations using structured logging with consistent fields including user_id, amount, and transaction_id where applicable
- **FR-038**: System MUST use appropriate log levels: INFO for successful operations (withdrawals, balance queries, top-ups), WARN for validation failures (insufficient funds, invalid amounts), ERROR for system failures (database errors, unexpected exceptions)
- **FR-039**: System MUST include contextual information in error logs to support debugging: operation type, input parameters, user identifier, and error details
- **FR-040**: Structured log fields MUST use consistent naming conventions across all services for log aggregation and analysis

#### API Error Responses

- **FR-041**: System MUST return error responses following RFC 7807 Problem Details format with Content-Type: application/problem+json
- **FR-042**: Error responses MUST include required fields: type (URI reference identifying the problem type), title (short human-readable summary), status (HTTP status code), detail (specific explanation for this occurrence)
- **FR-043**: Error responses MAY include optional fields: instance (URI reference identifying the specific occurrence) and extension fields for additional context (e.g., validation errors)
- **FR-044**: System MUST define distinct problem types for each error category: insufficient funds, minimum amount not met, invalid identity, resource not found, concurrent modification conflict

### Key Entities *(include if feature involves data)*

- **User**: Represents a rewards program member. Contains user identification and profile information. Does NOT contain a balance field (balance computed from ledger). Has relationships to BankAccount, RewardTransaction, and Withdrawal entities.

- **BankAccount**: Represents a linked bank account for withdrawals. Contains account number (stored securely, displayed masked), account type identifier, and reference to owning User. Used to specify withdrawal destination.

- **RewardTransaction**: The ledger and single source of truth for balance and history. Contains transaction type (CASHBACK, REFERRAL_BONUS, WITHDRAWAL, INCOME), amount (positive for credits, negative for debits), timestamp, description/reason, and reference to User. Balance is computed by summing all transactions for a user.

- **Withdrawal**: Represents a withdrawal request and workflow. Contains amount, status (COMPLETED for this simplified version), creation timestamp, completion timestamp, reference to target BankAccount, and reference to User. Links to corresponding RewardTransaction in ledger.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view their current rewards balance and complete transaction history in a single request
- **SC-002**: Balance calculations are accurate and consistent, matching the sum of all ledger transactions within 0.01 precision
- **SC-003**: Withdrawal requests complete immediately (under 2 seconds) and correctly update balance and transaction history
- **SC-004**: Users can successfully withdraw their entire balance or any partial amount without errors
- **SC-005**: System rejects invalid withdrawal attempts (insufficient funds, amounts below $1.00 minimum) with standardized RFC 7807 error responses that are machine-readable and user-friendly
- **SC-006**: Transaction history remains consistent and complete, with all balance changes recorded as ledger entries
- **SC-007**: Bank account information is displayed securely with masked account numbers
- **SC-008**: System handles at least 100 concurrent users viewing balances or initiating withdrawals without degradation
- **SC-009**: Developers and testers can set up test scenarios using manual top-up without database access
- **SC-010**: All resources (transactions, bank accounts, withdrawals) are properly scoped to individual users with no cross-user data leakage

### Assumptions

- Users are already authenticated and inside the application (no login flow in scope)
- Bank accounts are pre-linked through a separate process (account linking/management not in scope for MVP)
- Withdrawals succeed immediately without external payment processor integration (simplified for demo)
- A deterministic seeded user is available in development/test environments for identity fallback
- Currency is USD with 2 decimal place precision
- Transaction history uses cursor-based pagination with 50 transactions per page by default
- Production deployment includes environment-based configuration to disable test-only features

### Out of Scope

- User registration and authentication (login/logout flows)
- Bank account linking and verification
- External payment processor integration for real withdrawals
- Multi-currency support or currency conversion
- Withdrawal approval workflows or pending states
- Fraud detection or withdrawal limits
- Email or push notifications for withdrawals
- Audit logging beyond transaction ledger and structured logs
