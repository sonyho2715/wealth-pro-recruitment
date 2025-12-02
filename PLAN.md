# Dashboard Enhancement Plan

## Overview
Expand the Agent Dashboard into a comprehensive back office system with:
1. **Agent/Team Tracking** - Hierarchy, activities, performance
2. **Living Balance Sheet** - Full financial snapshot per prospect
3. **Back Office Tools** - Commissions, documents, reports, email templates

---

## Database Schema Updates

### New Models

```prisma
// Team hierarchy for agents
model AgentTeam {
  id           String   @id @default(cuid())
  agentId      String
  agent        Agent    @relation("AgentProfile", fields: [agentId], references: [id])
  uplineId     String?
  upline       Agent?   @relation("Upline", fields: [uplineId], references: [id])
  downlines    Agent[]  @relation("Upline")
  level        Int      @default(1)  // 1=direct, 2=second gen, etc.
  createdAt    DateTime @default(now())
}

// Activity tracking
model Activity {
  id           String       @id @default(cuid())
  agentId      String
  agent        Agent        @relation(fields: [agentId], references: [id])
  prospectId   String?
  prospect     Prospect?    @relation(fields: [prospectId], references: [id])
  type         ActivityType
  title        String
  description  String?
  scheduledAt  DateTime?
  completedAt  DateTime?
  outcome      String?
  createdAt    DateTime     @default(now())
}

enum ActivityType {
  CALL
  MEETING
  EMAIL
  FOLLOW_UP
  PRESENTATION
  APPLICATION
  OTHER
}

// Commission tracking
model Commission {
  id           String          @id @default(cuid())
  agentId      String
  agent        Agent           @relation(fields: [agentId], references: [id])
  prospectId   String?
  prospect     Prospect?       @relation(fields: [prospectId], references: [id])
  productType  String          // Life, Disability, etc.
  policyNumber String?
  amount       Decimal         @db.Decimal(12, 2)
  status       CommissionStatus
  earnedDate   DateTime?
  paidDate     DateTime?
  notes        String?
  createdAt    DateTime        @default(now())
}

enum CommissionStatus {
  PENDING
  APPROVED
  PAID
  CHARGEBACK
}

// Document storage
model Document {
  id           String       @id @default(cuid())
  agentId      String
  agent        Agent        @relation(fields: [agentId], references: [id])
  prospectId   String?
  prospect     Prospect?    @relation(fields: [prospectId], references: [id])
  name         String
  type         DocumentType
  url          String       // File path or URL
  uploadedAt   DateTime     @default(now())
}

enum DocumentType {
  APPLICATION
  POLICY
  ID_DOCUMENT
  FINANCIAL_STATEMENT
  OTHER
}

// Email templates
model EmailTemplate {
  id           String   @id @default(cuid())
  name         String
  subject      String
  body         String   @db.Text
  category     String   // follow_up, appointment, thank_you, etc.
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Agent Model Updates
Add these relations to existing Agent model:
- `team`, `downlines`, `activities`, `commissions`, `documents`
- Add: `role` (AGENT, MANAGER, ADMIN), `recruitedBy`, `licenseDate`, `monthlyGoal`

---

## New Pages/Routes

### 1. Dashboard Sidebar Navigation
Convert single-page dashboard to multi-section layout:

```
/agent/dashboard          - Overview (current stats + recent activity)
/agent/dashboard/prospects - Prospect management (enhanced current)
/agent/dashboard/balance-sheet/[id] - Living Balance Sheet viewer
/agent/dashboard/team     - Team hierarchy & performance
/agent/dashboard/activities - Activity log & scheduling
/agent/dashboard/commissions - Commission tracking
/agent/dashboard/documents - Document management
/agent/dashboard/reports  - Analytics & reports
/agent/dashboard/emails   - Email templates & send
/agent/dashboard/settings - Agent profile & preferences
```

### 2. Living Balance Sheet Page
Full-page financial snapshot for each prospect:

**Components:**
- Net Worth Chart (assets vs liabilities donut)
- Asset breakdown (savings, investments, 401k, home equity)
- Liability breakdown (mortgage, car, student, credit cards)
- Cash flow analysis (income vs expenses bar chart)
- Protection gap visualization (coverage vs need)
- Insurance recommendations cards
- Retirement timeline projection (line chart)
- Action buttons: Generate PDF, Send to Client, Update Profile

### 3. Team Management Page
**Features:**
- Visual org chart of downline hierarchy
- Team member cards with stats (production, recruits, status)
- Add new team member form
- Performance comparison table
- Filter by level, status, date range

### 4. Activity Center
**Features:**
- Calendar view of scheduled activities
- Activity feed/timeline
- Quick-add activity modal
- Filter by type, prospect, date
- Task completion tracking
- Upcoming reminders

### 5. Commission Tracker
**Features:**
- Commission summary cards (pending, approved, paid, YTD)
- Commission table with filters
- Add new commission entry
- Status workflow (pending -> approved -> paid)
- Export to CSV
- Monthly/quarterly breakdown charts

### 6. Document Center
**Features:**
- Grid/list view of documents
- Upload modal with drag-drop
- Organize by prospect or category
- Preview documents
- Download/share options

### 7. Reports & Analytics
**Dashboards:**
- Production dashboard (premiums written, policies sold)
- Pipeline dashboard (prospects by stage)
- Team performance (if manager)
- Goal tracking vs actuals
- Export options

### 8. Email Templates
**Features:**
- Pre-written templates for common scenarios:
  - Initial contact
  - Follow-up after meeting
  - Insurance quote follow-up
  - Career opportunity intro
  - Thank you after sale
  - Policy delivery
  - Annual review reminder
- Template editor with merge fields
- Send email directly or copy to clipboard
- Track email history per prospect

---

## Implementation Order

### Phase 1: Foundation (Core Structure)
1. Update Prisma schema with new models
2. Create dashboard layout with sidebar navigation
3. Refactor current dashboard page into new structure

### Phase 2: Living Balance Sheet
4. Build balance sheet detail page
5. Add charts (Chart.js - already installed)
6. PDF generation (jsPDF - already installed)

### Phase 3: Activity & Team
7. Activity model and CRUD
8. Activity calendar/timeline UI
9. Team hierarchy model and UI

### Phase 4: Back Office
10. Commission tracking
11. Document management (basic - local file refs)
12. Email templates with send functionality

### Phase 5: Reports
13. Analytics dashboard
14. Report generation
15. Export functionality

---

## UI Components Needed

- Sidebar navigation component
- Dashboard layout wrapper
- Chart components (already have chart.js)
- Calendar component (basic)
- Modal component (for forms)
- File upload component
- Rich text editor (for email templates)
- Data tables with sorting/filtering

---

## Files to Create/Modify

### New Files:
- `app/agent/dashboard/layout.tsx` - Dashboard layout with sidebar
- `app/agent/dashboard/DashboardSidebar.tsx` - Navigation sidebar
- `app/agent/dashboard/prospects/page.tsx` - Prospects list
- `app/agent/dashboard/balance-sheet/[id]/page.tsx` - Balance sheet viewer
- `app/agent/dashboard/team/page.tsx` - Team management
- `app/agent/dashboard/activities/page.tsx` - Activity center
- `app/agent/dashboard/commissions/page.tsx` - Commission tracker
- `app/agent/dashboard/documents/page.tsx` - Document center
- `app/agent/dashboard/reports/page.tsx` - Reports
- `app/agent/dashboard/emails/page.tsx` - Email templates
- `app/agent/dashboard/emails/templates.ts` - Pre-written templates
- `components/charts/` - Chart components
- `lib/email-templates.ts` - Default email templates
- Server actions for each feature

### Modify:
- `prisma/schema.prisma` - Add new models
- `app/agent/dashboard/page.tsx` - Convert to overview
- `prisma/seed.ts` - Add sample email templates

---

## Estimated Scope
- ~15-20 new files
- ~3000-4000 lines of code
- Full-featured financial advisor back office
