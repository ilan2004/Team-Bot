# Deployment Guide

This guide explains how to deploy the Team Update Bot system to Render.

## Prerequisites

1. **GitHub Repository**: Push your code to a GitHub repository
2. **Supabase Project**: Set up and configured with the database schema
3. **Render Account**: Sign up at [render.com](https://render.com)

## Step 1: Deploy Next.js Application

### 1.1 Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select the repository containing your team-update-bot

### 1.2 Configure Service Settings

- **Name**: `team-update-bot-web`
- **Environment**: `Node`
- **Region**: Choose closest to your team
- **Branch**: `main` (or your preferred branch)
- **Root Directory**: `team-update-bot`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 1.3 Add Environment Variables

In the Environment section, add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 1.4 Deploy

Click "Create Web Service" and wait for deployment to complete.

## Step 2: Deploy WhatsApp Bot Service

### 2.1 Create Second Web Service

1. Click "New" → "Web Service" again
2. Connect the same GitHub repository
3. Select the repository

### 2.2 Configure Bot Service Settings

- **Name**: `team-update-bot-whatsapp`
- **Environment**: `Node`
- **Region**: Same as web app
- **Branch**: `main`
- **Root Directory**: `whatsapp-bot-service`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 2.3 Add Environment Variables

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
GROUP_ID=leave-empty-initially
POLLING_INTERVAL=5
```

### 2.4 Deploy Bot Service

Click "Create Web Service" and wait for deployment.

## Step 3: Configure WhatsApp Bot

### 3.1 Initial Setup

1. Go to your bot service logs in Render dashboard
2. Look for the QR code in the logs
3. Scan the QR code with WhatsApp on your phone
4. Wait for "WhatsApp Bot connected successfully!" message

### 3.2 Get Group ID

1. Add the bot phone number to your team WhatsApp group
2. Send a test message in the group
3. Check the bot service logs for message logs containing the group chat ID
4. Copy the group ID (format: `120363xxxxxxxxxx@g.us`)

### 3.3 Update Environment Variables

1. Go to bot service settings in Render
2. Update the `GROUP_ID` environment variable with the copied ID
3. Save and redeploy the service

## Step 4: Verify Deployment

### 4.1 Test Web Application

1. Visit your deployed web app URL
2. Check that:
   - Home page loads and shows project dashboard
   - Member pages are accessible (e.g., `/ilan`)
   - Tasks can be added and completed
   - Database connections work

### 4.2 Test WhatsApp Bot

1. Add a task through the web interface
2. Wait up to 5 minutes for WhatsApp notification
3. Complete a task and verify completion notification
4. Check bot service logs for any errors

## Step 5: Domain Configuration (Optional)

### 5.1 Custom Domain for Web App

1. Go to web service settings
2. Click "Custom Domains"
3. Add your domain name
4. Update DNS records as instructed
5. Enable HTTPS

### 5.2 Environment Variable Updates

If using custom domain, update any hardcoded URLs in environment variables.

## Troubleshooting

### Common Issues

**Web App Won't Start**
- Check build logs for errors
- Verify all environment variables are set
- Ensure Supabase credentials are correct

**WhatsApp Bot Connection Issues**
- Delete and recreate the service if QR code problems persist
- Ensure phone has good internet connection when scanning
- Check that WhatsApp account isn't already connected to another bot

**Database Connection Errors**
- Verify Supabase URL and key in environment variables
- Check Supabase project is active and accessible
- Confirm database schema is properly created

**WhatsApp Messages Not Sending**
- Verify GROUP_ID is correct format
- Check bot is still in the WhatsApp group
- Review bot service logs for error messages

### Log Monitoring

Monitor your services through:
1. Render Dashboard → Service → Logs
2. Check for error patterns
3. Monitor resource usage
4. Set up alerts for service downtime

### Scaling Considerations

For production use:
- **Web Service**: Scale based on team size and usage
- **Bot Service**: Usually doesn't need scaling (single instance sufficient)
- **Database**: Monitor Supabase usage and upgrade plan if needed

## Maintenance

### Regular Tasks

1. **Monitor Service Health**: Check Render dashboard weekly
2. **Update Dependencies**: Keep packages updated for security
3. **Backup Database**: Use Supabase backup features
4. **Monitor Costs**: Track Render and Supabase usage

### Updates and Releases

1. Push changes to GitHub repository
2. Services auto-deploy if auto-deploy is enabled
3. Monitor deployment logs
4. Test functionality after deployment

## Security Considerations

1. **Environment Variables**: Never commit secrets to repository
2. **Database Access**: Use Row Level Security in Supabase
3. **API Keys**: Rotate keys periodically
4. **WhatsApp Session**: Monitor for unauthorized access

## Support

For deployment issues:
- Check Render documentation
- Review service logs
- Verify environment configuration
- Test locally before deploying
