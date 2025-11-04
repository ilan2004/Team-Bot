# Team Update Bot - Nudge iOS Development

A comprehensive task management system designed specifically for the Nudge iOS team, focused on achieving the **Dec 4, 2024 TestFlight deadline**.

## 🎯 Project Overview

This system tracks team productivity and progress for a 4-member team working on the Nudge iOS app:

- **Ilan** - Development (iOS App Development & Backend)
- **Midlaj** - Animation (UI Animations & Interactions)  
- **Hysam** - Design (UI/UX Design & Assets)
- **Alan** - Research (R&D & Technical Research)

## 🚀 Key Features

### Dec 4 TestFlight Milestones
- Real-time countdown to TestFlight deadline
- Progress tracking for 7 critical deliverables:
  - 2 Character Idle & Focused Animation
  - Onboarding UI
  - Screen Time API Integration
  - Frontend Development
  - MBTI Questions Implementation
  - Personality Type Cognitive Powers
  - Visual Assets

### Team Management
- **Individual Member Pages**: Personalized dashboards for each team member
- **Task Management**: Create, assign, and track tasks with priorities and deadlines
- **Status Tracking**: Real-time availability status (Available, On Leave, Exams, Busy, Sick)
- **Daily Check-ins**: Morning planning and evening progress reports
- **Mood Tracking**: Team wellness monitoring (1-5 scale)

### Progress Analytics
- Visual progress bars and completion statistics
- Weekly targets and progress tracking
- Blocker identification and management
- Real-time dashboard updates

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern UI component library
- **Zustand** - State management with persistence
- **date-fns** - Date manipulation
- **Lucide React** - Icon library

## 📁 Project Structure

```
src/
├── app/
│   ├── dashboard/          # Main dashboard pages
│   │   ├── page.tsx       # Homepage with countdown & overview
│   │   ├── ilan/          # Ilan's personal page
│   │   ├── midlaj/        # Midlaj's personal page
│   │   ├── hysam/         # Hysam's personal page
│   │   └── alan/          # Alan's personal page
│   └── layout.tsx         # Root layout
├── components/
│   ├── team/              # Team management components
│   │   ├── team-dashboard.tsx
│   │   ├── member-page.tsx
│   │   ├── task-form.tsx
│   │   ├── task-list.tsx
│   │   ├── check-in-dialog.tsx
│   │   ├── status-update-dialog.tsx
│   │   ├── test-flight-milestones.tsx
│   │   └── team-status-grid.tsx
│   ├── layout/            # Layout components
│   └── ui/                # Base UI components
├── store/
│   └── team-store.ts      # Zustand state management
├── types/
│   └── index.ts           # TypeScript type definitions
└── lib/                   # Utility functions
```

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Homepage Dashboard (`/dashboard`)
- View countdown to Dec 4 TestFlight deadline
- Monitor overall team progress and milestone completion
- Quick overview of team member availability and mood

### Individual Member Pages (`/dashboard/{member}`)
- Personal task management and creation
- Daily check-in/check-out system
- Status updates and availability management
- Weekly progress tracking

### Task Management
- Create tasks with priority levels, types, and deadlines
- Assign to team members and track progress
- Update status: To Do → In Progress → Completed
- Handle blockers and dependencies

### TestFlight Milestones
- Track progress on 7 critical Dec 4 deliverables
- Visual progress bars with completion percentages
- Quick progress updates (25%, 50%, 75%, 100%)

## 🔄 Future Enhancements

- WhatsApp notification integration
- Advanced analytics and reporting
- Time tracking with detailed logs
- Sprint planning and retrospectives
- Mobile app companion

## 📞 Support

For questions or issues, contact the development team or create an issue in the project repository.

---

**Built with ❤️ for the Nudge iOS team**

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/9113740/201498864-2a900c64-d88f-4ed4-b5cf-770bcb57e1f5.png">
  <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/9113740/201498152-b171abb8-9225-487a-821c-6ff49ee48579.png">
</picture>

<div align="center"><strong>Next.js Admin Dashboard Starter Template With Shadcn-ui</strong></div>
<div align="center">Built with the Next.js 15 App Router</div>
<br />
<div align="center">
<a href="https://dub.sh/shadcn-dashboard">View Demo</a>
<span>
</div>

## Overview

This is a starter template using the following stack:

- Framework - [Next.js 15](https://nextjs.org/13)
- Language - [TypeScript](https://www.typescriptlang.org)
- Auth - [Clerk](https://go.clerk.com/ILdYhn7)
- Error tracking - [<picture><img alt="Sentry" src="public/assets/sentry.svg">
        </picture>](https://sentry.io/for/nextjs/?utm_source=github&utm_medium=paid-community&utm_campaign=general-fy26q2-nextjs&utm_content=github-banner-project-tryfree)
- Styling - [Tailwind CSS v4](https://tailwindcss.com)
- Components - [Shadcn-ui](https://ui.shadcn.com)
- Schema Validations - [Zod](https://zod.dev)
- State Management - [Zustand](https://zustand-demo.pmnd.rs)
- Search params state manager - [Nuqs](https://nuqs.47ng.com/)
- Tables - [Tanstack Data Tables](https://ui.shadcn.com/docs/components/data-table) • [Dice table](https://www.diceui.com/docs/components/data-table)
- Forms - [React Hook Form](https://ui.shadcn.com/docs/components/form)
- Command+k interface - [kbar](https://kbar.vercel.app/)
- Linting - [ESLint](https://eslint.org)
- Pre-commit Hooks - [Husky](https://typicode.github.io/husky/)
- Formatting - [Prettier](https://prettier.io)

_If you are looking for a Tanstack start dashboard template, here is the [repo](https://git.new/tanstack-start-dashboard)._

## Pages

| Pages                                                                                 | Specifications                                                                                                                                                                                                                                                          |
| :------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Signup / Signin](https://go.clerk.com/ILdYhn7)      | Authentication with **Clerk** provides secure authentication and user management with multiple sign-in options including passwordless authentication, social logins, and enterprise SSO - all designed to enhance security while delivering a seamless user experience. |
| [Dashboard (Overview)](https://shadcn-dashboard.kiranism.dev/dashboard)    | Cards with Recharts graphs for analytics. Parallel routes in the overview sections feature independent loading, error handling, and isolated component rendering. |
| [Product](https://shadcn-dashboard.kiranism.dev/dashboard/product)         | Tanstack tables with server side searching, filter, pagination by Nuqs which is a Type-safe search params state manager in nextjs                                                                                                                                       |
| [Product/new](https://shadcn-dashboard.kiranism.dev/dashboard/product/new) | A Product Form with shadcn form (react-hook-form + zod).                                                                                                                                                                                                                |
| [Profile](https://shadcn-dashboard.kiranism.dev/dashboard/profile)         | Clerk's full-featured account management UI that allows users to manage their profile and security settings                                                                                                                                                             |
| [Kanban Board](https://shadcn-dashboard.kiranism.dev/dashboard/kanban)     | A Drag n Drop task management board with dnd-kit and zustand to persist state locally.                                                                                                                                                                                  |
| [Not Found](https://shadcn-dashboard.kiranism.dev/dashboard/notfound)      | Not Found Page Added in the root level                                                                                                                                                                                                                                  |
| [Global Error](https://sentry.io/for/nextjs/?utm_source=github&utm_medium=paid-community&utm_campaign=general-fy26q2-nextjs&utm_content=github-banner-project-tryfree)           | A centralized error page that captures and displays errors across the application. Integrated with **Sentry** to log errors, provide detailed reports, and enable replay functionality for better debugging. |

## Feature based organization

```plaintext
src/
├── app/ # Next.js App Router directory
│ ├── (auth)/ # Auth route group
│ │ ├── (signin)/
│ ├── (dashboard)/ # Dashboard route group
│ │ ├── layout.tsx
│ │ ├── loading.tsx
│ │ └── page.tsx
│ └── api/ # API routes
│
├── components/ # Shared components
│ ├── ui/ # UI components (buttons, inputs, etc.)
│ └── layout/ # Layout components (header, sidebar, etc.)
│
├── features/ # Feature-based modules
│ ├── feature/
│ │ ├── components/ # Feature-specific components
│ │ ├── actions/ # Server actions
│ │ ├── schemas/ # Form validation schemas
│ │ └── utils/ # Feature-specific utilities
│ │
├── lib/ # Core utilities and configurations
│ ├── auth/ # Auth configuration
│ ├── db/ # Database utilities
│ └── utils/ # Shared utilities
│
├── hooks/ # Custom hooks
│ └── use-debounce.ts
│
├── stores/ # Zustand stores
│ └── dashboard-store.ts
│
└── types/ # TypeScript types
└── index.ts
```

## Getting Started

> [!NOTE]  
> We are using **Next 15** with **React 19**, follow these steps:

Clone the repo:

```
git clone https://github.com/Kiranism/next-shadcn-dashboard-starter.git
```

- `pnpm install` ( we have legacy-peer-deps=true added in the .npmrc)
- Create a `.env.local` file by copying the example environment file:
  `cp env.example.txt .env.local`
- Add the required environment variables to the `.env.local` file.
- `pnpm run dev`

##### Environment Configuration Setup

To configure the environment for this project, refer to the `env.example.txt` file. This file contains the necessary environment variables required for authentication and error tracking.

You should now be able to access the application at http://localhost:3000.

> [!WARNING]
> After cloning or forking the repository, be cautious when pulling or syncing with the latest changes, as this may result in breaking conflicts.

Cheers! 🥂
