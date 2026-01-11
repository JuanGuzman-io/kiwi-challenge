# Accessibility Testing Checklist - Rewards Feature

## Overview
Manual accessibility testing checklist for the Rewards Overview (Rewards Home) feature.
Ensures WCAG 2.1 AA compliance per Constitution Principle IV and FR-042 through FR-045.

**Testing Date**: [To be filled]
**Tester**: [To be filled]
**Browser/Environment**: [To be filled]
**Screen Reader**: [To be filled if applicable]

---

## T116: Keyboard Navigation (FR-042)

### Test: Tab through all interactive elements in order

**Expected behavior**: User can navigate through all interactive elements using Tab key, with logical tab order.

#### Test Steps:
1. Load `/rewards` page in browser
2. Press Tab key repeatedly
3. Verify tab order follows this sequence:
   - [ ] "Retirar" button (BalanceSummaryCard)
   - [ ] "Cargar más" button (if transactions list has hasMore=true)
   - [ ] "Intentar de nuevo" button (if error state is visible)

#### Results:
- [ ] **PASS**: All interactive elements receive focus in logical order
- [ ] **FAIL**: Tab order is incorrect or elements cannot receive focus

**Notes**:
```
[Add any observations here]
```

---

### Test: Shift+Tab for reverse navigation

**Expected behavior**: User can navigate backwards using Shift+Tab.

#### Test Steps:
1. Tab to the last interactive element
2. Press Shift+Tab repeatedly
3. Verify focus moves backwards through elements

#### Results:
- [ ] **PASS**: Reverse navigation works correctly
- [ ] **FAIL**: Reverse navigation is broken

**Notes**:
```
[Add any observations here]
```

---

## T117: Enter/Space Activation (FR-043)

### Test: "Retirar" button activates with Enter/Space

**Expected behavior**: Pressing Enter or Space on focused "Retirar" button navigates to `/withdraw`.

#### Test Steps:
1. Load `/rewards` page with non-zero balance
2. Tab to "Retirar" button
3. Press Enter key
4. Verify navigation to `/withdraw` occurred
5. Go back to `/rewards`
6. Tab to "Retirar" button again
7. Press Space key
8. Verify navigation to `/withdraw` occurred

#### Results:
- [ ] **PASS (Enter)**: Button activates with Enter key
- [ ] **PASS (Space)**: Button activates with Space key
- [ ] **FAIL**: Button does not activate with keyboard

**Notes**:
```
[Add any observations here]
```

---

### Test: "Cargar más" button activates with Enter/Space

**Expected behavior**: Pressing Enter or Space on focused "Cargar más" button loads more transactions.

#### Test Steps:
1. Load `/rewards` page with paginated transactions (hasMore=true)
2. Tab to "Cargar más" button
3. Press Enter key
4. Verify more transactions load below existing ones
5. Wait for page to fully reload
6. Tab to "Cargar más" button again
7. Press Space key
8. Verify more transactions load

#### Results:
- [ ] **PASS (Enter)**: Button activates with Enter key
- [ ] **PASS (Space)**: Button activates with Space key
- [ ] **FAIL**: Button does not activate with keyboard

**Notes**:
```
[Add any observations here]
```

---

### Test: "Intentar de nuevo" (Retry) button activates with Enter/Space

**Expected behavior**: Pressing Enter or Space on focused retry button retries the failed API call.

#### Test Steps:
1. Trigger error state (disconnect network or use mock error response)
2. Tab to "Intentar de nuevo" button
3. Press Enter key
4. Verify API call is retried and error state clears (or remains if still failing)
5. Trigger error state again
6. Tab to "Intentar de nuevo" button
7. Press Space key
8. Verify API call is retried

#### Results:
- [ ] **PASS (Enter)**: Button activates with Enter key
- [ ] **PASS (Space)**: Button activates with Space key
- [ ] **FAIL**: Button does not activate with keyboard

**Notes**:
```
[Add any observations here]
```

---

## T118: aria-label Attributes (FR-044)

### Test: All interactive elements have descriptive aria-label

**Expected behavior**: All buttons have meaningful aria-label attributes for screen reader users.

#### Elements to Verify:

**BalanceSummaryCard - "Retirar" button**
- [ ] Has `aria-label="Retirar fondos"`
- [ ] aria-label is descriptive and in Spanish

**LoadMoreButton - "Cargar más" button**
- [ ] Has `aria-label="Cargar más transacciones"` when not loading
- [ ] Has `aria-label="Cargando más transacciones"` when loading
- [ ] Has `aria-busy="true"` when loading

**ErrorState - "Intentar de nuevo" button**
- [ ] Has `aria-label="Intentar de nuevo"`
- [ ] aria-label is descriptive and in Spanish

**LoadingState components**
- [ ] Balance loading has `role="status"` and `aria-label="Cargando balance"`
- [ ] Transactions loading has `role="status"` and `aria-label="Cargando transacciones"`
- [ ] Pagination loading has `role="status"` and `aria-label="Cargando más transacciones"`

**ErrorState component**
- [ ] Has `role="alert"` and `aria-live="assertive"`

#### Results:
- [ ] **PASS**: All interactive elements have proper aria-label attributes
- [ ] **FAIL**: One or more elements missing aria-label

**Notes**:
```
[Add any observations here]
```

---

## T119: Visible Focus States (FR-045)

### Test: Focus indicators are clearly visible

**Expected behavior**: When an element has focus, there is a clear visual indicator (outline or ring).

#### Elements to Test:

**"Retirar" button**
- [ ] Has visible focus ring/outline when focused
- [ ] Focus style has sufficient contrast (3:1 minimum)
- [ ] Focus indicator is at least 2px thick

**"Cargar más" button**
- [ ] Has visible focus ring/outline when focused
- [ ] Focus style has sufficient contrast (3:1 minimum)
- [ ] Focus indicator is at least 2px thick

**"Intentar de nuevo" button (in error state)**
- [ ] Has visible focus ring/outline when focused
- [ ] Focus style has sufficient contrast (3:1 minimum)
- [ ] Focus indicator is at least 2px thick

#### CSS Verification:
Check that CSS includes:
```css
*:focus-visible {
  outline: 2px solid var(--rewards-accent);
  outline-offset: 2px;
}
```

#### Results:
- [ ] **PASS**: All focused elements have clearly visible focus indicators
- [ ] **FAIL**: Focus indicators are missing or insufficient

**Notes**:
```
[Add any observations here]
```

---

## T120: Screen Reader Announcements (FR-029, FR-036)

### Test: Loading states announce correctly

**Expected behavior**: Screen reader announces loading states with `role="status"`.

#### Test Steps (with screen reader enabled):
1. Load `/rewards` page
2. Verify screen reader announces "Cargando balance" (loading state)
3. Wait for data to load
4. Verify screen reader does NOT repeatedly announce (no aria-live spam)
5. Click "Cargar más" button
6. Verify screen reader announces "Cargando más transacciones"

#### Screen Readers to Test:
- [ ] **VoiceOver (macOS/iOS)**: [PASS/FAIL]
- [ ] **NVDA (Windows)**: [PASS/FAIL]
- [ ] **JAWS (Windows)**: [PASS/FAIL]
- [ ] **TalkBack (Android)**: [PASS/FAIL]

**Notes**:
```
[Add any observations here]
```

---

### Test: Error states announce correctly

**Expected behavior**: Screen reader announces error messages with `role="alert"` and `aria-live="assertive"`.

#### Test Steps (with screen reader enabled):
1. Trigger error state (disconnect network or use mock error response)
2. Verify screen reader immediately announces error message
3. Verify error message is in Spanish
4. Verify error message is user-friendly (not technical)

#### Expected Error Messages:
- Balance load failure: "No pudimos cargar tu balance. Por favor, intenta de nuevo."
- Transactions load failure: "No pudimos cargar tus transacciones. Por favor, intenta de nuevo."

#### Screen Readers to Test:
- [ ] **VoiceOver (macOS/iOS)**: [PASS/FAIL]
- [ ] **NVDA (Windows)**: [PASS/FAIL]
- [ ] **JAWS (Windows)**: [PASS/FAIL]
- [ ] **TalkBack (Android)**: [PASS/FAIL]

**Notes**:
```
[Add any observations here]
```

---

## T121: jest-axe Automated Testing

### Test: No accessibility violations detected by jest-axe

**Expected behavior**: All automated accessibility tests pass with zero violations.

#### Test Steps:
```bash
cd client
pnpm test -- BalanceSummaryCard.test.tsx TransactionList.test.tsx
```

#### Components with jest-axe Tests:
- [ ] **BalanceSummaryCard**: No violations (T053)
- [ ] **TransactionList**: No violations (T081)

#### Results:
- [ ] **PASS**: All jest-axe tests pass with 0 violations
- [ ] **FAIL**: One or more violations detected

**Notes**:
```
[Add any violations or notes here]
```

---

## Additional WCAG 2.1 AA Checks

### Color Contrast

**Test**: Verify sufficient color contrast for all text.

#### Text Elements to Check:
- [ ] "Rewards" header text: Contrast ratio ≥ 4.5:1
- [ ] "Monto acumulado" label: Contrast ratio ≥ 4.5:1
- [ ] Balance amount: Contrast ratio ≥ 3:1 (large text)
- [ ] "Retirar" button text: Contrast ratio ≥ 4.5:1
- [ ] Transaction type/description: Contrast ratio ≥ 4.5:1
- [ ] Incoming amount (+): Contrast ratio ≥ 4.5:1
- [ ] Outgoing amount (-): Contrast ratio ≥ 4.5:1
- [ ] Month headers: Contrast ratio ≥ 4.5:1
- [ ] Error messages: Contrast ratio ≥ 4.5:1

**Tool**: Use WebAIM Contrast Checker (https://webaim.org/resources/contrastchecker/)

#### Results:
- [ ] **PASS**: All text meets minimum contrast requirements
- [ ] **FAIL**: One or more elements have insufficient contrast

**Notes**:
```
[Add any observations here]
```

---

### Resize Text

**Test**: Verify page is usable when text is resized to 200%.

#### Test Steps:
1. Open `/rewards` page
2. Zoom browser to 200% (Cmd/Ctrl + "+")
3. Verify all content is still readable
4. Verify no horizontal scrolling required
5. Verify interactive elements are still accessible

#### Results:
- [ ] **PASS**: Page is fully usable at 200% zoom
- [ ] **FAIL**: Content is cut off or unusable at 200% zoom

**Notes**:
```
[Add any observations here]
```

---

### Reflow (Mobile Responsiveness)

**Test**: Verify page adapts to 320px viewport width.

#### Test Steps:
1. Open Developer Tools
2. Set viewport to 320px width (iPhone SE size)
3. Verify content does not overflow
4. Verify no horizontal scrolling
5. Verify all interactive elements are still clickable

#### Results:
- [ ] **PASS**: Page adapts correctly to 320px viewport
- [ ] **FAIL**: Content overflows or requires horizontal scrolling

**Notes**:
```
[Add any observations here]
```

---

## Summary

### Overall Results

**Total Tests**: [Count]
**Passed**: [Count]
**Failed**: [Count]
**Compliance Level**: [WCAG 2.1 AA / Non-compliant]

### Critical Issues Found
```
[List any critical accessibility issues that must be fixed]
```

### Recommendations
```
[List any recommendations for improvement]
```

### Sign-off

**Tester Signature**: ____________________
**Date**: ____________________
**Status**: [APPROVED / NEEDS WORK]
