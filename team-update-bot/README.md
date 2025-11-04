# Team Update Bot

A comprehensive task management system with WhatsApp notifications for team collaboration. Built with Next.js, Supabase, and Baileys.

## Features

- **Project Dashboard**: Overview of all team tasks with progress tracking
- **Individual Member Pages**: Personal task management with today's tasks and weekly targets
- **Real-time Updates**: Automatic database updates and task synchronization
- **WhatsApp Notifications**: Automated messages for task additions and completions
- **Weekly Progress Tracking**: Visual progress indicators and completion statistics

## Team Members

The system supports 4 team members:
- Ilan
- Midlaj
- Hysam  
- Alan

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **WhatsApp Integration**: Baileys
- **Deployment**: Render

## Project Structure

```
team-update-bot/           # Main Next.js application
├── app/                   # App router pages
│   ├── [member]/         # Dynamic member pages
│   ├── layout.tsx        # Root layout with navigation
│   └── page.tsx          # Home dashboard
├── components/           # Reusable UI components
│   ├── ui/              # Shadcn components
│   ├── Navigation.tsx   # Main navigation
│   ├── TaskItem.tsx     # Individual task component
│   ├── AddTaskForm.tsx  # Task creation form
│   └── WeeklyTargets.tsx # Weekly progress widget
├── lib/                 # Utilities and configuration
│   ├── supabase.ts      # Database client and types
│   ├── constants.ts     # Team member constants
│   └── utils.ts         # Helper functions
└── supabase-schema.sql  # Database schema

whatsapp-bot-service/      # Separate WhatsApp bot service
├── index.js              # Main bot service
├── package.json         # Node.js dependencies
├── .env                 # Environment configuration
└── README.md            # Bot setup instructions
```

## Setup Instructions

### 1. Database Setup (Supabase)

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL from `supabase-schema.sql` to create the tasks table
4. Copy your project URL and anon key from Settings > API

### 2. Next.js Application

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Update `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

### 3. WhatsApp Bot Service

See detailed instructions in `../whatsapp-bot-service/README.md`

## Deployment

### Next.js App on Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### WhatsApp Bot Service on Render

1. Create a separate Web Service for the bot
2. Set root directory: `whatsapp-bot-service`
3. Set start command: `npm start`
4. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`  
   - `GROUP_ID`
   - `POLLING_INTERVAL`

## Usage

### Adding Tasks
1. Navigate to any member's page (e.g., `/ilan`)
2. Use the "Add New Task" form at the top
3. Task will automatically be assigned to that member
4. WhatsApp notification will be sent within 5 minutes

### Completing Tasks
1. Check the checkbox next to any task
2. Task will be marked as completed in the database
3. WhatsApp notification will confirm completion

### Monitoring Progress
- **Home page**: View overall project status and team breakdown
- **Member pages**: See individual progress and weekly targets
- **WhatsApp**: Receive real-time notifications for all task changes

## API Routes

The application includes built-in API routes for task operations:
- Database operations are handled directly through Supabase client
- No additional API routes needed for basic functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting sections in README files
2. Verify environment variables are set correctly
3. Ensure Supabase database schema is properly created
4. Confirm WhatsApp bot is connected and has correct group permissions
