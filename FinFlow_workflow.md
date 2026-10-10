# FinFlow Web Application
## Development Workflow + Tech Stack

## 1. Project Basis

FinFlow is an AI-powered personal finance web application based on the supplied project abstract and Figma design.

The core system must support:

- Secure income and expense tracking
- Daily transaction recording
- AI-based expense categorization
- Interactive financial dashboards and charts
- Spending-pattern analysis
- Monthly expense prediction
- Budget planning and budget-overrun alerts
- AI financial assistant with natural-language interaction
- Personalized saving and expense-reduction recommendations
- Financial goal tracking
- Secure, user-friendly financial management

The abstract specifically defines income/expense tracking, AI categorization, dashboards, ML-based monthly prediction, budget alerts, and an AI financial assistant as core capabilities.

---

# 2. Product Workflow

```text
USER
  |
  v
Landing / Splash
  |
  v
Onboarding
  |
  +----> Login
  |        |
  |        v
  |      Authentication
  |        |
  |        v
  +----> Sign Up
           |
           v
      Initial Finance Setup
           |
           v
      Main Dashboard
           |
   +-------+--------+---------+---------+---------+
   |                |         |         |         |
   v                v         v         v         v
Dashboard       Transactions Budget   Analytics  AI Assistant
   |                |         |         |         |
   |                |         |         |         |
   +----------------+---------+---------+---------+
                            |
                            v
                     Finance Data Layer
                            |
             +--------------+--------------+
             |              |              |
             v              v              v
       Transaction DB   ML Engine      AI Engine
             |              |              |
             |              v              v
             |       Expense Forecast   AI Advice
             |              |              |
             +--------------+--------------+
                            |
                            v
                    Goals / Recommendations
                            |
                            v
                     User Notifications
```

---

# 3. UI Implementation Workflow

## Phase 1: Figma Audit

Before writing application code:

- Inspect every Figma frame.
- Identify every screen and navigation path.
- Record exact frame dimensions.
- Extract exact colors from Figma.
- Extract exact font family and font weights.
- Record font sizes, line heights, spacing, corner radii and shadows.
- Identify reusable components.
- Identify icons and image assets.
- Identify mobile navigation structure.
- Preserve the existing FinFlow visual hierarchy.
- Do not redesign the UI during implementation.

### Figma fidelity rule

The Figma file is the visual source of truth.

The implementation must reproduce:

- Same color palette
- Same typography
- Same spacing
- Same card structure
- Same button shapes
- Same icon placement
- Same bottom navigation
- Same charts and dashboard hierarchy
- Same authentication flow
- Same visual treatment of AI features

If a design value cannot be reliably extracted from the `.fig` file, do not invent a replacement silently. Mark it as a design-token verification item.

---

# 4. Application Screen Workflow

## A. Entry Flow

1. Splash screen
2. Onboarding / introduction
3. Login
4. Sign up
5. Initial user setup
6. Dashboard

## B. Main Application

The Figma design is organized around a finance dashboard with bottom navigation and dedicated finance views.

Primary modules:

1. Dashboard
2. Transactions
3. Budget
4. Analytics
5. AI Assistant
6. Financial goals / savings
7. Profile / settings
8. Notifications

---

# 5. Dashboard Workflow

```text
Login
  |
  v
Dashboard
  |
  +--> Total Balance
  |
  +--> Income
  |
  +--> Expenses
  |
  +--> Recent Transactions
  |
  +--> Spending Summary
  |
  +--> Budget Status
  |
  +--> Financial Insights
  |
  +--> Add Transaction
  |
  +--> AI Assistant
```

Dashboard data must be calculated from the authenticated user's database records.

No hardcoded financial values in production.

---

# 6. Transaction Workflow

```text
Transactions
     |
     +--> View all transactions
     |
     +--> Filter by
     |      - Income
     |      - Expense
     |      - Category
     |      - Date
     |
     +--> Add transaction
     |       |
     |       +--> Amount
     |       +--> Type
     |       +--> Category
     |       +--> Description
     |       +--> Date
     |       +--> Payment method
     |
     +--> Edit transaction
     |
     +--> Delete transaction
     |
     +--> AI category prediction
```

When a user enters a transaction without selecting a category, the AI categorization service should predict a suitable category and allow the user to confirm or change it.

---

# 7. Budget Workflow

```text
Budget
  |
  +--> Create monthly budget
  |
  +--> Set category budgets
  |
  +--> Track spending
  |
  +--> Calculate remaining budget
  |
  +--> Detect budget threshold
  |
  +--> Generate alert
  |
  +--> Show recommendation
```

Budget calculations must use actual transaction data.

Recommended threshold levels:

- Normal
- Warning
- Near limit
- Exceeded

The threshold values should be configurable rather than hardcoded into UI components.

---

# 8. Analytics Workflow

```text
Transaction Data
      |
      v
Aggregation Service
      |
      +--> Daily spending
      +--> Weekly spending
      +--> Monthly spending
      +--> Category spending
      +--> Income vs expense
      +--> Savings trend
      |
      v
Analytics API
      |
      v
Interactive Charts
```

Charts should be generated from backend data using reusable chart components.

Suggested chart types:

- Income vs expense
- Monthly expense trend
- Category distribution
- Budget utilization
- Savings progress
- Forecast vs actual spending

---

# 9. Machine Learning Workflow

```text
Historical Transactions
        |
        v
Data Cleaning
        |
        v
Feature Engineering
        |
        v
ML Model
        |
        +--> Expense Forecast
        |
        +--> Spending Pattern Analysis
        |
        v
Prediction API
        |
        v
Frontend Dashboard
```

The first ML version should focus on monthly expense prediction.

Possible implementation:

- Python
- Pandas
- NumPy
- Scikit-learn

Model selection should be based on validation results rather than assuming a specific algorithm in advance.

The model must return:

- Predicted monthly expense
- Prediction period
- Confidence/error information where available
- Inputs used for the prediction

---

# 10. AI Expense Categorization Workflow

```text
Transaction Description
        |
        v
Preprocessing
        |
        v
Classification Model
        |
        v
Predicted Category
        |
        v
User Confirmation
        |
        v
Database
```

Example categories:

- Food
- Transport
- Shopping
- Bills
- Healthcare
- Education
- Entertainment
- Travel
- Other

Categories must remain configurable so the system can support future expansion.

---

# 11. AI Financial Assistant Workflow

```text
User Message
     |
     v
AI Assistant API
     |
     +--> Retrieve user's financial context
     |
     +--> Retrieve recent transactions
     |
     +--> Retrieve budget information
     |
     +--> Retrieve goals
     |
     v
LLM / AI Reasoning Layer
     |
     v
Personalized Response
     |
     +--> Saving recommendation
     +--> Expense reduction advice
     +--> Budget advice
     +--> Spending explanation
     +--> Goal guidance
```

The AI assistant must not receive another user's financial data.

The backend should build a restricted financial context for the authenticated user before sending relevant information to the AI model.

---

# 12. Financial Goals Workflow

```text
Create Goal
    |
    +--> Goal name
    +--> Target amount
    +--> Current amount
    +--> Target date
    |
    v
Goal Progress
    |
    +--> Calculate progress
    +--> Calculate remaining amount
    +--> Estimate required saving
    |
    v
Recommendations
```

---

# 13. Notification Workflow

```text
Finance Event
    |
    +--> Budget near limit
    |
    +--> Budget exceeded
    |
    +--> Forecast indicates high spending
    |
    +--> Goal milestone
    |
    v
Notification Service
    |
    v
In-app Notification
```

Email or push notifications can be added later without changing the core finance architecture.

---

# 14. Recommended Tech Stack

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Recharts
- Lucide React
- React Hook Form
- Zod
- TanStack Query

### Why

React provides component-based UI development.

TypeScript reduces frontend type errors.

Tailwind makes it easier to reproduce the Figma design using exact spacing, colors and responsive rules.

Recharts handles the finance dashboards and analytics visualizations.

TanStack Query handles API state, caching and synchronization.

---

## Backend

- Python
- FastAPI
- Pydantic
- SQLAlchemy
- Alembic

### Why

FastAPI provides a clean API layer for:

- Authentication integration
- Transactions
- Budgets
- Analytics
- ML predictions
- AI assistant
- Goals
- Notifications

Python also allows the ML and AI components to live in the same backend ecosystem.

---

## Database

Recommended:

- PostgreSQL

Optional managed implementation:

- Supabase PostgreSQL
- Supabase Auth

Core tables:

```text
users
profiles
transactions
categories
budgets
budget_categories
financial_goals
notifications
ai_conversations
ai_messages
ml_predictions
```

---

# 15. Authentication

Recommended:

- Supabase Auth or JWT-based authentication
- Email/password authentication
- Protected frontend routes
- Protected backend API endpoints
- Row-level access control at the database layer

Every financial record must be associated with a user ID.

---

# 16. AI / ML Stack

## Machine Learning

- Python
- Pandas
- NumPy
- Scikit-learn
- Joblib

## AI Assistant

Use an LLM API through a backend-only service.

Never expose an AI provider secret key in React or browser code.

AI service responsibilities:

- Financial-context preparation
- Prompt construction
- Response generation
- Basic response validation
- Conversation storage

---

# 17. API Structure

Suggested API groups:

```text
/api/auth
/api/users
/api/transactions
/api/categories
/api/budgets
/api/analytics
/api/goals
/api/notifications
/api/forecast
/api/ai
```

Example endpoints:

```text
GET    /api/transactions
POST   /api/transactions
PUT    /api/transactions/{id}
DELETE /api/transactions/{id}

GET    /api/analytics/summary
GET    /api/analytics/spending
GET    /api/analytics/categories

GET    /api/budgets
POST   /api/budgets
PUT    /api/budgets/{id}

GET    /api/goals
POST   /api/goals
PUT    /api/goals/{id}

POST   /api/forecast/monthly
POST   /api/ai/chat

GET    /api/notifications
PUT    /api/notifications/{id}/read
```

---

# 18. Project Architecture

```text
finflow/
|
+-- frontend/
|   +-- src/
|       +-- components/
|       +-- pages/
|       +-- layouts/
|       +-- hooks/
|       +-- services/
|       +-- api/
|       +-- types/
|       +-- utils/
|       +-- assets/
|       +-- styles/
|
+-- backend/
|   +-- app/
|       +-- api/
|       +-- models/
|       +-- schemas/
|       +-- services/
|       +-- repositories/
|       +-- ml/
|       +-- ai/
|       +-- core/
|       +-- utils/
|
+-- database/
|   +-- migrations/
|   +-- seed/
|
+-- docs/
|
+-- tests/
|
+-- docker-compose.yml
+-- README.md
```

---

# 19. Development Order

## Phase 1: Foundation

- [ ] Create repository
- [ ] Create React + Vite + TypeScript frontend
- [ ] Create FastAPI backend
- [ ] Configure PostgreSQL / Supabase
- [ ] Configure environment variables
- [ ] Configure Git
- [ ] Configure linting and formatting
- [ ] Create base project architecture

## Phase 2: Design System

- [ ] Extract exact Figma color tokens
- [ ] Extract exact Figma typography
- [ ] Extract font weights
- [ ] Extract spacing scale
- [ ] Extract border radii
- [ ] Extract shadows
- [ ] Create Tailwind design tokens
- [ ] Build buttons
- [ ] Build inputs
- [ ] Build cards
- [ ] Build navigation
- [ ] Build chart containers
- [ ] Build modal components
- [ ] Build notification components

## Phase 3: Authentication

- [ ] Splash screen
- [ ] Onboarding
- [ ] Login
- [ ] Registration
- [ ] Authentication state
- [ ] Protected routes
- [ ] Logout
- [ ] User profile

## Phase 4: Core Finance

- [ ] Dashboard
- [ ] Add transaction
- [ ] Edit transaction
- [ ] Delete transaction
- [ ] Transaction list
- [ ] Transaction filtering
- [ ] Categories
- [ ] Income tracking
- [ ] Expense tracking

## Phase 5: Budget

- [ ] Monthly budget
- [ ] Category budgets
- [ ] Budget progress
- [ ] Budget threshold detection
- [ ] Budget alerts

## Phase 6: Analytics

- [ ] Spending summary
- [ ] Category analytics
- [ ] Income vs expense
- [ ] Monthly trends
- [ ] Savings trends
- [ ] Interactive charts

## Phase 7: AI / ML

- [ ] Transaction categorization model
- [ ] ML preprocessing pipeline
- [ ] Monthly expense prediction
- [ ] Forecast API
- [ ] AI financial assistant
- [ ] Financial context retrieval
- [ ] AI conversation history
- [ ] Personalized recommendations

## Phase 8: Goals

- [ ] Create goal
- [ ] Edit goal
- [ ] Goal progress
- [ ] Savings calculation
- [ ] Goal recommendations

## Phase 9: Notifications

- [ ] Notification database
- [ ] In-app notifications
- [ ] Budget alerts
- [ ] Forecast alerts
- [ ] Goal milestones

## Phase 10: Testing

- [ ] Frontend unit tests
- [ ] Backend unit tests
- [ ] API tests
- [ ] Authentication tests
- [ ] Database access tests
- [ ] AI service tests
- [ ] ML prediction tests
- [ ] Responsive UI testing
- [ ] Figma-to-code visual comparison
- [ ] Security testing

## Phase 11: Deployment

- [ ] Production environment
- [ ] PostgreSQL/Supabase production database
- [ ] Backend deployment
- [ ] Frontend deployment
- [ ] Environment secrets
- [ ] Database migrations
- [ ] Logging
- [ ] Error monitoring
- [ ] Production smoke test

---

# 20. Definition of Done

The project is complete only when:

- [ ] Every Figma screen has a corresponding web screen.
- [ ] Navigation between all designed screens works.
- [ ] The exact Figma color palette is implemented.
- [ ] The exact Figma font family and weights are implemented.
- [ ] Responsive layouts work on desktop, tablet and mobile.
- [ ] Authentication works.
- [ ] Users can create, edit and delete transactions.
- [ ] Transactions are persisted in PostgreSQL.
- [ ] Dashboard values are calculated from real database data.
- [ ] Analytics are calculated from real transaction data.
- [ ] Budgets are persisted and tracked.
- [ ] Budget alerts work.
- [ ] AI transaction categorization works.
- [ ] Monthly expense prediction works.
- [ ] AI assistant works through a secure backend.
- [ ] AI assistant only accesses the authenticated user's finance context.
- [ ] Financial goals work.
- [ ] Notifications work.
- [ ] No secret API keys exist in frontend code.
- [ ] API authentication and authorization are enforced.
- [ ] Database migrations are reproducible.
- [ ] Core frontend and backend tests pass.
- [ ] Production build succeeds.
- [ ] Final UI is visually compared against the Figma design.

---

# 21. Antigravity Implementation Rule

Use this document as the implementation sequence.

Do not build the complete application in one uncontrolled generation.

Build in this order:

```text
Design Tokens
      ↓
Reusable Components
      ↓
Authentication
      ↓
Dashboard
      ↓
Transactions
      ↓
Budget
      ↓
Analytics
      ↓
Goals
      ↓
AI / ML
      ↓
Notifications
      ↓
Testing
      ↓
Deployment
```

The Figma design takes priority over generic UI conventions.

Do not replace the FinFlow visual language with a default Tailwind, Material UI or Bootstrap appearance.

Do not introduce new colors or fonts unless required for accessibility or explicitly specified during implementation.

Do not hardcode financial data.

Use realistic seed data only for development/demo mode.

All production financial information must come from the authenticated user's database records.
