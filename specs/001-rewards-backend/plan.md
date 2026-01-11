# Implementation Plan: Rewards Application Backend API

**Branch**: `001-rewards-backend` | **Date**: 2026-01-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-rewards-backend/spec.md`

## Summary

Build a RESTful backend API for a Rewards application that manages user rewards balances, transaction history, and fund withdrawals. The system uses a ledger-based architecture where balance is computed in real-time from transaction records (no stored balance field). Core functionality includes viewing rewards summary with paginated transaction history, withdrawing funds to linked bank accounts with concurrent request protection, and managing bank account information with security (masked account numbers). The API implements development-friendly identity headers (x-user-id) with environment-based behavior, structured logging with RFC 7807 error responses, and cursor-based pagination for transaction history.

**Technical Approach**: NestJS hexagonal architecture with Prisma ORM and PostgreSQL, implementing database row locking for withdrawal concurrency, cursor-based pagination for transactions, and RFC 7807 Problem Details for standardized error responses.

## Technical Context

**Language/Version**: TypeScript 5.7.3 with Node.js (LTS version 20.x or later recommended)
**Primary Dependencies**:
- NestJS 11.0.1 (framework)
- Prisma (ORM for type-safe database access)
- PostgreSQL (database)
- class-validator & class-transformer (DTO validation)
- @nestjs/swagger (API documentation)
- Jest 29.7.0 (testing framework)

**Storage**: PostgreSQL database with Prisma ORM for schema management and queries
**Testing**: Jest with @nestjs/testing providers, supertest for integration tests, dedicated test database for realistic Prisma behavior
**Target Platform**: Node.js server (Linux/macOS/Windows compatible), containerizable for Docker deployment
**Project Type**: Single backend API project (no frontend in this feature)
**Performance Goals**:
- Withdrawal requests complete under 2 seconds
- Support 100+ concurrent users without degradation
- Transaction history queries optimized with cursor-based pagination (50 items per page)

**Constraints**:
- Balance MUST be computed from ledger (no stored balance field)
- Development identity mechanism (x-user-id header) must be explicitly secured/disabled in production
- Database row locking required for concurrent withdrawal protection
- RFC 7807 Problem Details for all error responses
- 85%+ unit test coverage for all services

**Scale/Scope**:
- MVP scope: single-user identity simulation, immediate withdrawals (no external payment processor)
- Transaction history unbounded but paginated (cursor-based, 50 per page)
- 4 core entities: User, BankAccount, RewardTransaction, Withdrawal

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Hexagonal Architecture (Ports and Adapters)

**Requirement**: Backend MUST follow hexagonal architecture with clear separation between domain, application, and infrastructure concerns.

**Plan Compliance**:
- Domain layer: Core business logic in services (balance calculation, withdrawal validation)
- Application layer: NestJS controllers handling HTTP concerns only
- Infrastructure layer: Prisma repository pattern for database access, Guards for identity, Exception Filters for errors
- Ports: Service interfaces define contracts between layers
- Adapters: Prisma implementations, NestJS HTTP layer, RFC 7807 error formatters

**Status**: ✅ PASS - Architecture designed with clear layer separation

### ✅ API Documentation with Swagger

**Requirement**: MUST document API using Swagger on all controllers (endpoints, DTOs, responses, error cases).

**Plan Compliance**:
- All controllers decorated with `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()`
- DTOs documented with `@ApiProperty()` decorators
- Error responses documented with RFC 7807 schema examples
- Swagger UI available at `/api/docs` endpoint

**Status**: ✅ PASS - Swagger documentation planned for all endpoints

### ✅ Validation and Error Handling

**Requirement**: DTOs mandatory for all inputs/outputs with class-validator decorators. Use Exception Filters for consistent errors.

**Plan Compliance**:
- All endpoint inputs/outputs use DTOs with class-validator decorators
- Global Exception Filter implements RFC 7807 Problem Details format
- Custom exceptions for domain errors (InsufficientFundsException, MinimumAmountException)
- Structured logging in all services with user_id, amount, transaction_id fields

**Status**: ✅ PASS - Comprehensive validation and error handling strategy

### ✅ Database and ORM

**Requirement**: MUST use Prisma ORM with PostgreSQL database.

**Plan Compliance**:
- Prisma schema defines User, BankAccount, RewardTransaction, Withdrawal models
- Prisma Client provides type-safe queries
- Migrations managed via `prisma migrate dev`
- Row-level locking for concurrent withdrawals via Prisma transaction API

**Status**: ✅ PASS - Prisma + PostgreSQL as specified

### ✅ Testing Requirements

**Requirement**: Unit tests for services with 85%+ coverage, integration tests for controllers, e2e tests for flows.

**Plan Compliance**:
- Unit tests: All services with mocked dependencies (Prisma, etc.)
- Integration tests: Critical controllers with test database
- E2e tests: Complete withdrawal flow, balance calculation accuracy
- Test database: Separate PostgreSQL instance for realistic Prisma behavior
- Coverage target: 85%+ for service layer

**Status**: ✅ PASS - Comprehensive testing strategy aligned with requirements

### ✅ NestJS Patterns

**Requirement**: Use Guards for auth, Interceptors for transformation, Exception Filters for errors. DTOs with validation. Named exports only. Constructor-based DI.

**Plan Compliance**:
- Identity Guard: Reads x-user-id header, populates req.user, environment-aware fallback
- Transform Interceptor: Applies RFC 7807 formatting to error responses
- Exception Filter: Catches all exceptions, formats as Problem Details
- All DTOs use class-validator decorators
- Named exports enforced via ESLint rule
- Constructor-based dependency injection for all services

**Status**: ✅ PASS - All NestJS patterns correctly applied

### ✅ SOLID Principles

**Requirement**: Single Responsibility (one service = one responsibility), no default exports, constructor DI, avoid N+1 queries.

**Plan Compliance**:
- RewardsService: Balance calculation and transaction queries only
- WithdrawalsService: Withdrawal processing and validation only
- BankAccountsService: Bank account queries only
- TransactionsService: Transaction creation and pagination only
- N+1 prevention: Prisma `include` for related data, cursor-based pagination
- Repository pattern isolates database concerns from business logic

**Status**: ✅ PASS - Services follow single responsibility, no N+1 queries

## Project Structure

### Documentation (this feature)

```text
specs/001-rewards-backend/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── rewards.yaml     # OpenAPI spec for rewards endpoints
│   ├── withdrawals.yaml # OpenAPI spec for withdrawals endpoints
│   └── bank-accounts.yaml # OpenAPI spec for bank accounts endpoints
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
server/
├── src/
│   ├── main.ts                      # Bootstrap NestJS app, Swagger setup
│   ├── app.module.ts                # Root module
│   │
│   ├── common/                      # Shared infrastructure
│   │   ├── guards/
│   │   │   └── identity.guard.ts    # x-user-id header guard
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts  # Response transformation
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts  # RFC 7807 formatter
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts # Extract user from request
│   │   └── exceptions/
│   │       ├── insufficient-funds.exception.ts
│   │       ├── minimum-amount.exception.ts
│   │       └── problem-details.ts   # RFC 7807 response builder
│   │
│   ├── users/                       # User module (minimal for MVP)
│   │   ├── users.module.ts
│   │   ├── users.service.ts         # User lookup for identity guard
│   │   └── entities/
│   │       └── user.entity.ts       # User Prisma model wrapper
│   │
│   ├── rewards/                     # Rewards balance and transactions
│   │   ├── rewards.module.ts
│   │   ├── rewards.controller.ts    # GET /rewards/summary, GET /rewards/transactions
│   │   ├── rewards.service.ts       # Balance calculation, transaction queries
│   │   ├── dto/
│   │   │   ├── rewards-summary.dto.ts
│   │   │   ├── transaction.dto.ts
│   │   │   ├── paginated-transactions.dto.ts
│   │   │   └── create-income.dto.ts  # Manual top-up (dev/test only)
│   │   └── entities/
│   │       └── reward-transaction.entity.ts
│   │
│   ├── withdrawals/                 # Withdrawal processing
│   │   ├── withdrawals.module.ts
│   │   ├── withdrawals.controller.ts # POST /withdrawals
│   │   ├── withdrawals.service.ts   # Withdrawal validation and processing
│   │   ├── dto/
│   │   │   ├── create-withdrawal.dto.ts
│   │   │   └── withdrawal-response.dto.ts
│   │   └── entities/
│   │       └── withdrawal.entity.ts
│   │
│   ├── bank-accounts/               # Bank account management
│   │   ├── bank-accounts.module.ts
│   │   ├── bank-accounts.controller.ts # GET /bank-accounts
│   │   ├── bank-accounts.service.ts    # Account queries with masking
│   │   ├── dto/
│   │   │   └── bank-account.dto.ts
│   │   └── entities/
│   │       └── bank-account.entity.ts
│   │
│   └── prisma/                      # Prisma integration
│       ├── prisma.module.ts
│       ├── prisma.service.ts        # PrismaClient wrapper
│       ├── schema.prisma            # Database schema
│       └── migrations/              # Prisma migrations
│
├── test/
│   ├── unit/                        # Unit tests (services with mocks)
│   │   ├── rewards.service.spec.ts
│   │   ├── withdrawals.service.spec.ts
│   │   └── bank-accounts.service.spec.ts
│   ├── integration/                 # Integration tests (controllers + test DB)
│   │   ├── rewards.integration.spec.ts
│   │   ├── withdrawals.integration.spec.ts
│   │   └── bank-accounts.integration.spec.ts
│   └── e2e/                         # End-to-end tests (complete flows)
│       ├── withdrawal-flow.e2e-spec.ts
│       └── balance-calculation.e2e-spec.ts
│
├── prisma/
│   ├── schema.prisma                # Prisma schema (source of truth)
│   ├── migrations/                  # Migration history
│   └── seed.ts                      # Database seeding for dev/test
│
├── package.json
├── tsconfig.json
├── nest-cli.json
├── .env.example                     # Environment variables template
└── README.md                        # Setup and run instructions
```

**Structure Decision**: Single backend project structure using NestJS modular architecture. Each domain area (rewards, withdrawals, bank-accounts) is isolated in its own module with clear boundaries. Common infrastructure (guards, filters, interceptors) is shared across modules. Prisma is centralized in a dedicated module for dependency injection. Test structure mirrors source structure with unit/integration/e2e separation.

## Complexity Tracking

No constitution violations detected. All requirements align with mandatory stack and patterns.

