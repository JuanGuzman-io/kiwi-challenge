# Quickstart: Rewards Overview (Rewards Home)

**Feature**: 001-rewards-home
**Date**: 2026-01-11

## Prerequisites

- Node.js 20.x LTS or later
- pnpm (recommended) or npm
- Modern browser (Chrome, Firefox, Safari, or Edge - last 2 versions)

## Setup

### 1. Install Dependencies

From repository root:

```bash
cd client
pnpm install
```

### 2. Configure Environment

Create `.env.development` in `client/` directory:

```bash
# client/.env.development
VITE_API_BASE_URL=http://localhost:3000
```

For mock API development (no backend required), MSW will intercept requests automatically.

### 3. Start Development Server

```bash
pnpm dev
```

Navigate to `http://localhost:5173/rewards`

## Development Workflow

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests for specific file
pnpm test useRewardsSummary
```

### Linting

```bash
pnpm lint
```

### Build for Production

```bash
pnpm build
pnpm preview  # Preview production build
```

## Testing Scenarios

### Manual Testing Checklist

#### Balance Display
- [ ] Balance loads within 2 seconds
- [ ] Balance displays with currency symbol
- [ ] "Retirar" button enabled when balance > 0
- [ ] "Retirar" button disabled when balance = 0
- [ ] "Retirar" button disabled while loading

#### Transaction History
- [ ] Transactions grouped by month (Spanish month names)
- [ ] Transactions sorted newest-first
- [ ] Incoming transactions show + prefix and positive amount
- [ ] Outgoing transactions show - prefix and negative amount
- [ ] Transaction dates formatted correctly

#### Pagination
- [ ] "Load more" button appears when hasMore = true
- [ ] "Load more" appends transactions without resetting list
- [ ] "Load more" disabled while loading
- [ ] "Load more" hidden when all transactions loaded

#### Error States
- [ ] Error message displays in Spanish with retry button
- [ ] Retry button fetches data again
- [ ] Layout remains stable during error state

#### Empty States
- [ ] Empty state message displays when no transactions
- [ ] Balance card remains visible in empty state

### Accessibility Testing

#### Keyboard Navigation
- [ ] Tab navigates through all interactive elements
- [ ] Enter/Space activates buttons
- [ ] Focus indicators visible
- [ ] "Retirar" button reachable by keyboard
- [ ] "Load more" button reachable by keyboard
- [ ] "Retry" button reachable by keyboard

#### Screen Reader
Test with NVDA (Windows), JAWS (Windows), or VoiceOver (Mac):
- [ ] Loading states announced with aria-live="polite"
- [ ] Error states announced with aria-live="assertive"
- [ ] "Retirar" button state communicated (enabled/disabled)
- [ ] Transaction list navigable
- [ ] Month headers announced

#### Automated Accessibility
```bash
# jest-axe runs automatically in component tests
pnpm test

# Check for violations in test output
```

### Performance Testing

#### Load Time
- [ ] Balance visible within 2 seconds (measure with DevTools Performance tab)
- [ ] Zero layout shift (measure CLS in DevTools)

#### Large Dataset
- [ ] Test with 1,000+ transactions
- [ ] Pagination keeps rendering predictable
- [ ] No performance degradation

## Mock Data

MSW handlers provide mock data for development. Edit `client/tests/mocks/handlers.ts` to customize:

```typescript
// Example: Modify balance
http.get('/rewards/summary', () => {
  return HttpResponse.json({
    balance: 5000.00,  // Change this value
    currency: 'USD',
  });
});

// Example: Add more transactions
const mockTransactions = [
  { id: 'txn_001', type: 'CASHBACK', amount: 25.50, ... },
  { id: 'txn_002', type: 'WITHDRAWAL', amount: -10.00, ... },
  // Add more...
];
```

## Troubleshooting

### API Timeout Errors
If you see timeout errors frequently:
1. Check network tab in DevTools
2. Verify backend is running (if not using MSW)
3. Increase timeout in `rewardsApi.ts` if needed (default: 5s per FR-053)

### MSW Not Intercepting
If API calls aren't being mocked:
1. Verify `tests/setup.ts` is loaded (check vite.config.ts)
2. Check browser console for MSW registration errors
3. Ensure MSW worker is started in `main.tsx` for development

### Layout Shift Issues
If content jumps during loading:
1. Verify skeleton loaders match final content dimensions
2. Check CSS for missing explicit dimensions
3. Measure CLS in DevTools Lighthouse

## Related Documents

- [spec.md](./spec.md): Feature specification
- [plan.md](./plan.md): Implementation plan
- [data-model.md](./data-model.md): TypeScript types
- [contracts/](./contracts/): API contracts