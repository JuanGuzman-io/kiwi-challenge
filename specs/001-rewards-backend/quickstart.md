# Quickstart Guide: Rewards Backend API

**Feature**: 001-rewards-backend
**Last Updated**: 2026-01-10

## Overview

This quickstart guide will help you set up and run the Rewards Backend API locally for development and testing. The API provides endpoints for viewing rewards balances, transaction history, processing withdrawals, and managing linked bank accounts.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20.x LTS or later
- **npm**: Version 9.x or later (comes with Node.js)
- **PostgreSQL**: Version 14 or later
- **Git**: For cloning the repository

## Project Structure

```text
server/
├── src/                  # Application source code
│   ├── main.ts          # Application entry point
│   ├── app.module.ts    # Root module
│   ├── common/          # Shared infrastructure (guards, filters, etc.)
│   ├── rewards/         # Rewards module
│   ├── withdrawals/     # Withdrawals module
│   ├── bank-accounts/   # Bank accounts module
│   └── prisma/          # Prisma integration
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── migrations/      # Database migrations
│   └── seed.ts          # Database seeding script
├── test/                # Tests (unit, integration, e2e)
├── package.json
└── .env                 # Environment variables (create from .env.example)
```

## Installation Steps

### 1. Clone the Repository (if applicable)

```bash
git clone <repository-url>
cd kiwi-challenge/server
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- NestJS framework
- Prisma ORM
- PostgreSQL client
- Testing libraries (Jest, supertest)
- Validation libraries (class-validator, class-transformer)

### 3. Set Up Environment Variables

Create a `.env` file in the `server/` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/rewards_db?schema=public"

# Application
NODE_ENV=development
PORT=3000

# Logging
LOG_LEVEL=info

# Identity (development/test only)
ALLOW_IDENTITY_FALLBACK=true
DEFAULT_TEST_USER_ID=test-user-001

# Feature Flags
ENABLE_INCOME_ENDPOINT=true
```

**Important**: The identity mechanism using `x-user-id` header is for development/testing only. In production, set `ALLOW_IDENTITY_FALLBACK=false` and implement proper authentication.

### 4. Set Up PostgreSQL Database

Create a new PostgreSQL database:

```bash
# Using psql
psql -U postgres
CREATE DATABASE rewards_db;
\q
```

Or using Docker:

```bash
docker run --name rewards-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=rewards_db \
  -p 5432:5432 \
  -d postgres:14
```

### 5. Run Database Migrations

Generate Prisma Client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

This will:
- Generate the Prisma Client with type-safe query builders
- Create the database schema (User, BankAccount, RewardTransaction, Withdrawal tables)
- Apply indexes for optimal query performance

### 6. Seed the Database (Optional)

Populate the database with test data:

```bash
npx prisma db seed
```

This creates:
- Test users (test-user-001, test-user-002)
- Linked bank accounts for each user
- Sample transactions (cashback, referral bonuses)
- Initial balances for testing

## Running the Application

### Development Mode (with hot-reload)

```bash
npm run start:dev
```

The API will be available at: `http://localhost:3000`

### Production Mode

```bash
npm run build
npm run start:prod
```

### Watch Mode (for debugging)

```bash
npm run start:debug
```

Then attach your debugger to port 9229.

## API Documentation

Once the application is running, access the Swagger UI at:

```
http://localhost:3000/api/docs
```

This provides interactive API documentation with:
- All endpoints and their parameters
- Request/response schemas
- Example requests and responses
- Error responses with RFC 7807 format

## Testing the API

### Using Swagger UI

1. Navigate to `http://localhost:3000/api/docs`
2. Use the "Try it out" button on any endpoint
3. Add `x-user-id: test-user-001` header for authentication

### Using cURL

#### Get Rewards Summary

```bash
curl -X GET http://localhost:3000/rewards/summary \
  -H "x-user-id: test-user-001"
```

Expected response:
```json
{
  "balance": 125.50,
  "currency": "USD"
}
```

#### Get Transaction History (Paginated)

```bash
curl -X GET "http://localhost:3000/rewards/transactions?limit=50" \
  -H "x-user-id: test-user-001"
```

Expected response:
```json
{
  "transactions": [
    {
      "id": "tx-001",
      "type": "CASHBACK",
      "amount": 25.50,
      "description": "Cashback from purchase at Store A",
      "createdAt": "2026-01-10T12:30:00Z"
    }
  ],
  "nextCursor": "tx-050",
  "hasMore": true,
  "count": 50
}
```

#### Get Linked Bank Accounts

```bash
curl -X GET http://localhost:3000/bank-accounts \
  -H "x-user-id: test-user-001"
```

Expected response:
```json
{
  "accounts": [
    {
      "id": "ba-001",
      "lastFourDigits": "1234",
      "accountType": "Checking",
      "isActive": true,
      "createdAt": "2025-12-15T10:00:00Z"
    }
  ],
  "count": 1
}
```

#### Create Withdrawal

```bash
curl -X POST http://localhost:3000/withdrawals \
  -H "x-user-id: test-user-001" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "bankAccountId": "ba-001"
  }'
```

Expected response:
```json
{
  "id": "wd-001",
  "amount": 50.00,
  "status": "COMPLETED",
  "bankAccountId": "ba-001",
  "bankAccountLastFour": "1234",
  "createdAt": "2026-01-10T14:30:00Z",
  "completedAt": "2026-01-10T14:30:00Z",
  "transactionId": "tx-004"
}
```

#### Manual Top-Up (Dev/Test Only)

```bash
curl -X POST http://localhost:3000/rewards/income \
  -H "x-user-id: test-user-001" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "description": "Manual test top-up"
  }'
```

Expected response:
```json
{
  "id": "tx-005",
  "type": "INCOME",
  "amount": 100.00,
  "description": "Manual test top-up [MANUAL_TEST_TOPUP]",
  "createdAt": "2026-01-10T14:00:00Z"
}
```

### Using Postman or Insomnia

1. Import the OpenAPI specs from `specs/001-rewards-backend/contracts/`
2. Set the `x-user-id` header to `test-user-001`
3. Execute requests against `http://localhost:3000`

## Running Tests

### Unit Tests

Test individual services with mocked dependencies:

```bash
npm run test
```

### Integration Tests

Test controllers with a real test database:

```bash
npm run test:integration
```

### End-to-End Tests

Test complete workflows:

```bash
npm run test:e2e
```

### Test Coverage

Generate coverage report:

```bash
npm run test:cov
```

Target: 85%+ coverage for service layer.

## Database Management

### View Database Contents

Using Prisma Studio (GUI):

```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` for browsing and editing data.

### Reset Database

⚠️ **Warning**: This will delete all data!

```bash
npx prisma migrate reset
```

This will:
- Drop the database
- Recreate it
- Run all migrations
- Run seed script

### Create New Migration

After modifying `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name descriptive_migration_name
```

## Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server at localhost:5432`

**Solution**: Ensure PostgreSQL is running and the `DATABASE_URL` in `.env` is correct.

```bash
# Check PostgreSQL status
pg_isready -h localhost -p 5432

# Or for Docker
docker ps | grep postgres
```

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**: Kill the process using port 3000 or change the `PORT` in `.env`.

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Prisma Client Out of Sync

**Error**: `Prisma schema has changed, please run prisma generate`

**Solution**: Regenerate Prisma Client:

```bash
npx prisma generate
```

### Migration Conflicts

**Error**: Migration conflicts or drift detected

**Solution**: Reset and reapply migrations:

```bash
npx prisma migrate reset
npx prisma migrate dev
```

## Architecture Overview

This API follows **Hexagonal Architecture** (Ports and Adapters):

- **Domain Layer**: Pure TypeScript business logic (balance calculation, validation)
- **Application Layer**: NestJS services orchestrating domain logic
- **Infrastructure Layer**:
  - Inbound adapters: HTTP controllers, Guards, DTOs
  - Outbound adapters: Prisma repositories, logging

Key patterns:
- Repository pattern with interface-based injection
- Cursor-based pagination for transaction history
- Database row locking (SELECT FOR UPDATE) for concurrent withdrawals
- RFC 7807 Problem Details for standardized error responses
- Structured logging with Pino

## Security Considerations

### Development/Test Identity Mechanism

The `x-user-id` header is **for development and testing only**:

- ✅ **Development**: Enabled with fallback to test user
- ✅ **Test**: Enabled for automated testing
- ❌ **Production**: Must be disabled or reject with 401

### Production Deployment Checklist

Before deploying to production:

1. Set `NODE_ENV=production` in environment
2. Set `ALLOW_IDENTITY_FALLBACK=false`
3. Set `ENABLE_INCOME_ENDPOINT=false` (disable manual top-up)
4. Implement proper authentication (JWT, OAuth2, etc.)
5. Replace identity guard with real authentication middleware
6. Configure proper database credentials (not default passwords)
7. Enable HTTPS/TLS
8. Configure CORS appropriately
9. Set up monitoring and alerting
10. Review and test error handling for production

## Next Steps

- Review the [Feature Specification](./spec.md) for complete requirements
- Review the [Implementation Plan](./plan.md) for architecture details
- Review the [Data Model](./data-model.md) for database schema
- Review API contracts in `contracts/` directory
- Begin implementation following the hexagonal architecture pattern

## Support

For issues or questions:
- Check the [Research Document](./research.md) for technical decisions
- Review test files for usage examples
- Consult the Swagger documentation at `/api/docs`
