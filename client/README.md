# Rewards Application - Frontend

React + TypeScript + Vite application for the Kiwi Challenge Rewards feature.

## Overview

The Rewards Overview (Rewards Home) feature allows users to view their accumulated rewards balance and transaction history. Built with React 19.2.0, TypeScript 5.9.3, and Vite 7.2.4.

## Features

### User Stories

1. **US1 (P1): View Balance** - Display accumulated rewards balance with currency formatting
2. **US2 (P1): View Transaction History** - Display paginated transaction history grouped by month
3. **US3 (P2): Pagination** - Load more transactions with cursor-based pagination
4. **US4 (P2): Withdrawal Navigation** - Navigate to withdrawal page with "Retirar" button

### Key Capabilities

- **Real-time Balance Display**: Shows current accumulated rewards with currency formatting
- **Transaction History**: Newest-first transaction list with month grouping
- **Pagination**: Cursor-based pagination for handling large transaction histories
- **Error Handling**: User-friendly Spanish error messages with retry functionality
- **Loading States**: Skeleton placeholders for better perceived performance
- **Accessibility**: WCAG 2.1 AA compliant with full keyboard navigation and screen reader support
- **Mobile-First**: Responsive design from 375px to desktop
- **Performance**: Memoized computations, < 2s load time, zero CLS
- **Observability**: Comprehensive logging for API failures, page loads, and client errors

## Tech Stack

- **React** 19.2.0 - UI library
- **TypeScript** 5.9.3 - Type safety
- **Vite** 7.2.4 - Build tool and dev server
- **React Router** 7.12.0 - Client-side routing
- **Vitest** 4.0.16 - Unit and component testing
- **Testing Library** - React component testing
- **MSW** 2.12.7 - API mocking for tests
- **jest-axe** 10.0.0 - Automated accessibility testing
- **Lucide React** 0.562.0 - Icon library (~0.5KB)

## Project Structure

```
client/
├── src/
│   ├── features/
│   │   └── rewards/
│   │       ├── api/              # API client
│   │       │   └── rewardsApi.ts
│   │       ├── components/       # React components
│   │       │   ├── RewardsHome.tsx
│   │       │   ├── RewardsHeader.tsx
│   │       │   ├── BalanceSummaryCard.tsx
│   │       │   ├── TransactionList.tsx
│   │       │   ├── TransactionItem.tsx
│   │       │   └── LoadMoreButton.tsx
│   │       ├── hooks/            # Custom hooks
│   │       │   ├── useAsyncData.ts
│   │       │   ├── useRewardsSummary.ts
│   │       │   └── useRewardsTransactions.ts
│   │       ├── types/            # TypeScript types
│   │       │   ├── rewards.types.ts
│   │       │   ├── api.types.ts
│   │       │   └── ui.types.ts
│   │       ├── utils/            # Utility functions
│   │       │   ├── formatCurrency.ts
│   │       │   ├── formatDate.ts
│   │       │   ├── formatMonthHeader.ts
│   │       │   ├── formatSignedAmount.ts
│   │       │   ├── groupTransactionsByMonth.ts
│   │       │   ├── typeGuards.ts
│   │       │   └── logger.ts
│   │       ├── constants/        # Constants
│   │       │   ├── errorMessages.ts
│   │       │   └── transactionLabels.ts
│   │       └── styles/           # CSS styles
│   │           └── rewards.css
│   ├── components/               # Shared components
│   │   ├── LoadingState.tsx
│   │   ├── ErrorState.tsx
│   │   └── EmptyState.tsx
│   ├── App.tsx                   # Root component with routing
│   └── main.tsx                  # Entry point
├── tests/
│   ├── features/
│   │   └── rewards/
│   │       ├── BalanceSummaryCard.test.tsx
│   │       ├── TransactionList.test.tsx
│   │       ├── useRewardsSummary.test.ts
│   │       ├── useRewardsTransactions.test.ts
│   │       └── accessibility-checklist.md
│   ├── mocks/
│   │   ├── handlers.ts           # MSW request handlers
│   │   ├── server.ts             # MSW server setup
│   │   └── browser.ts            # MSW browser setup
│   └── setup.ts                  # Test setup file
├── package.json
├── vite.config.ts                # Vite + Vitest configuration
└── tsconfig.json                 # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 20.x or later (LTS recommended)
- pnpm 8.x or later

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start development server (default: http://localhost:5173)
pnpm dev
```

The application will be available at http://localhost:5173/rewards

### Testing

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test --run

# Run tests with coverage report
pnpm test:coverage
```

**Coverage Requirements**: Minimum 85% coverage across lines, functions, branches, and statements (per Constitution Principle IV).

### Linting

```bash
# Run ESLint
pnpm lint
```

### Production Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Environment Variables

### Development (.env.development)

```bash
# API Base URL for development
VITE_API_BASE_URL=http://localhost:3000
```

### Production (.env.production)

```bash
# API Base URL for production
VITE_API_BASE_URL=https://api.production.com
```

**Note**: Currently, the API_BASE_URL is hardcoded in `rewardsApi.ts`. This will be replaced with environment variable access in future iterations.

## API Contracts

### GET /rewards/summary

Returns the user's current accumulated rewards balance.

**Headers:**
- `x-user-id` (required): User ID for authentication

**Response:**
```json
{
  "balance": 1234.56,
  "currency": "USD"
}
```

### GET /rewards/transactions

Returns paginated transaction history for the user.

**Headers:**
- `x-user-id` (required): User ID for authentication

**Query Parameters:**
- `limit` (optional, default: 20): Number of transactions per page
- `cursor` (optional): Cursor for pagination

**Response:**
```json
{
  "transactions": [
    {
      "id": "txn_001",
      "type": "CASHBACK",
      "amount": 25.50,
      "description": "Cashback on purchase",
      "createdAt": "2025-09-15T14:30:00Z"
    }
  ],
  "nextCursor": "eyJpZCI6InR4bl8wMDIifQ==",
  "hasMore": true,
  "count": 1
}
```

## Component Documentation

### RewardsHome

Main page component that composes all sub-components.

**Location**: `src/features/rewards/components/RewardsHome.tsx`

### BalanceSummaryCard

Displays the user's current accumulated balance with a "Retirar" (Withdraw) button.

**Props**: None (fetches data internally)

**States**:
- Loading: Skeleton placeholder
- Success: Balance amount with currency formatting + enabled button
- Error: Error message with retry button

### TransactionList

Displays paginated transaction history grouped by month.

**Props**: None (fetches data internally)

**Features**:
- Newest-first ordering
- Month-based grouping (e.g., "Septiembre 2025")
- Visual distinction for incoming (+) vs outgoing (-) transactions
- Load more button for pagination

### LoadMoreButton

Button component for loading additional transactions.

**Props**:
- `hasMore: boolean` - Whether more transactions exist
- `loadingMore: boolean` - Whether currently loading
- `onLoadMore: () => void` - Callback when button is clicked

## Custom Hooks

### useRewardsSummary

Fetches and manages rewards summary data.

**Returns**:
```typescript
{
  data: RewardsSummary | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
```

### useRewardsTransactions

Fetches and manages paginated transaction history.

**Returns**:
```typescript
{
  data: Transaction[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}
```

## Accessibility

The Rewards feature is fully WCAG 2.1 AA compliant:

- **Keyboard Navigation**: All interactive elements accessible via Tab/Shift+Tab
- **Activation**: Buttons activate with Enter and Space keys
- **ARIA Labels**: All interactive elements have descriptive aria-label attributes
- **Focus States**: Visible focus indicators with 2px outline
- **Screen Readers**: Proper role="status" and role="alert" announcements
- **Color Contrast**: All text meets 4.5:1 minimum contrast ratio
- **Reflow**: Content adapts to 320px viewport width

See `tests/features/rewards/accessibility-checklist.md` for full validation checklist.

## Performance

- **Load Time**: < 2 seconds for initial page load (per SC-001)
- **CLS**: 0 (no layout shift during loading, per SC-008)
- **Scalability**: Tested with 1,000+ transactions with no degradation
- **Memoization**: groupTransactionsByMonth memoized for performance

## Logging & Observability

The application includes comprehensive logging:

- **API Failures**: All API errors logged with endpoint and error details
- **Page Load Times**: Performance tracking for page loads
- **Client Errors**: Global error handler catches unhandled errors
- **Sensitive Data Protection**: All logged data sanitized to remove balances, amounts, user IDs

**Note**: In development, logs output to console. In production, logs can be sent to monitoring services (Sentry, DataDog, etc.).

## Testing Strategy

### Unit Tests

- Hooks: `useRewardsSummary`, `useRewardsTransactions`
- Utilities: All formatting and grouping functions

### Component Tests

- Render tests for all components
- Loading/error/success state tests
- Interaction tests (button clicks, navigation)

### Integration Tests

- End-to-end user flows with MSW mocked APIs
- Accessibility tests with jest-axe

### Manual Testing

- Keyboard navigation validation
- Screen reader validation (VoiceOver, NVDA, JAWS, TalkBack)
- Visual regression testing
- Performance profiling with Chrome DevTools

## Known Limitations

1. **User Authentication**: User ID is currently hardcoded as "test-user-001" in `rewardsApi.ts`. This will be replaced with proper authentication context in future iterations.

2. **Environment Variables**: API_BASE_URL is hardcoded instead of using environment variables. Will be updated to use `import.meta.env.VITE_API_BASE_URL`.

3. **Internationalization**: Currently Spanish-only. I18n library will be added for multi-language support if needed.

4. **Withdrawal Page**: The `/withdraw` route is defined but the actual withdrawal page is not implemented (out of scope for current phase).

## Contributing

### Development Workflow

1. Create feature branch from `main`
2. Implement changes following TDD approach (tests first)
3. Ensure 85%+ test coverage
4. Run linter and fix issues
5. Build production bundle and verify no errors
6. Create pull request with descriptive summary

### Code Style

- **TypeScript**: Strict mode enabled
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Comments**: JSDoc comments for public APIs
- **Testing**: Test files colocated with source files

## License

[To be determined]

## Support

For issues or questions, please contact the development team or file an issue in the repository.
