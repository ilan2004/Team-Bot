# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a comprehensive team management system for **Nudge iOS App Development** consisting of:
- **`team-update-bot/`**: Next.js 14 web application for task/goal management, team coordination, and daily check-ins
- **`whatsapp-bot-service/`**: Node.js WhatsApp notification service for real-time team updates

**Team Structure:**
- **Ilan**: Development (iOS App Development & Backend)
- **Midlaj**: Animation (UI Animations & Interactions) 
- **Hysam**: Design (UI/UX Design & Assets)
- **Alan**: Research (R&D & Technical Research)

Both services connect to a Supabase PostgreSQL database with comprehensive schema for team management.

## Common Commands

### Next.js Web Application (team-update-bot/)
```bash
# Development
npm run dev          # Start development server with webpack
npm run build        # Build for production with webpack  
npm start           # Start production server
npm run lint        # Run ESLint

# Navigate to member pages: http://localhost:3000/ilan, /midlaj, /hysam, /alan
```

### WhatsApp Bot Service (whatsapp-bot-service/)
```bash
# Development & Production
npm start           # Start WhatsApp bot service
npm run dev         # Same as start (alias)

# The bot will generate QR code on first run for WhatsApp authentication
```

### Environment Setup
- **Web app**: Configure `.env.local` with Supabase credentials
- **Bot service**: Configure `.env` with Supabase credentials and WhatsApp GROUP_ID

## Architecture

### Database Schema (Supabase)
**Core Tables:**
- **`tasks`**: Enhanced with task types, priorities, estimated hours, blocking relationships, and goal links
- **`member_profiles`**: Role definitions, display names, and avatar colors for team members
- **`goals`**: Project milestones, weekly goals, and feature goals with dependencies and deadlines
- **`availability`**: Team member availability tracking (leave, exams, busy status) with date ranges
- **`daily_logs`**: Check-in/check-out system with task summaries and mood tracking

**Database Views:**
- **`todays_team_status`**: Real-time team status combining availability and daily check-ins
- **`current_availability`**: Current team availability overview

### Key Components
**Core System:**
- **`lib/supabase.ts`**: Comprehensive database client with full TypeScript types
- **`lib/constants.ts`**: Role-based team definitions, task types, priorities, and status configurations
- **`components/TaskItem.tsx`**: Enhanced task component with priority, type, and blocking indicators
- **`components/AddTaskForm.tsx`**: Advanced task creation with type, priority, and goal assignment

**Team Management:**
- **`components/TeamStatusCard.tsx`**: Individual team member status with check-in/out functionality
- **`components/AvailabilityManager.tsx`**: Leave/exam scheduling and status management
- **`components/GoalsManager.tsx`**: Goal creation, tracking, and milestone management

**Navigation & Views:**
- **Dynamic routing**: `app/[member]/page.tsx` with role-specific views and sidebar management
- **Home dashboard**: Comprehensive team overview with status cards and goal tracking

### WhatsApp Integration
- **Real-time notifications**: Check-in/out messages with task summaries
- **Task notifications**: New task assignments and completion updates
- **Daily summaries**: Automated end-of-day progress reports
- **Polling system**: 5-minute intervals with intelligent message filtering
- **Session management**: Persistent WhatsApp Web connection with auto-reconnection

## Development Workflow

### Local Development
1. Set up Supabase project and run `supabase-schema.sql`
2. Configure environment variables in both services
3. Start web app: `npm run dev` (runs on :3000)
4. Optionally start WhatsApp bot for notifications
5. Test with team member URLs: `/ilan`, `/midlaj`, `/hysam`, `/alan`

### Testing
- No specific test framework configured
- Manual testing through web interface and WhatsApp notifications
- Verify database operations through Supabase dashboard

### Deployment
- Uses `render.yaml` for automated Render deployment
- Web app and bot service deployed as separate services
- Environment variables managed through Render dashboard
- WhatsApp bot requires initial QR code scan and GROUP_ID configuration

## Key Patterns

### Team Member Handling
- **Consistent naming**: All member names are lowercase in code (`ilan`, `midlaj`, `hysam`, `alan`)
- **Role-based design**: Each member has specific role, description, and themed colors
- **Dynamic routing**: URL structure `/[member]` with role-specific icons and content
- **Status integration**: Real-time availability and check-in status across all views

### Enhanced Task Management
- **Typed tasks**: Feature, bug, research, review, asset, animation categories
- **Priority system**: Critical, high, medium, low with visual indicators
- **Goal integration**: Tasks can be linked to project goals and milestones
- **Time tracking**: Estimated vs actual hours for project planning
- **Dependency tracking**: Tasks can be blocked by other work

### Goal & Milestone System
- **Hierarchical goals**: Weekly, monthly, milestone, and feature-based goals
- **Due date tracking**: Visual indicators for overdue, due today, and upcoming
- **Status workflow**: Not started → In progress → Completed/On hold
- **Cross-member visibility**: Team goals visible to all members
- **Dependency management**: Goals can depend on completion of other goals

### Daily Workflow Management
- **Check-in system**: Daily sign-in with planned tasks and mood tracking
- **Check-out system**: End-of-day summary with completed tasks and tomorrow's priority
- **Availability tracking**: Leave, exam, busy, sick status with date ranges
- **WhatsApp integration**: Automated notifications for all workflow events

### State Management Patterns
- **Optimistic updates**: Immediate UI updates with database sync
- **Comprehensive fetching**: Single queries pull related data (tasks + availability + status)
- **Error handling**: Graceful degradation when services are unavailable
- **Real-time sync**: Polling-based updates every 5 minutes for team coordination
