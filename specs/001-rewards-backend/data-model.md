# Data Model: Rewards Application Backend API

**Phase**: 1 - Design & Contracts
**Date**: 2026-01-10
**Purpose**: Define database schema, entities, relationships, and validation rules

## Overview

The Rewards application uses a ledger-based architecture where **balance is computed in real-time** from transaction records. No balance field is stored on the User entity; instead, the `RewardTransaction` table serves as the single source of truth for all balance changes.

**Core Principle**: Every balance change creates a `RewardTransaction` entry. Balance = SUM(credits) - SUM(debits) for a user.

## Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
│─────────────────│
│ id (PK)         │
│ email           │
│ name            │
│ createdAt       │
│ updatedAt       │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────┴──────────────────────────────┐
    │                                   │
    │                                   │
┌───┴──────────────────┐    ┌──────────┴──────────────┐
│  Bank Account        │    │  RewardTransaction      │
│──────────────────────│    │─────────────────────────│
│ id (PK)              │    │ id (PK)                 │
│ userId (FK)          │    │ userId (FK)             │
│ accountNumber        │    │ type (ENUM)             │
│ accountType          │    │ amount (Decimal)        │
│ lastFourDigits       │    │ description             │
│ isActive             │    │ withdrawalId (FK, opt)  │
│ createdAt            │    │ createdAt               │
│ updatedAt            │    │ updatedAt               │
└──────────┬───────────┘    └─────────┬───────────────┘
           │                          │
           │ 1:N                      │ N:1
           │                          │
        ┌──┴───────────────────────┐  │
        │     Withdrawal           │◄─┘
        │──────────────────────────│
        │ id (PK)                  │
        │ userId (FK)              │
        │ amount (Decimal)         │
        │ bankAccountId (FK)       │
        │ status (ENUM)            │
        │ createdAt                │
        │ completedAt (nullable)   │
        │ updatedAt                │
        └──────────────────────────┘
```

## Entities

### 1. User

**Purpose**: Represents a rewards program member. Does NOT store balance (computed from ledger).

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String (UUID) | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique user identifier |
| email | String | UNIQUE, NOT NULL | User email for identity (future auth) |
| name | String | NOT NULL | User display name |
| createdAt | DateTime | NOT NULL, DEFAULT now() | Account creation timestamp |
| updatedAt | DateTime | NOT NULL, auto-update | Last modification timestamp |

**Relationships**:
- Has many `BankAccount` (1:N)
- Has many `RewardTransaction` (1:N)
- Has many `Withdrawal` (1:N)

**Indexes**:
- `id` (Primary Key, automatic)
- `email` (Unique index for fast lookup)

**Validation Rules**:
- Email must be valid format (class-validator @IsEmail)
- Name must be 1-100 characters

**Prisma Model**:
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  bankAccounts BankAccount[]
  transactions RewardTransaction[]
  withdrawals  Withdrawal[]

  @@map("users")
}
```

---

### 2. BankAccount

**Purpose**: Represents a linked bank account for withdrawals. Account numbers are stored but masked for display.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String (UUID) | PRIMARY KEY | Unique account identifier |
| userId | String (UUID) | FOREIGN KEY → User.id, NOT NULL, INDEX | Owner of this bank account |
| accountNumber | String | NOT NULL | Full account number (encrypted in production) |
| lastFourDigits | String | NOT NULL | Last 4 digits for display (e.g., "1234") |
| accountType | String | NOT NULL | Account type (e.g., "Checking", "Savings") |
| isActive | Boolean | NOT NULL, DEFAULT true | Whether account is active for withdrawals |
| createdAt | DateTime | NOT NULL, DEFAULT now() | Account link timestamp |
| updatedAt | DateTime | NOT NULL, auto-update | Last modification timestamp |

**Relationships**:
- Belongs to one `User` (N:1)
- Has many `Withdrawal` (1:N)

**Indexes**:
- `id` (Primary Key)
- `userId` (Index for filtering by user)
- Compound: `(userId, isActive)` (Optimize active accounts query)

**Validation Rules**:
- accountNumber must be 8-17 digits (class-validator @Matches)
- lastFourDigits must be exactly 4 digits
- accountType must be one of predefined types (Checking, Savings)

**Security**:
- Full account number should be encrypted at rest (application-level encryption in production)
- Only lastFourDigits returned in API responses

**Prisma Model**:
```prisma
model BankAccount {
  id              String   @id @default(uuid())
  userId          String
  accountNumber   String   // TODO: Encrypt in production
  lastFourDigits  String   @db.VarChar(4)
  accountType     String   @db.VarChar(50)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  withdrawals Withdrawal[]

  @@index([userId])
  @@index([userId, isActive])
  @@map("bank_accounts")
}
```

---

### 3. RewardTransaction (Ledger)

**Purpose**: The ledger and single source of truth for balance and history. Every balance change creates a transaction entry.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String (UUID) | PRIMARY KEY | Unique transaction identifier |
| userId | String (UUID) | FOREIGN KEY → User.id, NOT NULL, INDEX | User who owns this transaction |
| type | Enum (TransactionType) | NOT NULL | Transaction type (CASHBACK, REFERRAL_BONUS, WITHDRAWAL, INCOME) |
| amount | Decimal (10, 2) | NOT NULL | Transaction amount (positive for credits, negative for debits) |
| description | String | NOT NULL | Human-readable description |
| withdrawalId | String (UUID) | FOREIGN KEY → Withdrawal.id, NULLABLE | Reference to withdrawal if type=WITHDRAWAL |
| createdAt | DateTime | NOT NULL, DEFAULT now() | Transaction timestamp |
| updatedAt | DateTime | NOT NULL, auto-update | Last modification timestamp |

**Transaction Types**:
```typescript
enum TransactionType {
  CASHBACK         // Credit: User earned cashback from purchase
  REFERRAL_BONUS   // Credit: User earned bonus from referral
  WITHDRAWAL       // Debit: User withdrew funds (negative amount)
  INCOME           // Credit: Manual test top-up (dev/test only)
}
```

**Amount Convention**:
- **Positive**: Credits (CASHBACK, REFERRAL_BONUS, INCOME)
- **Negative**: Debits (WITHDRAWAL)
- Balance = SUM(all amounts) for userId

**Relationships**:
- Belongs to one `User` (N:1)
- Optionally belongs to one `Withdrawal` (N:1) if type=WITHDRAWAL

**Indexes**:
- `id` (Primary Key)
- `userId` (Index for balance calculation and history queries)
- Compound: `(userId, createdAt DESC)` (Optimize paginated history queries)
- `withdrawalId` (Index for join queries)

**Validation Rules**:
- amount must be non-zero (class-validator @IsNotEmpty)
- amount precision: 2 decimal places (USD cents)
- type must be valid TransactionType enum value
- description must be 1-500 characters
- If type=WITHDRAWAL, amount must be negative

**Prisma Model**:
```prisma
enum TransactionType {
  CASHBACK
  REFERRAL_BONUS
  WITHDRAWAL
  INCOME
}

model RewardTransaction {
  id           String          @id @default(uuid())
  userId       String
  type         TransactionType
  amount       Decimal         @db.Decimal(10, 2)
  description  String          @db.VarChar(500)
  withdrawalId String?
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  withdrawal Withdrawal? @relation(fields: [withdrawalId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([userId, createdAt(sort: Desc)])
  @@index([withdrawalId])
  @@map("reward_transactions")
}
```

---

### 4. Withdrawal

**Purpose**: Represents a withdrawal request and workflow. Links to corresponding `RewardTransaction` entry in the ledger.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String (UUID) | PRIMARY KEY | Unique withdrawal identifier |
| userId | String (UUID) | FOREIGN KEY → User.id, NOT NULL, INDEX | User who initiated withdrawal |
| amount | Decimal (10, 2) | NOT NULL | Withdrawal amount (positive value) |
| bankAccountId | String (UUID) | FOREIGN KEY → BankAccount.id, NOT NULL | Target bank account |
| status | Enum (WithdrawalStatus) | NOT NULL, DEFAULT COMPLETED | Withdrawal status |
| createdAt | DateTime | NOT NULL, DEFAULT now() | Withdrawal request timestamp |
| completedAt | DateTime | NULLABLE | Completion timestamp (null if not completed) |
| updatedAt | DateTime | NOT NULL, auto-update | Last modification timestamp |

**Withdrawal Status**:
```typescript
enum WithdrawalStatus {
  COMPLETED  // Withdrawal succeeded (immediate for MVP)
}
```

**Note**: For MVP, all withdrawals complete immediately with status=COMPLETED. Future statuses (PENDING, PROCESSING, FAILED) out of scope.

**Relationships**:
- Belongs to one `User` (N:1)
- Belongs to one `BankAccount` (N:1)
- Has one `RewardTransaction` (1:1) via withdrawal.id

**Indexes**:
- `id` (Primary Key)
- `userId` (Index for user's withdrawal history)
- Compound: `(userId, createdAt DESC)` (Optimize withdrawal history queries)
- `bankAccountId` (Index for account-specific queries)

**Validation Rules**:
- amount must be >= 1.00 (minimum withdrawal amount)
- amount precision: 2 decimal places (USD cents)
- bankAccountId must exist and belong to userId
- status must be valid WithdrawalStatus enum value

**Prisma Model**:
```prisma
enum WithdrawalStatus {
  COMPLETED
}

model Withdrawal {
  id            String           @id @default(uuid())
  userId        String
  amount        Decimal          @db.Decimal(10, 2)
  bankAccountId String
  status        WithdrawalStatus @default(COMPLETED)
  createdAt     DateTime         @default(now())
  completedAt   DateTime?
  updatedAt     DateTime         @updatedAt

  user        User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  bankAccount BankAccount         @relation(fields: [bankAccountId], references: [id], onDelete: Restrict)
  transaction RewardTransaction[]

  @@index([userId])
  @@index([userId, createdAt(sort: Desc)])
  @@index([bankAccountId])
  @@map("withdrawals")
}
```

---

## Complete Prisma Schema

**File**: `server/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enums
enum TransactionType {
  CASHBACK
  REFERRAL_BONUS
  WITHDRAWAL
  INCOME
}

enum WithdrawalStatus {
  COMPLETED
}

// Models
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  bankAccounts BankAccount[]
  transactions RewardTransaction[]
  withdrawals  Withdrawal[]

  @@map("users")
}

model BankAccount {
  id              String   @id @default(uuid())
  userId          String
  accountNumber   String
  lastFourDigits  String   @db.VarChar(4)
  accountType     String   @db.VarChar(50)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  withdrawals Withdrawal[]

  @@index([userId])
  @@index([userId, isActive])
  @@map("bank_accounts")
}

model RewardTransaction {
  id           String          @id @default(uuid())
  userId       String
  type         TransactionType
  amount       Decimal         @db.Decimal(10, 2)
  description  String          @db.VarChar(500)
  withdrawalId String?
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  withdrawal Withdrawal? @relation(fields: [withdrawalId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([userId, createdAt(sort: Desc)])
  @@index([withdrawalId])
  @@map("reward_transactions")
}

model Withdrawal {
  id            String           @id @default(uuid())
  userId        String
  amount        Decimal          @db.Decimal(10, 2)
  bankAccountId String
  status        WithdrawalStatus @default(COMPLETED)
  createdAt     DateTime         @default(now())
  completedAt   DateTime?
  updatedAt     DateTime         @updatedAt

  user        User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  bankAccount BankAccount         @relation(fields: [bankAccountId], references: [id], onDelete: Restrict)
  transaction RewardTransaction[]

  @@index([userId])
  @@index([userId, createdAt(sort: Desc)])
  @@index([bankAccountId])
  @@map("withdrawals")
}
```

---

## Data Integrity Rules

### 1. Balance Calculation
- Balance MUST always be computed from `RewardTransaction.amount` SUM
- Never store balance as a field on User
- Use Prisma aggregation for performance:
  ```typescript
  const balance = await prisma.rewardTransaction.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  ```

### 2. Withdrawal Atomicity
- Creating a withdrawal MUST atomically create:
  1. Withdrawal record (status=COMPLETED)
  2. RewardTransaction record (type=WITHDRAWAL, amount=negative, withdrawalId=set)
- Use Prisma interactive transaction with SELECT FOR UPDATE

### 3. Referential Integrity
- User deletion: CASCADE to all related records (bank accounts, transactions, withdrawals)
- BankAccount deletion: RESTRICT if withdrawals exist (prevent orphaned withdrawal records)
- Withdrawal deletion: SET NULL on RewardTransaction.withdrawalId (preserve ledger history)

### 4. Concurrency Control
- Withdrawal requests per user: Serialize via SELECT FOR UPDATE on User row
- Transaction isolation: Serializable level for withdrawal processing
- Timeout: 5 seconds for withdrawal transactions

---

## Seed Data (Development/Testing)

**File**: `server/prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'test@rewards.com' },
    update: {},
    create: {
      id: 'test-user-001',
      email: 'test@rewards.com',
      name: 'Test User',
    },
  });

  // Create test bank accounts
  await prisma.bankAccount.create({
    data: {
      id: 'bank-account-001',
      userId: user.id,
      accountNumber: '1234567890',
      lastFourDigits: '7890',
      accountType: 'Checking',
    },
  });

  await prisma.bankAccount.create({
    data: {
      id: 'bank-account-002',
      userId: user.id,
      accountNumber: '0987654321',
      lastFourDigits: '4321',
      accountType: 'Savings',
    },
  });

  // Create test transactions
  await prisma.rewardTransaction.createMany({
    data: [
      {
        userId: user.id,
        type: 'CASHBACK',
        amount: 25.50,
        description: 'Cashback from purchase at Store A',
      },
      {
        userId: user.id,
        type: 'REFERRAL_BONUS',
        amount: 10.00,
        description: 'Referral bonus for friend signup',
      },
      {
        userId: user.id,
        type: 'CASHBACK',
        amount: 15.75,
        description: 'Cashback from purchase at Store B',
      },
    ],
  });

  console.log('Seed data created successfully');
  console.log(`Test user balance: $51.25`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## Migration Strategy

### Initial Migration
```bash
# Create initial migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Seed database
npx prisma db seed
```

### Future Migrations
- Use `prisma migrate dev` for development migrations
- Use `prisma migrate deploy` for production deployments
- Never manually edit migration files
- Always test migrations on staging before production

---

## Performance Considerations

### Indexes
- All foreign keys indexed automatically
- Compound indexes for common query patterns:
  - `(userId, createdAt DESC)` for paginated transaction history
  - `(userId, isActive)` for active bank accounts
- Consider adding indexes for:
  - `RewardTransaction.type` if filtering by type becomes common
  - `Withdrawal.status` if additional statuses added in future

### Query Optimization
- Use Prisma `include` for eager loading related data (avoid N+1)
- Use Prisma `aggregate` for balance calculation (single DB query)
- Cursor-based pagination prevents offset performance issues
- Limit transaction history queries to reasonable page sizes (50 default)

### Scaling Considerations
- Consider partitioning `RewardTransaction` table by `createdAt` if volume exceeds millions of rows
- Consider archiving old transactions to separate table after N years
- Monitor query performance with pg_stat_statements
- Add read replicas if read load exceeds single instance capacity

---

## Next Steps

1. Generate Prisma Client: `npx prisma generate`
2. Create initial migration: `npx prisma migrate dev --name init`
3. Seed test data: `npx prisma db seed`
4. Implement repository interfaces using Prisma Client
5. Create DTOs mapping domain models to API responses
