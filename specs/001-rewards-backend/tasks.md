# Tasks: Rewards Application Backend API

**Input**: Design documents from `/specs/001-rewards-backend/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Test tasks are included as per constitution requirement (85%+ unit test coverage for services)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a single backend project with paths relative to `server/` directory:
- **Source**: `server/src/`
- **Tests**: `server/test/`
- **Prisma**: `server/prisma/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize NestJS project with TypeScript 5.7.3 in server/ directory
- [x] T002 [P] Install primary dependencies (NestJS 11.0.1, Prisma, @nestjs/swagger, class-validator, class-transformer) in server/package.json
- [x] T003 [P] Install testing dependencies (Jest 29.7.0, @nestjs/testing, supertest) in server/package.json
- [x] T004 [P] Configure TypeScript compiler options in server/tsconfig.json
- [x] T005 [P] Configure NestJS CLI in server/nest-cli.json
- [x] T006 [P] Setup ESLint with named exports rule in server/.eslintrc.js
- [x] T007 [P] Setup Prettier formatting in server/.prettierrc
- [x] T008 [P] Create .env.example with DATABASE_URL, NODE_ENV, PORT, LOG_LEVEL, ALLOW_IDENTITY_FALLBACK, ENABLE_INCOME_ENDPOINT in server/
- [x] T009 [P] Create .gitignore with node_modules, dist, .env, coverage in server/
- [x] T010 Create directory structure (src/common/, src/users/, src/rewards/, src/withdrawals/, src/bank-accounts/, src/prisma/) in server/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & Prisma Setup

- [ ] T011 Create Prisma schema with User, BankAccount, RewardTransaction, Withdrawal models in server/prisma/schema.prisma
- [ ] T012 Configure PostgreSQL connection in server/prisma/schema.prisma datasource
- [ ] T013 Add enums (TransactionType: CASHBACK, REFERRAL_BONUS, WITHDRAWAL, INCOME; WithdrawalStatus: COMPLETED) in server/prisma/schema.prisma
- [ ] T014 Add indexes on userId, (userId, createdAt), (userId, isActive) in server/prisma/schema.prisma
- [ ] T015 Generate Prisma Client with npx prisma generate
- [ ] T016 Create initial migration with npx prisma migrate dev --name init
- [ ] T017 Create database seed script with test users and bank accounts in server/prisma/seed.ts
- [ ] T018 Configure prisma seed command in server/package.json

### Prisma Integration Module

- [ ] T019 Create PrismaModule in server/src/prisma/prisma.module.ts
- [ ] T020 Create PrismaService extending PrismaClient with onModuleInit lifecycle in server/src/prisma/prisma.service.ts

### Common Infrastructure - Guards

- [ ] T021 Create IdentityGuard reading x-user-id header in server/src/common/guards/identity.guard.ts
- [ ] T022 Implement environment-aware fallback logic (dev/test: allow fallback, production: 401) in server/src/common/guards/identity.guard.ts
- [ ] T023 Add user lookup via UsersService in IdentityGuard in server/src/common/guards/identity.guard.ts

### Common Infrastructure - Decorators

- [ ] T024 [P] Create CurrentUser decorator extracting user from request in server/src/common/decorators/current-user.decorator.ts

### Common Infrastructure - Exception Filters

- [ ] T025 Create RFC 7807 ProblemDetails builder utility in server/src/common/exceptions/problem-details.ts
- [ ] T026 Create InsufficientFundsException with RFC 7807 format in server/src/common/exceptions/insufficient-funds.exception.ts
- [ ] T027 [P] Create MinimumAmountException with RFC 7807 format in server/src/common/exceptions/minimum-amount.exception.ts
- [ ] T028 [P] Create BankAccountNotFoundException with RFC 7807 format in server/src/common/exceptions/bank-account-not-found.exception.ts
- [ ] T029 Create HttpExceptionFilter implementing RFC 7807 response format in server/src/common/filters/http-exception.filter.ts
- [ ] T030 Add Content-Type: application/problem+json header to HttpExceptionFilter in server/src/common/filters/http-exception.filter.ts

### Common Infrastructure - Interceptors & Logging

- [ ] T031 [P] Install nestjs-pino for structured logging in server/package.json
- [ ] T032 [P] Configure Pino logger with structured fields (userId, requestId, operation) in server/src/main.ts
- [ ] T033 [P] Configure log level from environment (INFO/WARN/ERROR) in server/src/main.ts
- [ ] T034 [P] Create TransformInterceptor for response transformation in server/src/common/interceptors/transform.interceptor.ts

### Users Module (Minimal - Identity Support Only)

- [ ] T035 Create UsersModule in server/src/users/users.module.ts
- [ ] T036 Create User entity wrapper in server/src/users/entities/user.entity.ts
- [ ] T037 Create UsersService with findById method for identity guard in server/src/users/users.service.ts

### Application Bootstrap

- [ ] T038 Configure Swagger documentation in main.ts with title, description, version in server/src/main.ts
- [ ] T039 Setup global validation pipe with class-validator in server/src/main.ts
- [ ] T040 Register global HttpExceptionFilter in server/src/main.ts
- [ ] T041 Register global IdentityGuard in server/src/main.ts
- [ ] T042 Configure CORS in server/src/main.ts
- [ ] T043 Create AppModule importing all feature modules in server/src/app.module.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Rewards Balance and Transaction History (Priority: P1) 🎯 MVP

**Goal**: Enable users to view their accumulated rewards balance and complete transaction history with cursor-based pagination

**Independent Test**: Seed a user with various transaction types (cashback, referral bonuses, withdrawals, income) and verify that GET /rewards/summary returns correct computed balance and GET /rewards/transactions returns complete paginated transaction list sorted by most recent first

### Tests for User Story 1 (Unit Tests)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T044 [P] [US1] Create RewardsService unit test with mock PrismaService in server/test/unit/rewards.service.spec.ts
- [ ] T045 [P] [US1] Add test case: calculateBalance returns sum of credit transactions minus debit transactions in server/test/unit/rewards.service.spec.ts
- [ ] T046 [P] [US1] Add test case: calculateBalance returns 0.00 for user with no transactions in server/test/unit/rewards.service.spec.ts
- [ ] T047 [P] [US1] Add test case: getTransactionHistory returns paginated results with cursor in server/test/unit/rewards.service.spec.ts
- [ ] T048 [P] [US1] Add test case: getTransactionHistory returns hasMore=true when more pages exist in server/test/unit/rewards.service.spec.ts
- [ ] T049 [P] [US1] Add test case: getTransactionHistory orders by createdAt DESC, id DESC in server/test/unit/rewards.service.spec.ts

### Implementation for User Story 1

- [ ] T050 [P] [US1] Create RewardTransaction entity in server/src/rewards/entities/reward-transaction.entity.ts
- [ ] T051 [P] [US1] Create RewardsSummaryDto with balance and currency in server/src/rewards/dto/rewards-summary.dto.ts
- [ ] T052 [P] [US1] Create TransactionDto with id, type, amount, description, createdAt in server/src/rewards/dto/transaction.dto.ts
- [ ] T053 [P] [US1] Create PaginatedTransactionsDto with transactions, nextCursor, hasMore, count in server/src/rewards/dto/paginated-transactions.dto.ts
- [ ] T054 [P] [US1] Add Swagger @ApiProperty decorators to all Rewards DTOs in server/src/rewards/dto/
- [ ] T055 [US1] Create RewardsService with calculateBalance method using Prisma aggregate SUM in server/src/rewards/rewards.service.ts
- [ ] T056 [US1] Implement getTransactionHistory with cursor-based pagination (take: limit+1) in server/src/rewards/rewards.service.ts
- [ ] T057 [US1] Add structured logging (INFO) for balance queries in server/src/rewards/rewards.service.ts
- [ ] T058 [US1] Create RewardsController with @ApiTags('Rewards') in server/src/rewards/rewards.controller.ts
- [ ] T059 [US1] Implement GET /rewards/summary endpoint using @CurrentUser decorator in server/src/rewards/rewards.controller.ts
- [ ] T060 [US1] Implement GET /rewards/transactions endpoint with query params (cursor, limit) in server/src/rewards/rewards.controller.ts
- [ ] T061 [US1] Add Swagger @ApiOperation, @ApiResponse decorators to RewardsController endpoints in server/src/rewards/rewards.controller.ts
- [ ] T062 [US1] Create RewardsModule exporting RewardsService and RewardsController in server/src/rewards/rewards.module.ts

### Integration Tests for User Story 1

- [ ] T063 [US1] Create Rewards integration test with test database in server/test/integration/rewards.integration.spec.ts
- [ ] T064 [US1] Add test: GET /rewards/summary returns correct balance for user with multiple transactions in server/test/integration/rewards.integration.spec.ts
- [ ] T065 [US1] Add test: GET /rewards/transactions returns paginated results with nextCursor in server/test/integration/rewards.integration.spec.ts
- [ ] T066 [US1] Add test: Cursor pagination remains consistent when new transactions added in server/test/integration/rewards.integration.spec.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can view balance and transaction history.

---

## Phase 4: User Story 2 - Withdraw Funds to Linked Bank Account (Priority: P2)

**Goal**: Enable users to withdraw accumulated rewards to linked bank accounts with concurrent request protection

**Independent Test**: Seed a user with positive balance and linked bank accounts, initiate withdrawal request via POST /withdrawals, verify withdrawal record created with COMPLETED status, WITHDRAWAL transaction added to ledger, balance decreased accordingly, and subsequent GET /rewards/summary reflects new balance

### Tests for User Story 2 (Unit Tests)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T067 [P] [US2] Create WithdrawalsService unit test with mock PrismaService in server/test/unit/withdrawals.service.spec.ts
- [ ] T068 [P] [US2] Add test case: processWithdrawal creates withdrawal record and debit transaction in server/test/unit/withdrawals.service.spec.ts
- [ ] T069 [P] [US2] Add test case: processWithdrawal throws InsufficientFundsException when balance insufficient in server/test/unit/withdrawals.service.spec.ts
- [ ] T070 [P] [US2] Add test case: processWithdrawal throws MinimumAmountException for amounts below $1.00 in server/test/unit/withdrawals.service.spec.ts
- [ ] T071 [P] [US2] Add test case: processWithdrawal throws BankAccountNotFoundException for invalid bank account in server/test/unit/withdrawals.service.spec.ts

### Implementation for User Story 2

- [ ] T072 [P] [US2] Create Withdrawal entity in server/src/withdrawals/entities/withdrawal.entity.ts
- [ ] T073 [P] [US2] Create CreateWithdrawalDto with amount, bankAccountId, validation decorators in server/src/withdrawals/dto/create-withdrawal.dto.ts
- [ ] T074 [P] [US2] Create WithdrawalResponseDto with id, amount, status, bankAccountId, timestamps, transactionId in server/src/withdrawals/dto/withdrawal-response.dto.ts
- [ ] T075 [P] [US2] Add Swagger @ApiProperty decorators to all Withdrawals DTOs in server/src/withdrawals/dto/
- [ ] T076 [US2] Create WithdrawalsService with processWithdrawal method in server/src/withdrawals/withdrawals.service.ts
- [ ] T077 [US2] Implement balance validation in processWithdrawal (fetch current balance, check >= amount) in server/src/withdrawals/withdrawals.service.ts
- [ ] T078 [US2] Implement minimum amount validation ($1.00) in processWithdrawal in server/src/withdrawals/withdrawals.service.ts
- [ ] T079 [US2] Implement bank account lookup and ownership validation in processWithdrawal in server/src/withdrawals/withdrawals.service.ts
- [ ] T080 [US2] Implement Prisma interactive transaction with SELECT FOR UPDATE row locking in server/src/withdrawals/withdrawals.service.ts
- [ ] T081 [US2] Create withdrawal record with COMPLETED status in transaction in server/src/withdrawals/withdrawals.service.ts
- [ ] T082 [US2] Create WITHDRAWAL transaction in ledger (negative amount) in transaction in server/src/withdrawals/withdrawals.service.ts
- [ ] T083 [US2] Configure transaction with Serializable isolation level and 5-second timeout in server/src/withdrawals/withdrawals.service.ts
- [ ] T084 [US2] Add structured logging (INFO for success, WARN for validation failures, ERROR for system failures) in server/src/withdrawals/withdrawals.service.ts
- [ ] T085 [US2] Create WithdrawalsController with @ApiTags('Withdrawals') in server/src/withdrawals/withdrawals.controller.ts
- [ ] T086 [US2] Implement POST /withdrawals endpoint using @CurrentUser decorator in server/src/withdrawals/withdrawals.controller.ts
- [ ] T087 [US2] Add Swagger @ApiOperation, @ApiResponse decorators with RFC 7807 error examples in server/src/withdrawals/withdrawals.controller.ts
- [ ] T088 [US2] Create WithdrawalsModule exporting WithdrawalsService and WithdrawalsController in server/src/withdrawals/withdrawals.module.ts

### Integration Tests for User Story 2

- [ ] T089 [US2] Create Withdrawals integration test with test database in server/test/integration/withdrawals.integration.spec.ts
- [ ] T090 [US2] Add test: POST /withdrawals creates withdrawal and deducts from balance in server/test/integration/withdrawals.integration.spec.ts
- [ ] T091 [US2] Add test: POST /withdrawals returns 409 with RFC 7807 error for insufficient funds in server/test/integration/withdrawals.integration.spec.ts
- [ ] T092 [US2] Add test: POST /withdrawals returns 409 with RFC 7807 error for amounts below minimum in server/test/integration/withdrawals.integration.spec.ts
- [ ] T093 [US2] Add test: POST /withdrawals returns 404 for invalid bank account in server/test/integration/withdrawals.integration.spec.ts

### End-to-End Tests for User Story 2

- [ ] T094 [US2] Create withdrawal flow e2e test in server/test/e2e/withdrawal-flow.e2e-spec.ts
- [ ] T095 [US2] Add test: Complete withdrawal flow updates balance and transaction history in server/test/e2e/withdrawal-flow.e2e-spec.ts
- [ ] T096 [US2] Add test: Concurrent withdrawal requests are serialized (second blocks until first completes) in server/test/e2e/withdrawal-flow.e2e-spec.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can view balance and withdraw funds.

---

## Phase 5: User Story 3 - View Linked Bank Accounts (Priority: P3)

**Goal**: Enable users to view their linked bank accounts with masked account numbers for withdrawal selection

**Independent Test**: Seed a user with multiple bank accounts, call GET /bank-accounts, verify all accounts returned with masked account numbers (last 4 digits only) and account type identifiers

### Tests for User Story 3 (Unit Tests)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T097 [P] [US3] Create BankAccountsService unit test with mock PrismaService in server/test/unit/bank-accounts.service.spec.ts
- [ ] T098 [P] [US3] Add test case: findAllByUserId returns all active accounts for user in server/test/unit/bank-accounts.service.spec.ts
- [ ] T099 [P] [US3] Add test case: findAllByUserId returns empty array for user with no accounts in server/test/unit/bank-accounts.service.spec.ts
- [ ] T100 [P] [US3] Add test case: maskAccountNumber returns only last 4 digits in server/test/unit/bank-accounts.service.spec.ts

### Implementation for User Story 3

- [ ] T101 [P] [US3] Create BankAccount entity in server/src/bank-accounts/entities/bank-account.entity.ts
- [ ] T102 [P] [US3] Create BankAccountDto with id, lastFourDigits, accountType, isActive, createdAt in server/src/bank-accounts/dto/bank-account.dto.ts
- [ ] T103 [P] [US3] Create BankAccountsResponseDto with accounts array and count in server/src/bank-accounts/dto/bank-accounts-response.dto.ts
- [ ] T104 [P] [US3] Add Swagger @ApiProperty decorators to all BankAccounts DTOs in server/src/bank-accounts/dto/
- [ ] T105 [US3] Create BankAccountsService with findAllByUserId method in server/src/bank-accounts/bank-accounts.service.ts
- [ ] T106 [US3] Implement account number masking utility (show last 4 digits) in server/src/bank-accounts/bank-accounts.service.ts
- [ ] T107 [US3] Add structured logging (INFO) for account queries in server/src/bank-accounts/bank-accounts.service.ts
- [ ] T108 [US3] Create BankAccountsController with @ApiTags('Bank Accounts') in server/src/bank-accounts/bank-accounts.controller.ts
- [ ] T109 [US3] Implement GET /bank-accounts endpoint using @CurrentUser decorator in server/src/bank-accounts/bank-accounts.controller.ts
- [ ] T110 [US3] Add Swagger @ApiOperation, @ApiResponse decorators to BankAccountsController in server/src/bank-accounts/bank-accounts.controller.ts
- [ ] T111 [US3] Create BankAccountsModule exporting BankAccountsService and BankAccountsController in server/src/bank-accounts/bank-accounts.module.ts

### Integration Tests for User Story 3

- [ ] T112 [US3] Create BankAccounts integration test with test database in server/test/integration/bank-accounts.integration.spec.ts
- [ ] T113 [US3] Add test: GET /bank-accounts returns all user accounts with masked numbers in server/test/integration/bank-accounts.integration.spec.ts
- [ ] T114 [US3] Add test: GET /bank-accounts returns empty array for user with no accounts in server/test/integration/bank-accounts.integration.spec.ts
- [ ] T115 [US3] Add test: GET /bank-accounts does not return accounts from other users in server/test/integration/bank-accounts.integration.spec.ts

**Checkpoint**: All three primary user stories should now be independently functional. Users can view balance, withdraw funds, and view bank accounts.

---

## Phase 6: User Story 4 - Manual Balance Top-Up for Testing (Priority: P4)

**Goal**: Enable developers and testers to manually add funds to user balances for testing purposes (dev/test only)

**Independent Test**: Call POST /rewards/income with amount and description, verify INCOME transaction created in ledger, balance increased by specified amount, and transaction appears in history with MANUAL_TEST_TOPUP indicator

### Tests for User Story 4 (Unit Tests)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T116 [P] [US4] Add test case to RewardsService: createIncomeTransaction creates INCOME ledger entry in server/test/unit/rewards.service.spec.ts
- [ ] T117 [P] [US4] Add test case to RewardsService: createIncomeTransaction appends MANUAL_TEST_TOPUP to description in server/test/unit/rewards.service.spec.ts
- [ ] T118 [P] [US4] Add test case to RewardsService: createIncomeTransaction validates minimum amount in server/test/unit/rewards.service.spec.ts

### Implementation for User Story 4

- [ ] T119 [P] [US4] Create CreateIncomeDto with amount, description, validation decorators in server/src/rewards/dto/create-income.dto.ts
- [ ] T120 [P] [US4] Add Swagger @ApiProperty decorators to CreateIncomeDto with dev/test warning in server/src/rewards/dto/create-income.dto.ts
- [ ] T121 [US4] Implement createIncomeTransaction method in RewardsService in server/src/rewards/rewards.service.ts
- [ ] T122 [US4] Create INCOME transaction with appended [MANUAL_TEST_TOPUP] indicator in server/src/rewards/rewards.service.ts
- [ ] T123 [US4] Add structured logging (INFO) for income transactions in server/src/rewards/rewards.service.ts
- [ ] T124 [US4] Implement POST /rewards/income endpoint in RewardsController in server/src/rewards/rewards.controller.ts
- [ ] T125 [US4] Add environment check guard (403 if production) to POST /rewards/income endpoint in server/src/rewards/rewards.controller.ts
- [ ] T126 [US4] Add Swagger @ApiOperation with WARNING documentation to POST /rewards/income in server/src/rewards/rewards.controller.ts
- [ ] T127 [US4] Add Swagger @ApiResponse with 403 error for production environment in server/src/rewards/rewards.controller.ts

### Integration Tests for User Story 4

- [ ] T128 [US4] Create income endpoint integration test in server/test/integration/rewards.integration.spec.ts
- [ ] T129 [US4] Add test: POST /rewards/income creates INCOME transaction and increases balance in server/test/integration/rewards.integration.spec.ts
- [ ] T130 [US4] Add test: POST /rewards/income returns 403 when NODE_ENV=production in server/test/integration/rewards.integration.spec.ts

**Checkpoint**: All four user stories complete. System ready for testing, demonstration, and deployment.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Documentation

- [ ] T131 [P] Create README.md with quickstart instructions in server/README.md
- [ ] T132 [P] Document environment variables in server/.env.example
- [ ] T133 [P] Add API usage examples to Swagger descriptions in server/src/

### Testing & Quality

- [ ] T134 Create balance calculation accuracy e2e test in server/test/e2e/balance-calculation.e2e-spec.ts
- [ ] T135 Add test: Balance calculation accurate with mixed transaction types (credits and debits) in server/test/e2e/balance-calculation.e2e-spec.ts
- [ ] T136 Add test: Balance calculation handles currency precision correctly (2 decimal places) in server/test/e2e/balance-calculation.e2e-spec.ts
- [ ] T137 Run test coverage report and verify 85%+ coverage for services with npm run test:cov
- [ ] T138 [P] Add unit tests for IdentityGuard with environment scenarios in server/test/unit/identity.guard.spec.ts
- [ ] T139 [P] Add unit tests for HttpExceptionFilter with RFC 7807 validation in server/test/unit/http-exception.filter.spec.ts

### Performance & Optimization

- [ ] T140 [P] Review and optimize database indexes for query performance in server/prisma/schema.prisma
- [ ] T141 [P] Add performance logging for slow queries (> 1 second) in server/src/prisma/prisma.service.ts
- [ ] T142 [P] Validate withdrawal request completes under 2 seconds performance goal

### Security Hardening

- [ ] T143 Validate IdentityGuard rejects requests in production without x-user-id header in server/src/common/guards/identity.guard.ts
- [ ] T144 Validate POST /rewards/income endpoint blocked in production environment in server/src/rewards/rewards.controller.ts
- [ ] T145 [P] Add input sanitization for description fields to prevent XSS in server/src/rewards/dto/
- [ ] T146 [P] Review and validate all user-scoped queries prevent cross-user data access in server/src/

### Deployment Preparation

- [ ] T147 [P] Create Docker configuration for PostgreSQL in server/docker-compose.yml
- [ ] T148 [P] Create Dockerfile for NestJS application in server/Dockerfile
- [ ] T149 Run quickstart.md validation (follow all setup steps from clean state)
- [ ] T150 Validate Swagger documentation completeness at /api/docs endpoint

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion (can run parallel to US1)
- **User Story 3 (Phase 5)**: Depends on Foundational phase completion (can run parallel to US1/US2)
- **User Story 4 (Phase 6)**: Depends on Foundational phase completion and US1 (extends RewardsService)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ Independent
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 (reads balance, creates transactions) but independently testable ✅ Independent with integration points
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Used by US2 but independently testable ✅ Independent
- **User Story 4 (P4)**: Depends on US1 (extends RewardsService and RewardsController) ⚠️ Extends US1

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- DTOs and entities can be created in parallel [P]
- Services depend on entities
- Controllers depend on services
- Integration tests depend on complete story implementation
- E2E tests depend on multiple story integration

### Parallel Opportunities

**Phase 1 (Setup)**: Tasks T002-T009 marked [P] can run in parallel

**Phase 2 (Foundational)**: Within each subsection, [P] tasks can run in parallel:
- T024 (decorator) parallel with T021-T023 (guard)
- T027-T028 (exceptions) parallel with T026
- T031-T034 (logging/interceptors) parallel with other infrastructure

**Phase 3 (US1)**: All test tasks (T044-T049) can run in parallel, all DTO tasks (T051-T054) can run in parallel

**Phase 4 (US2)**: All test tasks (T067-T071) can run in parallel, all DTO tasks (T073-T075) can run in parallel

**Phase 5 (US3)**: All test tasks (T097-T100) can run in parallel, all DTO tasks (T102-T104) can run in parallel

**Phase 6 (US4)**: Test tasks (T116-T118) can run in parallel, DTO tasks (T119-T120) can run in parallel

**Phase 7 (Polish)**: Tasks T131-T133 (docs), T138-T139 (tests), T140-T142 (perf), T145-T146 (security), T147-T148 (docker) can all run in parallel

**Cross-Story Parallelism**: After Foundational phase completes:
- US1, US2, US3 can start in parallel (different modules)
- US4 must wait for US1 to complete (extends same module)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Create RewardsService unit test with mock PrismaService in server/test/unit/rewards.service.spec.ts"
Task: "Add test case: calculateBalance returns sum of credit transactions minus debit transactions in server/test/unit/rewards.service.spec.ts"
Task: "Add test case: calculateBalance returns 0.00 for user with no transactions in server/test/unit/rewards.service.spec.ts"
Task: "Add test case: getTransactionHistory returns paginated results with cursor in server/test/unit/rewards.service.spec.ts"
Task: "Add test case: getTransactionHistory returns hasMore=true when more pages exist in server/test/unit/rewards.service.spec.ts"
Task: "Add test case: getTransactionHistory orders by createdAt DESC, id DESC in server/test/unit/rewards.service.spec.ts"

# Launch all DTOs for User Story 1 together:
Task: "Create RewardsSummaryDto with balance and currency in server/src/rewards/dto/rewards-summary.dto.ts"
Task: "Create TransactionDto with id, type, amount, description, createdAt in server/src/rewards/dto/transaction.dto.ts"
Task: "Create PaginatedTransactionsDto with transactions, nextCursor, hasMore, count in server/src/rewards/dto/paginated-transactions.dto.ts"
```

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task: "Create WithdrawalsService unit test with mock PrismaService in server/test/unit/withdrawals.service.spec.ts"
Task: "Add test case: processWithdrawal creates withdrawal record and debit transaction in server/test/unit/withdrawals.service.spec.ts"
Task: "Add test case: processWithdrawal throws InsufficientFundsException when balance insufficient in server/test/unit/withdrawals.service.spec.ts"
Task: "Add test case: processWithdrawal throws MinimumAmountException for amounts below $1.00 in server/test/unit/withdrawals.service.spec.ts"
Task: "Add test case: processWithdrawal throws BankAccountNotFoundException for invalid bank account in server/test/unit/withdrawals.service.spec.ts"

# Launch all DTOs for User Story 2 together:
Task: "Create CreateWithdrawalDto with amount, bankAccountId, validation decorators in server/src/withdrawals/dto/create-withdrawal.dto.ts"
Task: "Create WithdrawalResponseDto with id, amount, status, bankAccountId, timestamps, transactionId in server/src/withdrawals/dto/withdrawal-response.dto.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T043) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T044-T066)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Seed database with test data
   - Verify GET /rewards/summary returns correct balance
   - Verify GET /rewards/transactions returns paginated history
   - Verify cursor-based pagination works correctly
5. Deploy/demo if ready (MVP with read-only balance view)

### Incremental Delivery

1. Complete Setup + Foundational (Phases 1-2) → Foundation ready
2. Add User Story 1 (Phase 3) → Test independently → Deploy/Demo (MVP - read-only!)
3. Add User Story 2 (Phase 4) → Test independently → Deploy/Demo (core value: withdrawals work!)
4. Add User Story 3 (Phase 5) → Test independently → Deploy/Demo (complete UX: users can see bank accounts)
5. Add User Story 4 (Phase 6) → Test independently → Deploy/Demo (testing utility)
6. Polish (Phase 7) → Production-ready system
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (Phases 1-2)
2. Once Foundational is done:
   - Developer A: User Story 1 (Phase 3)
   - Developer B: User Story 2 (Phase 4)
   - Developer C: User Story 3 (Phase 5)
3. User Story 4 (Phase 6) waits for Developer A to complete US1 (extends same module)
4. Stories complete and integrate independently
5. Team collaborates on Phase 7 (Polish)

### Recommended Order for Solo Developer

1. Phases 1-2 (Setup + Foundational)
2. Phase 3 (US1 - View Balance) - Get core read functionality working first
3. Phase 4 (US2 - Withdrawals) - Add critical write functionality
4. Phase 5 (US3 - Bank Accounts) - Complete UX flow
5. Phase 6 (US4 - Manual Top-Up) - Add testing utility
6. Phase 7 (Polish) - Production hardening

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Independent stories**: Each user story should be independently completable and testable
- **TDD approach**: Verify tests fail before implementing (especially critical for Unit Tests)
- **Commit strategy**: Commit after each task or logical group
- **Checkpoint validation**: Stop at any checkpoint to validate story independently before moving forward
- **85%+ coverage target**: Focus on service layer unit tests (core business logic)
- **RFC 7807**: All error responses must follow Problem Details format
- **Hexagonal architecture**: Maintain clear separation between domain, application, and infrastructure layers
- **Row locking**: Critical for US2 withdrawal concurrency - test with concurrent requests
- **Cursor pagination**: Critical for US1 transaction history - test with large datasets

### Avoid

- Vague tasks without file paths
- Working on same file in parallel (conflicts)
- Cross-story dependencies that break independence
- Skipping tests (constitution requires 85%+ coverage)
- Storing balance field (MUST compute from ledger)
- Using offset-based pagination (MUST use cursor-based)
