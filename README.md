# 🚀 Startup CRM Lite

A lightweight, modern CRM designed specifically for early-stage startups to track, qualify, and convert sales leads — without the complexity of enterprise tools.

## ✨ Features

- **Dashboard** — At-a-glance KPI metrics, pipeline value overview, recent prospects table, and quick action shortcuts
- **Lead Management** — Full CRUD operations with table and card views, status-based filtering, and debounced search
- **Analytics** — Sales conversion funnel, lead channel acquisition performance, and revenue pipeline trend chart
- **Dark / Light Mode** — System preference-aware with persistent localStorage toggle
- **Persistent State** — All leads persist to `localStorage` across page refreshes
- **Responsive Design** — Mobile-first layout with adaptive sidebar and stacked card views on small screens

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM v7 |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| State | React Context API + localStorage |

## 📁 Project Structure

```
src/
├── components/
│   ├── analytics/          # Analytics-specific UI components
│   │   ├── KPICard.jsx
│   │   ├── ConversionFunnel.jsx
│   │   ├── LeadChannelChart.jsx
│   │   └── RevenueTrendChart.jsx
│   ├── common/             # Shared layout and utility components
│   │   ├── Layout.jsx
│   │   ├── Sidebar.jsx
│   │   ├── SearchBar.jsx
│   │   ├── FilterBar.jsx
│   │   └── EmptyState.jsx
│   ├── dashboard/          # Dashboard-specific widgets
│   │   ├── StatsCard.jsx
│   │   ├── PipelineOverview.jsx
│   │   ├── RecentLeads.jsx
│   │   └── QuickActions.jsx
│   └── leads/              # Lead management components
│       ├── LeadCard.jsx
│       ├── LeadForm.jsx
│       ├── LeadTable.jsx
│       └── StatusBadge.jsx
├── context/
│   ├── LeadContext.jsx     # Global lead state management
│   └── ThemeContext.jsx    # Dark/light mode state management
├── data/
│   └── constants.js        # Static config: statuses, sources, color maps
├── hooks/
│   └── useLocalStorage.js  # Reusable localStorage sync hook
├── pages/
│   ├── Dashboard.jsx
│   ├── Leads.jsx
│   ├── Analytics.jsx
│   └── NotFound.jsx
├── routes/
│   └── index.jsx           # Lazy-loaded route configuration
└── utils/
    └── helpers.js          # Shared formatting and utility functions
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:5173`.

## 🎨 Design System

The app uses CSS custom properties for theming, exposed via Tailwind CSS's `@theme` directive:

| Token | Light | Dark |
|---|---|---|
| `--primary` | `#2563EB` | `#3B82F6` |
| `--success` | `#22C55E` | `#10B981` |
| `--warning` | `#F59E0B` | `#FBBF24` |
| `--danger` | `#EF4444` | `#F87171` |
| `--bg-canvas` | `#F8FAFC` | `#090A0F` |
| `--bg-card` | `#FFFFFF` | `#121824` |

## 📝 Lead Data Model

```js
{
  id: string,          // UUID
  name: string,        // Contact full name
  company: string,     // Company name
  email: string,       // Email address
  phone?: string,      // Phone number (optional)
  status: string,      // Pipeline status
  source: string,      // Acquisition channel
  value?: string,      // Deal value, e.g. "$8,500" (optional)
  createdAt: string,   // ISO 8601 timestamp
  dateAdded: string,   // YYYY-MM-DD (legacy compat)
}
```

**Status options:** `New` · `Contacted` · `Meeting Scheduled` · `Proposal Sent` · `Won` · `Lost`

**Source options:** `Website` · `Referral` · `LinkedIn` · `Cold Call` · `Email Campaign` · `Other`
