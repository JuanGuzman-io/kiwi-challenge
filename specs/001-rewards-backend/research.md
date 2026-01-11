# Research: Rewards Application Backend API

**Phase**: 0 - Outline & Research
**Date**: 2026-01-10
**Purpose**: Resolve technical unknowns and establish architectural patterns for the Rewards backend API

## Key Decisions

### 1. Hexagonal Architecture Structure

**Decision**: Three-layer structure with domain, application, and infrastructure separation

**Rationale**:
- Domain layer: Pure TypeScript with zero external dependencies ensures business logic portability
- Application layer: Defines ports (interfaces) as contracts between layers
- Infrastructure layer: Implements ports using concrete technologies (Prisma, NestJS)
- Enables testing business logic in isolation without database/framework dependencies

**Structure**:
```
src/
├── domain/              # Business logic (no dependencies)
│   ├── models/          # Pure TypeScript domain entities
│   ├── services/        # Domain services (balance calculation, validation)
│   └── exceptions/      # Domain-specific exceptions
├── application/         # Use cases and orchestration
│   ├── ports/
│   │   ├── inbound/     # API contracts (service interfaces)
│   │   └── outbound/    # Repository interfaces
│   └── services/        # Application services (orchestrate domain logic)
└── infrastructure/      # External adapters
    ├── adapters/
    │   ├── inbound/     # HTTP controllers, guards, DTOs
    │   └── outbound/    # Prisma repositories, logging
    └── config/          # Configuration
```

**Alternatives Considered**:
- Flat NestJS module structure: Rejected due to lack of clear boundaries and difficulty testing business logic independently
- Clean Architecture (4 layers): Rejected as too complex for MVP; hexagonal provides sufficient separation

**References**: Research from dev.to hexagonal architecture guides, NestJS hexagonal examples, Clean Architecture patterns

---

### 2. Repository Pattern with Prisma

**Decision**: Interface-based repository pattern with Symbol-based injection tokens

**Rationale**:
- Decouples business logic from Prisma implementation
- Enables easy unit testing with mock repositories
- Type-safe dependency injection via Symbol tokens
- Mappers transform Prisma models to domain models, maintaining clean separation

**Pattern**:
```typescript
// Port (interface)
export interface RewardTransactionRepositoryPort {
  create(data: CreateTransactionData): Promise<RewardTransaction>;
  findByUserId(userId: string, cursor?: string): Promise<PaginatedResult>;
  calculateBalance(userId: string): Promise<number>;
}
export const REWARD_TRANSACTION_REPOSITORY = Symbol('REWARD_TRANSACTION_REPOSITORY');

// Prisma implementation
@Injectable()
export class PrismaRewardTransactionRepository implements RewardTransactionRepositoryPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: TransactionMapper,
  ) {}
  // Implementation using Prisma Client
}

// Service injection
@Injectable()
export class RewardsService {
  constructor(
    @Inject(REWARD_TRANSACTION_REPOSITORY)
    private readonly transactionRepo: RewardTransactionRepositoryPort,
  ) {}
}
```

**Alternatives Considered**:
- Direct Prisma usage in services: Rejected due to tight coupling and difficulty testing
- Generic repository with PrismaClient: Rejected as too abstract; domain-specific repositories provide better type safety

**References**: Prisma discussions on repository pattern, NestJS + Prisma tutorials, Tom Ray's NestJS Prisma guide

---

### 3. Concurrent Withdrawal Protection

**Decision**: Prisma interactive transactions with SELECT FOR UPDATE row locking

**Rationale**:
- Prevents race conditions when multiple withdrawals attempted simultaneously
- Serializable isolation level ensures consistent balance calculations
- SELECT FOR UPDATE locks user's transaction rows, blocking concurrent modifications
- Timeout of 5 seconds prevents indefinite blocking
- Simpler than optimistic locking for withdrawal scenario (immediate feedback preferred)

**Implementation**:
```typescript
await this.prisma.$transaction(
  async (tx) => {
    // Lock user rows
    await tx.$queryRaw`SELECT * FROM "User" WHERE id = ${userId} FOR UPDATE`;

    // Calculate balance within transaction
    const balance = await tx.rewardTransaction.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    if (balance._sum.amount < amount) {
      throw new InsufficientFundsException();
    }

    // Create withdrawal and debit transaction atomically
    // ...
  },
  {
    isolationLevel: 'Serializable',
    timeout: 5000,
  }
);
```

**Alternatives Considered**:
- Optimistic locking with version field: Rejected as second request would fail immediately, requiring frontend retry logic
- Application-level locking (Redis): Rejected as adds dependency and complexity for MVP
- nestjs-cls transactional: Considered but manual transaction control provides clearer semantics for critical withdrawal path

**References**: Prisma transaction documentation, PostgreSQL transaction isolation levels, concurrency control patterns in banking systems

---

### 4. Cursor-Based Pagination

**Decision**: Cursor-based pagination with `take: limit + 1` pattern

**Rationale**:
- Prevents data inconsistencies when new transactions added during pagination
- More performant than offset-based for large datasets (no full table scan)
- Stable cursors based on transaction ID ensure reliable pagination
- Extra item (`limit + 1`) efficiently determines if next page exists

**Pattern**:
```typescript
const transactions = await this.prisma.rewardTransaction.findMany({
  where: { userId },
  take: limit + 1,        // Fetch one extra item
  ...(cursor && {
    cursor: { id: cursor },
    skip: 1,              // Skip the cursor itself
  }),
  orderBy: [
    { createdAt: 'desc' },
    { id: 'desc' },        // Secondary sort for stability
  ],
});

const hasMore = transactions.length > limit;
const items = hasMore ? transactions.slice(0, -1) : transactions;
const nextCursor = hasMore ? items[items.length - 1].id : undefined;
```

**Alternatives Considered**:
- Offset-based pagination: Rejected due to inconsistent results when data changes and poor performance on large datasets
- Time-window based: Rejected as doesn't provide complete history access for users

**References**: Prisma pagination documentation, cursor-based pagination best practices, infinite scrolling patterns

---

### 5. RFC 7807 Problem Details

**Decision**: Global Exception Filter implementing RFC 7807 with custom domain exceptions

**Rationale**:
- Industry standard for HTTP API error responses (RFC 7807)
- Machine-readable format enables consistent frontend error handling
- Structured format: `type`, `title`, `status`, `detail`, `instance` + extension fields
- Custom domain exceptions (InsufficientFundsException) map to specific problem types
- Content-Type: application/problem+json signals standardized format

**Structure**:
```typescript
// Problem type definition
export const ProblemTypes = {
  INSUFFICIENT_FUNDS: {
    type: 'https://api.rewards.com/problems/insufficient-funds',
    title: 'Insufficient Funds',
    status: 400,
  },
};

// Global filter catches all exceptions
@Catch()
export class Rfc7807ExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const problemDetails = {
      type: ProblemTypes.INSUFFICIENT_FUNDS.type,
      title: ProblemTypes.INSUFFICIENT_FUNDS.title,
      status: ProblemTypes.INSUFFICIENT_FUNDS.status,
      detail: exception.message,
      instance: request.url,
      // Extension fields
      currentBalance: exception.currentBalance,
      requestedAmount: exception.requestedAmount,
    };

    response
      .status(problemDetails.status)
      .header('Content-Type', 'application/problem+json')
      .json(problemDetails);
  }
}
```

**Alternatives Considered**:
- Simple JSON errors: Rejected due to lack of standardization and extensibility
- Custom detailed format: Rejected as reinvents existing standard

**References**: RFC 7807 specification, RFC 9457 updates, nest-problem-details libraries, API error handling best practices

---

### 6. Structured Logging

**Decision**: nestjs-pino with structured JSON logging and standardized fields

**Rationale**:
- Pino is 5-10x faster than Winston with lower memory footprint
- Built-in structured logging (JSON format)
- Automatic request context (request ID, user ID)
- Better for high-concurrency environments (100+ concurrent users requirement)
- Log aggregation-friendly with consistent field naming

**Configuration**:
```typescript
PinoLoggerModule.forRoot({
  pinoHttp: {
    level: process.env.LOG_LEVEL || 'info',
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        userId: req.user?.id,
      }),
    },
    customProps: (req) => ({
      userId: req.user?.id,
      requestId: req.id,
    }),
    redact: {
      paths: ['*.password', '*.bankAccountNumber'],
      remove: true,
    },
  },
});
```

**Log Level Strategy**:
- INFO: Successful operations (withdrawals, balance queries)
- WARN: Validation failures (insufficient funds, invalid amounts)
- ERROR: System failures (database errors, unexpected exceptions)

**Standardized Fields**:
- `userId`, `requestId`: Identity and correlation
- `operation`: Operation type (withdrawal_initiated, balance_check)
- `amount`, `transactionId`, `withdrawalId`: Business data
- `error`, `errorType`: Error tracking

**Alternatives Considered**:
- Winston: Rejected due to lower performance and higher memory usage
- console.log: Rejected as lacks structure and log levels

**References**: nestjs-pino documentation, Pino vs Winston comparisons, structured logging best practices, NestJS logging guides

---

## Implementation Priorities

### Phase 1: Foundation
1. Prisma schema definition (User, BankAccount, RewardTransaction, Withdrawal)
2. Prisma service and module setup
3. Repository interfaces and Prisma implementations
4. Domain models and mappers

### Phase 2: Core Infrastructure
1. Identity guard (x-user-id header)
2. RFC 7807 exception filter
3. Custom domain exceptions
4. Structured logging configuration

### Phase 3: Business Logic
1. Rewards service (balance calculation, transaction history)
2. Withdrawals service (validation, concurrent protection)
3. Bank accounts service (queries with masking)

### Phase 4: API Layer
1. Controllers with Swagger decorators
2. DTOs with class-validator
3. API documentation setup

### Phase 5: Testing
1. Unit tests (services with mock repositories)
2. Integration tests (controllers with test database)
3. E2e tests (complete flows)

---

## Open Questions Resolved

### Q1: How to handle concurrent withdrawals?
**A**: Use Prisma interactive transactions with SELECT FOR UPDATE row locking and Serializable isolation level (clarified in spec session)

### Q2: What pagination strategy for transaction history?
**A**: Cursor-based pagination with 50 items per page default (clarified in spec session)

### Q3: What structured logging format?
**A**: Pino with log levels (INFO/WARN/ERROR) and structured fields (user_id, amount, transaction_id) (clarified in spec session)

### Q4: What minimum withdrawal amount?
**A**: $1.00 minimum to prevent micro-transaction overhead (clarified in spec session)

### Q5: What error response format?
**A**: RFC 7807 Problem Details with Content-Type: application/problem+json (clarified in spec session)

---

## Risk Mitigation

### Risk 1: Database Performance with Ledger Calculation
**Mitigation**: Use Prisma aggregation for balance calculation (optimized SQL), add database indexes on userId + createdAt for transaction queries

### Risk 2: Concurrent Withdrawal Deadlocks
**Mitigation**: 5-second transaction timeout, serialize per user (not globally), structured logging for deadlock detection

### Risk 3: Unbounded Transaction History Growth
**Mitigation**: Cursor-based pagination prevents loading all records, consider archiving strategy in future (out of scope for MVP)

### Risk 4: Identity Header Security in Production
**Mitigation**: Environment-based guard behavior (reject 401 in production, fallback in dev/test), explicit warning in Swagger docs

---

## Technology Decisions Summary

| Area | Technology | Version | Rationale |
|------|-----------|---------|-----------|
| Framework | NestJS | 11.0.1 | Mandatory per constitution, hexagonal architecture support |
| ORM | Prisma | Latest | Mandatory per constitution, type-safe queries, migrations |
| Database | PostgreSQL | 14+ | Mandatory per constitution, row locking, ACID transactions |
| Logging | Pino (nestjs-pino) | Latest | 5-10x faster than Winston, structured JSON, low memory |
| Validation | class-validator | Latest | Standard NestJS validation, decorator-based |
| Testing | Jest | 29.7.0 | NestJS default, supports unit/integration/e2e |
| API Docs | @nestjs/swagger | Latest | Mandatory per constitution, OpenAPI 3.0 support |

---

## Next Steps

Proceed to Phase 1 design artifacts:
1. **data-model.md**: Prisma schema with all entities, relationships, indexes
2. **contracts/**: OpenAPI specifications for all endpoints
3. **quickstart.md**: Setup and run instructions for developers
