# Kiwi Challenge

A technical challenge to build a **Rewards/Cashback application** using [GitHub Spec-Kit](https://github.com/github/spec-kit).

## What's Already Configured

The project constitution has been set up at `.specify/memory/constitution.md` with the following core principles:

1. **React-First Frontend** - React is required for the frontend
2. **API-Driven Backend** - RESTful API with proper validations
3. **Flexible Persistence** - Choose your database (PostgreSQL, SQLite, MongoDB, or JSON)
4. **Pragmatic Testing** - Tests are required but not strict TDD
5. **SOLID & Clean Code** - Follow SOLID principles and clean code practices

## The Challenge

Build a Rewards application based on the Figma design that allows users to:
- View their accumulated rewards balance
- See transaction history (cashback, referral bonuses, withdrawals)
- Withdraw funds to a linked bank account

### Resources

- [Full Challenge Instructions (Notion)](https://eslavadev.notion.site/Test-Kiwi-2c3156058be680b0964cebac1f3cf865)
- [Figma Design](https://www.figma.com/design/A2GHMXbAIUTtmW9b7kQH7V/Prueba-T%C3%A9cnica?node-id=0-1&p=f&t=MYhwBI3i0D9vVyrk-0)

## What You Need to Do

Follow the Spec-Kit workflow to plan and implement the application:

### 1. Create the Specification
```bash
/speckit.specify
```
Describe the feature based on the Figma design. The tool will help you create a detailed specification.

### 2. Clarify Requirements (Optional)
```bash
/speckit.clarify
```
If there are ambiguities, use this to refine the specification.

### 3. Create the Implementation Plan
```bash
/speckit.plan
```
Design the technical approach, data models, and API contracts.

### 4. Generate Tasks
```bash
/speckit.tasks
```
Break down the plan into actionable, dependency-ordered tasks.

### 5. Implement
```bash
/speckit.implement
```
Execute the tasks to build the application.

### 6. Analyze (Optional)
```bash
/speckit.analyze
```
Validate consistency across all artifacts.

## Technology Stack

### Required
- **Frontend**: React (v17+)

### Your Choice
- **Backend**: Node.js/Express, Python/FastAPI, Go, or any other
- **Database**: PostgreSQL, SQLite, MongoDB, or JSON file storage
- **State Management**: React Context, Redux, Zustand, or useState
- **Styling**: CSS Modules, Tailwind, Styled Components, or plain CSS

## Evaluation Criteria

- Fidelity to the Figma design
- Code quality (cleanliness, patterns, cohesion, modularity)
- Correct use of Spec-Kit for both frontend and backend
- Completeness of the functional flow
- Project structure and folder organization
- UX details (feedback, loaders, micro-interactions)
- SOLID principles and clean code practices
- Test coverage for critical functionality

## Deliverables

1. Public repository (or private with access granted) containing:
   - Frontend code
   - Backend code
   - All Spec-Kit artifacts (spec.md, plan.md, tasks.md)

2. Updated README with:
   - Brief explanation of your technical approach
   - Architectural decisions
   - Setup and run instructions
   - Any assumptions made

## Getting Started

```bash
# Clone the repository
git clone <your-fork-url>
cd kiwi-challenge

# Start working with Spec-Kit
# Run /speckit.specify to begin
```

## Estimated Time

1-3 hours recommended, but quality over speed is preferred.

---

Good luck!
