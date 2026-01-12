# Quickstart: Submit Withdrawal and Success Confirmation

**Feature**: 003-withdraw-submit | **Date**: 2026-01-11
**Status**: Phase 1 - Test Scenarios

## Purpose

This document provides manual test scenarios and automated test guidance for the withdrawal submission and success confirmation feature. Use these scenarios to validate the implementation against the functional requirements.

## Prerequisites

1. **002-withdraw feature completed**: Account selection flow must be working
2. **API mocked or running**: POST /withdrawals endpoint available (MSW or real backend)
3. **Test user**: User with active bank accounts and non-zero balance
4. **Assets**: success-check.png and brake-warning-illustration.png in /client/src/assets/

## Quick Test Flow (Happy Path)

```bash
# 1. Start the development server
cd client
pnpm dev

# 2. Navigate to the withdraw screen
# URL: http://localhost:5173/withdraw

# 3. Verify you see:
#    - "Elige tu método de retiro" title
#    - Current balance amount (e.g., $1,234.56)
#    - "Selecciona una cuenta" button (disabled)
#    - Warning card: "Debes esperar unos minutos..."

# 4. Click "Selecciona una cuenta"
#    - Should navigate to /withdraw/accounts
#    - Should show list of bank accounts with masked numbers (•••• 1234)

# 5. Select a bank account
#    - Should navigate back to /withdraw
#    - Account selector should show selected account (•••• 1234)
#    - "Retirar fondos" button should be enabled

# 6. Click "Retirar fondos"
#    - Button should immediately disable
#    - Button text should change to "Procesando..."
#    - After ~500ms, should navigate to /withdraw/success

# 7. Verify success screen shows:
#    - Success checkmark image (or SVG fallback)
#    - Title: "¡Tu retiro fue exitoso!"
#    - Description: "Procesamos tu solicitud y enviamos tu recompensa a tu cuenta bancaria terminada en 1234"
#    - Warning card (persistent from withdraw screen)
#    - "Regresar a Rewards" button

# 8. Click "Regresar a Rewards"
#    - Should navigate to /rewards
#    - Balance should be updated (refetched)

# Expected time: < 30 seconds (SC-001)
```

---

## Test Scenarios by User Story

### User Story 1: Submit Withdrawal Request (P1 - MVP)

#### Scenario 1.1: Successful submission with account selected

**Given**: I am on /withdraw with a bank account selected and valid balance
**When**: I click "Retirar fondos"
**Then**:
- ✅ POST /withdrawals request sent with userId, amount, bankAccountId, currency
- ✅ Request headers include `accept: application/json` and `Content-Type: application/json`
- ✅ Button shows "Procesando..." and is disabled
- ✅ After success (201), I am navigated to /withdraw/success
- ✅ Console log shows [WITHDRAWAL_SUCCESS] with withdrawal ID and details

**Test Data**:
- userId: "test-user-001"
- amount: 1234.56
- bankAccountId: "bank-account-001"
- currency: "USD"

**Expected API Response**:
```json
{
  "id": "withdrawal-001",
  "userId": "test-user-001",
  "amount": 1234.56,
  "bankAccountId": "bank-account-001",
  "currency": "USD",
  "status": "pending",
  "createdAt": "2026-01-11T20:00:00.000Z"
}
```

**Validation**:
- Check DevTools Network tab for POST /withdrawals request
- Check Console for [WITHDRAWAL_SUCCESS] log
- Verify navigation state includes withdrawalData with lastFourDigits

---

#### Scenario 1.2: Duplicate prevention - rapid triple-click

**Given**: I am on /withdraw with an account selected
**When**: I rapidly click "Retirar fondos" three times in succession
**Then**:
- ✅ Only ONE POST /withdrawals request is sent (SC-002)
- ✅ Button disables after first click (visual feedback < 200ms, SC-003)
- ✅ Subsequent clicks are ignored
- ✅ Only one [WITHDRAWAL_SUCCESS] log appears in console

**Test Method**:
1. Open DevTools Network tab, filter for "withdrawals"
2. Click "Retirar fondos" button 3 times rapidly (within 100ms)
3. Verify only 1 network request appears
4. Verify Console shows only 1 log entry

**Automated Test**: `WithdrawScreen.test.tsx` - "should prevent duplicate submissions from rapid clicks"

---

#### Scenario 1.3: Button disabled during submission

**Given**: I click "Retirar fondos"
**When**: The request is in progress
**Then**:
- ✅ Button shows "Procesando..." (FR-009)
- ✅ Button has `disabled` attribute (FR-010)
- ✅ Button has `aria-disabled="true"` (FR-011)
- ✅ Button has visual disabled styling (opacity/background color)
- ✅ Clicking the button again has no effect

**Visual Validation**:
- Button background color changes from #33CAFF (enabled) to #CBD5E1 (disabled)
- Button cursor changes to `not-allowed`

---

### User Story 2: View Success Confirmation (P1 - MVP)

#### Scenario 2.1: Success screen displays correctly after submission

**Given**: I successfully submitted a withdrawal
**When**: I arrive at /withdraw/success
**Then**:
- ✅ Success checkmark image is displayed (success-check.png)
- ✅ Title is "¡Tu retiro fue exitoso!" (FR-022)
- ✅ Description includes last 4 digits: "...cuenta bancaria terminada en 1234" (FR-023)
- ✅ Title uses Poppins 600, 24px, center-aligned (FR-024)
- ✅ Description uses Poppins 400, 16px, center-aligned (FR-025)
- ✅ Warning card is visible at bottom (FR-028)
- ✅ "Regresar a Rewards" button is visible (FR-029)

**Visual Validation**:
- Success image centered on screen
- Text content matches exactly
- Typography matches design spec
- Layout is vertically centered

---

#### Scenario 2.2: Image fallback when success-check.png missing

**Given**: success-check.png file does not exist or fails to load
**When**: I arrive at /withdraw/success
**Then**:
- ✅ CSS-based checkmark icon (inline SVG or Unicode ✓) is displayed (FR-021a)
- ✅ Fallback icon has `aria-label="Success"` for accessibility
- ✅ Fallback icon matches approximate dimensions of image (120x120px)
- ✅ No broken image icon shown
- ✅ Console warning logged: "[WITHDRAW_SUCCESS] Image failed to load, using fallback"

**Test Method**:
1. Temporarily rename success-check.png to success-check.png.bak
2. Complete withdrawal flow
3. Verify SVG checkmark appears instead of broken image

---

#### Scenario 2.3: Return to rewards and refetch balance

**Given**: I am on /withdraw/success
**When**: I click "Regresar a Rewards"
**Then**:
- ✅ I am navigated to /rewards (FR-030)
- ✅ Rewards summary is refetched (FR-031)
- ✅ Balance updates to reflect withdrawal within 2 seconds (SC-007)
- ✅ Transaction history includes new withdrawal

**Test Method**:
1. Note current balance before withdrawal
2. Complete withdrawal flow
3. Click "Regresar a Rewards"
4. Verify balance decreases by withdrawal amount
5. Check DevTools Network tab for GET /rewards-summary request

---

### User Story 3: Handle Submission Errors (P2)

#### Scenario 3.1: Bank account not found (404 error)

**Given**: My selected bank account was deleted from another device
**When**: I submit a withdrawal with that account
**Then**:
- ✅ I remain on /withdraw (FR-014)
- ✅ Error message displayed inline above button: "The specified bank account does not exist or is not accessible" (FR-016, FR-019)
- ✅ Error has role="alert" for screen readers (FR-017)
- ✅ Button shows "Retirar fondos" again (no longer "Procesando...") (FR-015)
- ✅ Button is re-enabled so I can retry or select different account (FR-018)
- ✅ Console error shows [WITHDRAWAL_FAILURE] with status 404 (FR-051)

**Test Data** (MSW Mock):
```json
{
  "type": "https://api.example.com/errors/bank-account-not-found",
  "title": "Bank Account Not Found",
  "status": 404,
  "detail": "The specified bank account does not exist or is not accessible",
  "instance": "/withdrawals",
  "bankAccountId": "bank-account-001"
}
```

**Automated Test**: `WithdrawScreen.test.tsx` - "should display error on bank account not found"

---

#### Scenario 3.2: Server error (500) with retry

**Given**: The API returns a 500 error
**When**: I see the error message and click "Retirar fondos" again
**Then**:
- ✅ First submission shows error: "An unexpected error occurred while processing your withdrawal"
- ✅ Error is displayed inline above button
- ✅ Retry button click triggers NEW submission (FR-018)
- ✅ No duplicate submissions occur on retry (FR-020)
- ✅ If retry succeeds, I navigate to /withdraw/success

**Test Method**:
1. Configure MSW to return 500 on first request, 201 on second
2. Click "Retirar fondos"
3. Verify error appears
4. Click "Retirar fondos" again
5. Verify success navigation occurs
6. Verify only 2 network requests total (1 error, 1 success, no duplicates)

**Automated Test**: `WithdrawScreen.test.tsx` - "should allow retry after error without duplicates"

---

#### Scenario 3.3: Network timeout (5 seconds)

**Given**: The API takes longer than 5 seconds to respond
**When**: The request times out
**Then**:
- ✅ TimeoutError is thrown after 5 seconds (FR-049)
- ✅ Error message displayed: "Request exceeded 5 seconds"
- ✅ Button re-enabled for retry
- ✅ Console error shows [WITHDRAWAL_FAILURE] with timeout error

**Test Data** (MSW Mock):
```typescript
http.post('/withdrawals', async () => {
  await delay(6000); // Exceed 5-second timeout
  return HttpResponse.json({ ... }, { status: 201 });
})
```

---

### User Story 4: Cooldown Warning Awareness (P3)

#### Scenario 4.1: Warning card visible on /withdraw screen

**Given**: I am on the /withdraw screen
**When**: I view the screen
**Then**:
- ✅ Warning card visible at bottom of screen (FR-032)
- ✅ Card shows brake icon (brake-warning-illustration.png) (FR-035)
- ✅ Card shows message: "Debes esperar unos minutos antes de realizar otro retiro con el mismo monto" (FR-033)
- ✅ Card has role="note" (FR-034)
- ✅ Card styling: light yellow background (#FEF3C7), yellow border (#FDE047)

**Visual Validation**:
- Card appears in footer area above submit button
- Icon is 32x32px
- Text is dark yellow (#78350F)

---

#### Scenario 4.2: Warning card visible on /withdraw/success screen

**Given**: I successfully submitted a withdrawal
**When**: I view the /withdraw/success screen
**Then**:
- ✅ Same warning card is visible at bottom (FR-032, FR-040)
- ✅ Consistent styling with /withdraw screen
- ✅ Card persists during entire success screen view

**Test Method**:
1. Complete withdrawal flow
2. Verify warning card appears on success screen
3. Compare visual appearance with /withdraw screen (should be identical)

---

#### Scenario 4.3: Cooldown enforcement error (429)

**Given**: I submitted a withdrawal less than 5 minutes ago
**When**: I attempt to submit another withdrawal with the same amount
**Then**:
- ✅ API returns 429 status with Problem Details
- ✅ Error displayed: "You must wait a few minutes before making another withdrawal with the same amount" (FR-038)
- ✅ Error has role="alert" (FR-039)
- ✅ Warning card remains visible (non-blocking informational content)
- ✅ Console error shows [WITHDRAWAL_FAILURE] with status 429

**Test Data** (MSW Mock):
```json
{
  "type": "https://api.example.com/errors/cooldown-active",
  "title": "Cooldown Active",
  "status": 429,
  "detail": "You must wait a few minutes before making another withdrawal with the same amount",
  "instance": "/withdrawals"
}
```

---

## Edge Cases

### Edge Case 1: Direct navigation to /withdraw/success without data

**Steps**:
1. Manually type `http://localhost:5173/withdraw/success` in browser address bar
2. Press Enter

**Expected**:
- ✅ Success screen briefly shows skeleton (< 100ms)
- ✅ Automatic redirect to /withdraw (FR-021)
- ✅ No error message shown to user
- ✅ Console warning: "[WITHDRAW_SUCCESS] No withdrawal data found, redirecting to /withdraw"

**Automated Test**: `WithdrawSuccessScreen.test.tsx` - "should redirect to /withdraw if no navigation state"

---

### Edge Case 2: Page refresh on /withdraw/success

**Steps**:
1. Complete withdrawal flow to reach /withdraw/success
2. Press F5 or Ctrl+R to refresh the page

**Expected**:
- ✅ Navigation state is lost (browser behavior)
- ✅ Redirect to /withdraw triggered (same as Edge Case 1)

---

### Edge Case 3: Browser back button on success screen

**Steps**:
1. Complete withdrawal flow to reach /withdraw/success
2. Click browser back button

**Expected**:
- ✅ Navigate back to /withdraw
- ✅ Selected account state is cleared (natural navigation behavior)
- ✅ User can select account again and retry

---

### Edge Case 4: Network failure during submission

**Steps**:
1. Open DevTools, go to Network tab
2. Set throttling to "Offline"
3. Click "Retirar fondos"

**Expected**:
- ✅ Request fails with network error
- ✅ Error message displayed: "Network error. Please check your connection."
- ✅ Button re-enabled for retry
- ✅ Console error shows [WITHDRAWAL_FAILURE] with network error

---

### Edge Case 5: Balance changes during submission

**Given**: My balance is $1,234.56 when I load /withdraw
**When**: My balance changes to $500 (external event) and I submit withdrawal for $1,234.56
**Then**:
- ✅ API returns 400 error: "Insufficient Balance"
- ✅ Error displayed: "The withdrawal amount exceeds your current balance"
- ✅ User can navigate back to /rewards to see updated balance

**Note**: Frontend does not detect balance changes. Backend validation catches this.

---

## Accessibility Testing

### Keyboard Navigation Test

**Steps**:
1. Navigate to /withdraw using only keyboard (Tab, Enter, Space)
2. Tab to "Selecciona una cuenta" button, press Enter
3. On /withdraw/accounts, tab through accounts, press Enter on one
4. Tab to "Retirar fondos" button, press Enter
5. On /withdraw/success, tab to "Regresar a Rewards", press Enter

**Expected**:
- ✅ All interactive elements keyboard accessible (FR-041)
- ✅ Visible focus indicators (2px outline, 3:1 contrast) (FR-042)
- ✅ Enter/Space activate buttons (FR-030, FR-031)

**Automated Test**: `accessibility.test.tsx` - "should support keyboard navigation"

---

### Screen Reader Test (Manual)

**Tools**: VoiceOver (macOS), NVDA (Windows), or JAWS

**Steps**:
1. Enable screen reader
2. Navigate to /withdraw
3. Click "Retirar fondos"
4. Listen for loading announcement ("Procesando...")
5. On success screen, listen for title announcement ("¡Tu retiro fue exitoso!")
6. Navigate through warning card (should announce role="note")

**Expected**:
- ✅ Loading states announced via aria-live="polite" (FR-044)
- ✅ Errors announced via aria-live="assertive" (FR-045)
- ✅ Success title focused on mount (FR-043)
- ✅ All images have alt text

---

### jest-axe Validation Test

**Automated Test**: `accessibility.test.tsx` - "should have no accessibility violations"

**Steps**:
1. Run test suite: `pnpm test accessibility.test.tsx`
2. Verify zero violations for:
   - WithdrawScreen (with selected account)
   - WithdrawSuccessScreen
   - WithdrawFooter component
   - WithdrawWarningCard component

**Expected**: All jest-axe tests pass with 0 violations

---

## Performance Testing

### Layout Shift Test (CLS = 0)

**Steps**:
1. Open DevTools, go to Performance tab
2. Start recording
3. Complete withdrawal flow from /withdraw to /withdraw/success
4. Stop recording
5. Check Cumulative Layout Shift (CLS) metric

**Expected**:
- ✅ CLS = 0 (SC-009)
- ✅ Skeleton placeholders match final content dimensions
- ✅ No elements jump or shift position during loading

---

### Visual Feedback Timing Test

**Steps**:
1. Open DevTools, go to Performance tab
2. Record button click interaction
3. Measure time from click to visual feedback (button disabled)

**Expected**:
- ✅ Visual feedback within 200ms (SC-003, SC-004)
- ✅ Button disable happens in 1 frame (< 16ms)

---

## Automated Test Coverage

### Unit Tests

**useWithdrawalSubmit.test.ts**:
- [ ] Should submit withdrawal successfully
- [ ] Should handle API errors
- [ ] Should prevent duplicate submissions
- [ ] Should clear errors on retry

**withdrawalsApi.test.ts**:
- [ ] Should send POST request with correct payload
- [ ] Should include x-user-id header
- [ ] Should parse Problem Details errors
- [ ] Should timeout after 5 seconds

---

### Component Tests

**WithdrawScreen.test.tsx** (extend existing):
- [x] Should display balance from rewards summary (existing)
- [x] Should disable button when no account selected (existing)
- [x] Should enable button when account selected (existing)
- [ ] Should submit withdrawal on button click (NEW)
- [ ] Should prevent duplicate submissions on rapid clicks (NEW)
- [ ] Should display error inline on failure (NEW)
- [ ] Should allow retry after error (NEW)
- [ ] Should navigate to success on 201 response (NEW)

**WithdrawSuccessScreen.test.tsx** (NEW):
- [ ] Should display success title and description
- [ ] Should show account last 4 digits
- [ ] Should redirect to /withdraw if no navigation state
- [ ] Should use SVG fallback if image fails
- [ ] Should navigate to /rewards on button click
- [ ] Should have no accessibility violations

**WithdrawFooter.test.tsx** (NEW):
- [ ] Should render children (button)
- [ ] Should always include warning card
- [ ] Should display error message if provided

---

### Integration Tests

**withdrawalFlow.test.tsx** (NEW):
- [ ] Should complete full flow: select account → submit → success → return
- [ ] Should handle 404 error and allow account reselection
- [ ] Should log success/failure to console
- [ ] Should refetch balance after returning to /rewards

---

## Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test WithdrawScreen.test.tsx

# Run tests in watch mode
pnpm test --watch

# Run with coverage
pnpm test:coverage

# Expected coverage: 85%+ (Constitution Principle IV)
```

---

## Manual Testing Checklist

Before marking feature complete:

- [ ] Happy path (select account → submit → success → return) works end-to-end
- [ ] Rapid clicking "Retirar fondos" only sends one request
- [ ] Button shows "Procesando..." during submission
- [ ] Success screen shows correct account digits
- [ ] Warning card visible on both /withdraw and /withdraw/success
- [ ] Error messages display inline above button
- [ ] Retry after error works without duplicates
- [ ] Direct navigation to /withdraw/success redirects to /withdraw
- [ ] Image fallback works if success-check.png missing
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Screen reader announces loading/error/success states
- [ ] jest-axe tests pass with 0 violations
- [ ] Console logs [WITHDRAWAL_SUCCESS] and [WITHDRAWAL_FAILURE]
- [ ] All 59 existing tests still pass (002-withdraw not broken)
- [ ] All new tests pass (target: 85%+ coverage)

---

## Troubleshooting

### Issue: "Cannot POST /withdrawals" error

**Cause**: Backend API not running or MSW handler not configured

**Solution**:
1. Check if MSW server is started in test setup
2. Verify handler in `tests/mocks/handlers/withdrawalHandlers.ts`
3. Ensure handler is added to `server.ts` handlers array

---

### Issue: Success screen shows "undefined" for account digits

**Cause**: `lastFourDigits` not included in navigation state

**Solution**:
```typescript
// In WithdrawScreen.tsx after successful API call
navigate('/withdraw/success', {
  state: {
    withdrawalData: {
      ...response,
      lastFourDigits: selectedAccount.lastFourDigits, // Add this line
    },
  },
});
```

---

### Issue: Duplicate submissions still occurring

**Cause**: Guard not working or isSubmitting not set immediately

**Solution**:
1. Ensure `if (isSubmitting) return;` is FIRST line of handleSubmit
2. Ensure `setIsSubmitting(true);` is BEFORE try block
3. Check that finally block sets `setIsSubmitting(false);`

---

## Next Steps

After completing manual and automated tests:

1. Run full test suite: `pnpm test`
2. Run linter: `pnpm lint`
3. Run build: `pnpm build`
4. Create verification report (similar to 002-withdraw/VERIFICATION.md)
5. Mark all tasks complete in tasks.md
6. Create pull request to merge 003-withdraw-submit → main

---

**End of Quickstart**
