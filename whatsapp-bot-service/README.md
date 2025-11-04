# WhatsApp Bot Service

This service monitors task updates in the Supabase database and sends WhatsApp notifications to the team group.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Copy `.env` file and update with your credentials:
   ```bash
   # Supabase Configuration
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # WhatsApp Group Configuration  
   GROUP_ID=your_whatsapp_group_id_here

   # Polling Configuration (in minutes)
   POLLING_INTERVAL=5
   ```

3. **First Time Setup**
   
   Run the bot for the first time:
   ```bash
   npm start
   ```
   
   - Scan the QR code with your WhatsApp
   - The bot will create an `auth_info_baileys` folder to store session data
   - Once connected, add the bot to your team group
   - Get the group ID and update the `.env` file

## Getting Group ID

1. Send a message in your target group
2. Check the console logs - the bot will log received messages with their chat IDs
3. Copy the group ID and update `GROUP_ID` in `.env`
4. Restart the bot

## How It Works

- **Polling**: Checks database every 5 minutes for task updates
- **New Task**: Sends message when task is added: "Ilan added task: Fix login bug"
- **Completed Task**: Sends message when task is completed: "Midlaj completed task: Update database schema"
- **Auto Reconnect**: Automatically reconnects if connection is lost

## Deployment

For production deployment on Render:

1. Create a new Web Service
2. Connect your repository
3. Set environment variables in Render dashboard
4. Deploy

## Troubleshooting

- **QR Code Issues**: Delete `auth_info_baileys` folder and restart
- **Group Messages Not Working**: Verify GROUP_ID is correct
- **Database Connection Issues**: Check Supabase credentials
- **Polling Not Working**: Check cron job logs in console
