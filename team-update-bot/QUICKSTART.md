# Quick Start Guide

Follow these steps to get your Team Update Bot running locally for testing.

## 1. Set Up Database

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Wait for the project to be ready

2. **Create Database Schema**
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the contents of `supabase-schema.sql`
   - Click "Run" to create the tasks table

3. **Get API Credentials**
   - Go to Settings → API in your Supabase project
   - Copy your "Project URL" and "anon public" key

## 2. Configure Environment Variables

1. **Update `.env.local`** in the main project:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **Update `.env`** in whatsapp-bot-service:
   ```bash
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   GROUP_ID=leave-empty-for-now
   POLLING_INTERVAL=5
   ```

## 3. Test the Web Application

1. **Start the web app:**
   ```bash
   npm run dev
   ```

2. **Open browser** and go to http://localhost:3000

3. **Test functionality:**
   - Visit home page - should show empty project dashboard
   - Click on "Ilan" - should open member page
   - Add a test task - should appear in the list
   - Mark task as completed - should update with completion status
   - Check other member pages work similarly

## 4. Test the WhatsApp Bot (Optional for initial testing)

1. **Start the bot service:**
   ```bash
   cd ../whatsapp-bot-service
   npm start
   ```

2. **Connect WhatsApp:**
   - Scan QR code with WhatsApp
   - Wait for "WhatsApp Bot connected successfully!" message

3. **Get Group ID:**
   - Add bot to your test WhatsApp group
   - Send a message in the group
   - Check console logs for the group ID
   - Update GROUP_ID in .env file
   - Restart the bot

4. **Test notifications:**
   - Add a task through the web interface
   - Wait up to 5 minutes for WhatsApp notification
   - Complete a task and verify notification

## Quick Demo

Once everything is running, try this quick demo:

1. **Home Page** - View overall project status
2. **Add Task** - Go to `/ilan` and add "Review project requirements"  
3. **Complete Task** - Check the checkbox to mark it complete
4. **Check Progress** - Return to home page to see updated statistics
5. **Weekly Targets** - View weekly progress on member pages

## Common Issues & Solutions

**"Cannot connect to Supabase"**
- Verify your environment variables are correct
- Check that Supabase project is active
- Ensure no typos in URLs/keys

**"Member page not found"**
- Make sure you're using lowercase member names in URLs
- Valid URLs: `/ilan`, `/midlaj`, `/hysam`, `/alan`

**"Tasks not appearing"**
- Check browser console for JavaScript errors
- Verify database connection in Network tab
- Ensure tasks table exists in Supabase

**WhatsApp bot issues**
- Make sure you're scanning QR with the correct phone
- Check that phone has good internet connection
- Verify GROUP_ID format (should end with @g.us)

## Next Steps

Once local testing works:

1. **Push to GitHub** - Commit and push your code
2. **Deploy to Render** - Follow DEPLOYMENT.md guide
3. **Configure Production** - Set up production environment variables
4. **Team Onboarding** - Share the deployed web app URL with your team

## Support

If you encounter issues:
1. Check all environment variables are set correctly
2. Verify Supabase database schema was created
3. Look at browser console and terminal logs for errors
4. Review the troubleshooting sections in README files
