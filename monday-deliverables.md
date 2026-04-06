# Monday Deliverables — IS 401 (6.5 pts)

> **Organization Name: Haven Light Philippines**
> Copy each section below into the corresponding area of your [FigJam board](https://www.figma.com/board/8pD0922ice8zpZLfGuZNlc/2026W-INTEX-Figma-template).

---

## 1. Roles

| Role            | Name         |
| --------------- | ------------ |
| Scrum Master    | *(fill in)*  |
| Product Owner   | *(fill in)*  |
| Developer       | *(fill in)*  |
| Developer       | *(fill in)*  |

---

## 2. Customer Personas

### Persona 1 — Maria Santos, Safehouse Program Director (Admin / Staff User)

| Attribute           | Detail |
| ------------------- | ------ |
| **Age**             | 38 |
| **Location**        | Quezon City, Metro Manila, Philippines |
| **Role**            | Oversees day-to-day operations across 3 safehouses; supervises 6 social workers |
| **Tech comfort**    | Moderate — uses spreadsheets, email, and basic apps on her phone |
| **Goals**           | Know at a glance which girls are progressing and which are struggling; keep counseling and visitation documentation up to date; ensure no resident falls through the cracks during reintegration |
| **Frustrations**    | Currently tracks cases across disconnected Excel files shared via email; has no early-warning system for at-risk residents; spends hours compiling reports for case conferences and annual accomplishment summaries |
| **Quote**           | *"I lose sleep wondering if I missed something in a girl's file that could have prevented a crisis."* |

**Why she matters:** Maria represents the core operational user. If the system doesn't make her daily case management faster and more reliable, the organization's primary mission fails.

### Persona 2 — David Chen, Recurring International Donor

| Attribute           | Detail |
| ------------------- | ------ |
| **Age**             | 45 |
| **Location**        | San Francisco, CA, USA |
| **Role**            | Monthly monetary donor ($50/month); discovered the org through a Facebook campaign |
| **Tech comfort**    | High — software engineer, expects modern web experiences |
| **Goals**           | See exactly how his donations are being used; read anonymized stories of girls whose lives are improving; feel confident the organization is well-run and transparent |
| **Frustrations**    | Receives generic "thank you" emails with no specifics; can't see any impact data; has considered redirecting his donations to an org with better reporting |
| **Quote**           | *"I want to know my money is actually changing a girl's life — not just disappearing into overhead."* |

**Why he matters:** David represents the donor retention crisis. The organization depends entirely on donations. If donors like David lapse because they don't feel connected, the organization cannot operate.

---

## 3. Journey Map — Maria Santos (Staff User, Current State)

```
STAGE          │ INTAKE & REFERRAL        │ CASE ASSESSMENT          │ DAILY OPERATIONS              │ COUNSELING & VISITATION        │ REINTEGRATION PLANNING
───────────────┼──────────────────────────┼──────────────────────────┼───────────────────────────────┼────────────────────────────────┼──────────────────────────
ACTIONS        │ Receives referral via    │ Conducts initial         │ Manually updates Excel        │ Social workers write session   │ Prepares case study for
               │ phone/email from govt    │ assessment; assigns      │ spreadsheet with daily notes; │ notes on paper or Word docs;   │ case conference; tracks
               │ agency, NGO, or police   │ risk level; creates      │ checks on multiple safehouses │ schedules home visits via      │ progress toward family
               │                          │ case file in folder      │ via phone calls               │ text messages                  │ reunification or placement
───────────────┼──────────────────────────┼──────────────────────────┼───────────────────────────────┼────────────────────────────────┼──────────────────────────
TOUCHPOINTS    │ Phone, email, paper form │ Paper intake form,       │ Excel, phone calls, WhatsApp  │ Word docs, paper forms,        │ Paper case study, in-person
               │                          │ Excel spreadsheet        │ messages to social workers    │ in-person meetings             │ case conference meeting
───────────────┼──────────────────────────┼──────────────────────────┼───────────────────────────────┼────────────────────────────────┼──────────────────────────
PAIN POINTS    │ No standard intake       │ Risk assessments are     │ No centralized view — must    │ Session notes are scattered    │ No way to track progress
               │ system; referral info    │ subjective with no       │ open multiple files to see    │ across files; impossible to    │ against intervention goals;
               │ gets lost or duplicated  │ consistent criteria      │ who needs attention today     │ see a girl's full counseling   │ can't measure if
               │                          │                          │                               │ history at a glance            │ interventions are working
───────────────┼──────────────────────────┼──────────────────────────┼───────────────────────────────┼────────────────────────────────┼──────────────────────────
EMOTIONS       │ Anxious — worried about  │ Overwhelmed — too many   │ Stressed — constantly afraid  │ Frustrated — documentation     │ Uncertain — no data to
               │ missing critical info    │ fields, no guidance      │ something will slip through   │ feels like busywork, not       │ support decisions about
               │                          │                          │ the cracks                    │ insight                        │ readiness
───────────────┼──────────────────────────┼──────────────────────────┼───────────────────────────────┼────────────────────────────────┼──────────────────────────
OPPORTUNITIES  │ Digital intake form with │ Standardized risk        │ Admin dashboard showing all   │ Structured process recording   │ Intervention plan tracker
               │ required fields and      │ scoring integrated into  │ residents, risk levels, and   │ system with chronological      │ with measurable goals;
               │ auto-assignment          │ the system               │ alerts for flagged cases      │ history per resident           │ ML-powered readiness score
```

---

## 4. Problem Statement

> Safehouse staff managing multiple locations lack a centralized system to track resident cases, counseling progress, and donor contributions — leading to **girls falling through the cracks**, **donors lapsing without re-engagement**, and **social media efforts with no measurable ROI**. Haven Light Philippines needs a secure, role-based web application that unifies case management, donor tracking, and impact reporting into one platform.

---

## 5. MoSCoW Table

### Must Have (M)

| # | Requirement | Source |
|---|-------------|--------|
| M1 | Home / landing page with mission statement and calls to action | IS 413 |
| M2 | Login page with username/password authentication (ASP.NET Identity) | IS 413, IS 414 |
| M3 | Role-based access control — Admin and Donor roles | IS 414 |
| M4 | Admin dashboard with key operational metrics | IS 413 |
| M5 | Caseload inventory page — residents CRUD with filtering by status, safehouse, category, risk level | IS 413 |
| M6 | Process recording page — counseling session notes CRUD with chronological history | IS 413 |
| M7 | Donors & contributions management page — supporter profiles, donation tracking | IS 413 |
| M8 | Privacy policy page (GDPR-compliant) linked from footer | IS 414 |
| M9 | GDPR cookie consent notification (functional) | IS 414 |
| M10 | HTTPS/TLS for all connections | IS 414 |
| M11 | HTTP to HTTPS redirect | IS 414 |
| M12 | Content-Security-Policy (CSP) HTTP header | IS 414 |
| M13 | At least 1 complete ML pipeline deployed and integrated | IS 455 |
| M14 | Cloud deployment (publicly accessible) | IS 414 |
| M15 | Database seeded with provided CSV data | IS 413 |
| M16 | Stronger-than-default password requirements | IS 414 |
| M17 | API endpoints require authentication/authorization where appropriate | IS 414 |
| M18 | Delete confirmation dialogs (data integrity) | IS 414 |
| M19 | Credentials stored securely (not in public repo) | IS 414 |

### Should Have (S)

| # | Requirement | Source |
|---|-------------|--------|
| S1 | Impact / donor-facing public dashboard with anonymized outcome data | IS 413 |
| S2 | Home visitation & case conference tracking page | IS 413 |
| S3 | Reports & analytics page (donation trends, resident outcomes, safehouse comparisons) | IS 413 |
| S4 | Donation allocation tracking across safehouses and program areas | IS 413 |
| S5 | 2nd ML pipeline (different business problem) | IS 455 |
| S6 | Responsive design — every page works on desktop and mobile | IS 401 |
| S7 | Lighthouse accessibility score >= 90% on every page | IS 401 |
| S8 | Only admin can CUD; donors see their own history and impact | IS 414 |

### Could Have (C)

| # | Requirement | Source |
|---|-------------|--------|
| C1 | Social media analytics page | IS 413 |
| C2 | 3rd ML pipeline | IS 455 |
| C3 | Third-party authentication (e.g., Google OAuth) | IS 414 |
| C4 | Multi-factor / two-factor authentication | IS 414 |
| C5 | HSTS (HTTP Strict Transport Security) | IS 414 |
| C6 | Browser-accessible cookie for user preference (dark/light mode) | IS 414 |
| C7 | Docker container deployment | IS 414 |
| C8 | Data sanitization / encoding for injection prevention | IS 414 |

### Won't Have (W)

| # | Requirement | Justification |
|---|-------------|---------------|
| W1 | Real-time chat/messaging between staff | Adds WebSocket complexity with limited ROI — staff already use WhatsApp and Slack for communication. Time is better spent on core case management features. |

### 5 Nice-to-Have Ideas (Team-Generated)

1. **Automated risk-change alerts** — email/notification when a resident's risk level escalates
2. **Donor recognition wall** — public page highlighting top donors (with opt-in consent)
3. **Social media posting optimizer** — recommend best times and content types based on engagement data
4. **Resident journey timeline** — visual timeline showing a girl's full path from intake through reintegration
5. **PDF report export** — generate annual accomplishment reports matching the Philippine DSWD format

---

## 6. Product Backlog

**Product Goal:** *"Deliver a secure, cloud-deployed web application that enables Haven Light Philippines staff to manage resident cases and donor relationships, while giving donors visibility into their impact."*

| Priority | Card | Story Points |
|----------|------|:------------:|
| 1 | Set up .NET 10 API + React/Vite project scaffold | 5 |
| 2 | Design and seed PostgreSQL database from CSVs | 5 |
| 3 | Build authentication system (ASP.NET Identity + login page) | 8 |
| 4 | Implement role-based access control (Admin, Donor) | 5 |
| 5 | Build admin dashboard with key metrics (active residents, donations, incidents) | 5 |
| 6 | Build caseload inventory page (residents CRUD + search/filter) | 8 |
| 7 | Build process recording page (counseling sessions CRUD + history) | 5 |
| 8 | Build donors & contributions management page | 5 |
| 9 | Build public landing page (hero, mission, CTAs) | 3 |
| 10 | Build impact / donor-facing public dashboard | 5 |
| 11 | Implement privacy policy page + GDPR cookie consent | 3 |
| 12 | Set up HTTPS, CSP header, HTTP→HTTPS redirect | 3 |
| 13 | Build home visitation & case conference tracking page | 5 |
| 14 | Build reports & analytics page | 5 |
| 15 | Train and deploy ML pipeline #1 — donor churn/lapsing prediction | 8 |
| 16 | Train and deploy ML pipeline #2 — resident reintegration readiness | 8 |
| 17 | Deploy to Azure (App Service + Supabase database) | 5 |
| 18 | Achieve Lighthouse accessibility >= 90% on all pages | 3 |

---

## 7. Sprint Monday Backlog

**Sprint Goal:** *"Establish the full development foundation — project scaffold, database schema, seeded data, and authentication — so the team can build features starting Tuesday."*

| Card | Story Points | Assignee |
|------|:------------:|----------|
| Initialize .NET 10 Web API project with EF Core + Npgsql | 3 | Person A |
| Initialize React/Vite/TypeScript frontend with React Router | 3 | Person B |
| Design PostgreSQL schema + write EF Core entity models & migrations | 5 | Person C |
| Write CSV seed script to populate database | 3 | Person C |
| Set up Supabase project + configure connection string | 2 | Person A |
| Implement ASP.NET Identity (register + login endpoints) | 5 | Person A |
| Build login page UI in React | 3 | Person B |
| Set up GitHub repo + branch strategy + basic CI | 2 | Person D |
| Build landing page layout (header, hero section, footer) | 3 | Person D |
| Begin ML data exploration + pipeline #1 notebook | 3 | Person D |

**Total: 32 story points**

> **Screenshot reminder:** Take a screenshot of this sprint backlog before starting work.

---

## 8. Burndown Chart Setup

- **Total story points for the week:** ~96 (estimated across all backlog items)
- **Monday starting points:** 32
- **Tracking cadence:** Update at end of each day (Mon, Tue, Wed, Thu)
- **Chart format:** X-axis = Day (Mon–Thu), Y-axis = Remaining story points
- **Ideal burndown line:** 96 → 72 → 48 → 24 → 0

| Day | Planned Remaining | Actual Remaining |
|-----|:-----------------:|:----------------:|
| Mon Start | 96 | 96 |
| Mon End | 64 | *(update)* |
| Tue End | 40 | *(update)* |
| Wed End | 20 | *(update)* |
| Thu End | 0 | *(update)* |

---

## 9. Wireframe Descriptions (3 Most Important Screens — Desktop)

### Screen 1: Admin Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] Haven Light Philippines          [Bell] [User Avatar ▼] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Active   │  │ Donations│  │ Upcoming │  │ Incidents│        │
│  │ Residents│  │ This Mo. │  │ Case Conf│  │ This Mo. │        │
│  │   47     │  │ ₱85,200  │  │    3     │  │    2     │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                 │
│  ┌────────────────────────┐  ┌────────────────────────┐         │
│  │  Residents by Risk     │  │  Recent Activity       │         │
│  │  ████ Critical: 5      │  │  • New intake: LS-0061 │         │
│  │  ████ High: 12         │  │  • Session logged: SW3 │         │
│  │  ████ Medium: 18       │  │  • Donation: ₱5,000    │         │
│  │  ████ Low: 12          │  │  • Visit completed     │         │
│  └────────────────────────┘  └────────────────────────┘         │
│                                                                 │
│  [Footer: © Haven Light Philippines | Privacy Policy]           │
└─────────────────────────────────────────────────────────────────┘
```

### Screen 2: Caseload Inventory

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] Haven Light Philippines          [Bell] [User Avatar ▼] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Caseload Inventory                              [+ Add New]    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🔍 Search by name, case #, or code...                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Filters: [Status ▼] [Safehouse ▼] [Category ▼] [Risk ▼]       │
│                                                                 │
│  ┌────────┬────────┬───────────┬────────┬───────┬──────┬──────┐ │
│  │ Case # │ Code   │ Safehouse │ Status │ Risk  │ Adm. │ SW   │ │
│  ├────────┼────────┼───────────┼────────┼───────┼──────┼──────┤ │
│  │ C0043  │ LS-001 │ SH-01     │ Active │ High  │ Oct  │ SW-15│ │
│  │ C0044  │ LS-002 │ SH-02     │ Active │ Med   │ Nov  │ SW-03│ │
│  │ C0045  │ LS-003 │ SH-01     │ Closed │ Low   │ Sep  │ SW-07│ │
│  │ ...    │ ...    │ ...       │ ...    │ ...   │ ...  │ ...  │ │
│  └────────┴────────┴───────────┴────────┴───────┴──────┴──────┘ │
│                                                                 │
│  [◀ Prev]  Page 1 of 4  [Next ▶]                               │
│                                                                 │
│  [Footer: © Haven Light Philippines | Privacy Policy]           │
└─────────────────────────────────────────────────────────────────┘
```

### Screen 3: Public Impact Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] Haven Light Philippines       [About] [Impact] [Login]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           Your Generosity in Action                     │    │
│  │                                                         │    │
│  │     60 Girls Served  │  9 Safehouses  │  60 Supporters  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ Education       │ │ Health          │ │ Donation Impact │   │
│  │ Progress        │ │ Outcomes        │ │                 │   │
│  │                 │ │                 │ │                 │   │
│  │ [Bar chart:     │ │ [Line chart:    │ │ [Pie chart:     │   │
│  │  avg progress   │ │  avg health     │ │  allocation by  │   │
│  │  by safehouse]  │ │  score trend]   │ │  program area]  │   │
│  │                 │ │                 │ │                 │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Latest Impact Snapshot                                 │    │
│  │  "In March 2026, Haven Light served 47 active           │    │
│  │   residents across 9 safehouses..."                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  [Footer: © Haven Light Philippines | Privacy Policy]           │
└─────────────────────────────────────────────────────────────────┘
```

> **Wireframe note:** Recreate these as proper wireframes in Figma using rectangle and text tools. Focus on layout and information hierarchy, not visual polish.
