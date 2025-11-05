# Real-time Sign-In/Out Sync Troubleshooting Guide

If sign-in/out changes aren't syncing across devices, here are the steps to diagnose and fix the issue:

## 1. Check Supabase Real-time Configuration

### Enable Real-time for daily_logs table in Supabase Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to **Database** > **Replication**
3. Find the `daily_logs` table and make sure **Real-time** is enabled
4. If it's not enabled, click to enable it

### Alternative: Enable via SQL
```sql
-- Enable real-time for daily_logs table
ALTER PUBLICATION supabase_realtime ADD TABLE daily_logs;
```

## 2. Check Row Level Security (RLS) Policies

Make sure your `daily_logs` table has the correct RLS policies:

```sql
-- Check if RLS is enabled (should be true)
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'daily_logs';

-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'daily_logs';

-- If policies are missing, create them:
CREATE POLICY "Allow all operations on daily_logs" ON public.daily_logs
    FOR ALL USING (true);
```

## 3. Verify Database Schema

Make sure your `daily_logs` table has the `log_date` column:

```sql
-- Check table schema
\d daily_logs;

-- If log_date column is missing, run the migration:
-- Execute the contents of migration-add-log-date.sql
```

## 4. Test Real-time Connection

### Using Browser Console:
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Look for these log messages:
   - ✅ "Setting up real-time subscription for daily_logs..."
   - ✅ "Daily logs subscription status: SUBSCRIBED"
   - ✅ "Daily logs real-time update received: [payload]"

### What to do if you see errors:
- **"TIMED_OUT"**: Real-time may not be enabled for the table
- **"CLOSED"**: Connection issues, check internet/Supabase status
- **No logs at all**: Check if the subscription is being set up

## 5. Debug Using the Debug Component

Add this debug component temporarily to test real-time sync:

```tsx
// In your main dashboard or any page
import { SignInDebug } from '@/components/debug/signin-debug';

// In your component:
<SignInDebug members={teamMembers} />
```

The debug component will:
- Show connection status (🟢 Connected / 🔴 Disconnected)
- Let you test sign-in/out manually
- Display all today's logs
- Show real-time updates in the console

## 6. Manual Refresh Workaround

As a temporary workaround, you can:
1. Double-click on the "Team Members" title in the main dashboard
2. This will manually refresh the sign-in status from the database
3. You'll see "Last updated: [time]" showing when it was refreshed

## 7. Common Issues and Solutions

### Issue: Changes sync after a long delay
**Solution**: Check your internet connection and Supabase region. Consider using a closer region.

### Issue: Real-time works but sign-in status is wrong
**Solution**: 
1. Check if multiple sign-in/out events exist for the same member today
2. The system uses the **latest** event to determine status
3. Use the debug component to see all logs and verify logic

### Issue: Works on one device but not others
**Solution**:
1. Clear browser cache on the non-working device
2. Check if both devices have the same browser/version
3. Verify both are connected to the internet

## 8. Testing Steps

1. **Open the app on Device A**
2. **Open the app on Device B** 
3. **On Device A**: Sign in a member
4. **On Device B**: You should see the status change within 1-2 seconds
5. **Check browser console** on both devices for real-time logs

## 9. If Nothing Works

1. **Restart Supabase real-time**: 
   - Go to Supabase Dashboard > Settings > API
   - Note your project URL and anon key
   - Restart your local development server

2. **Check Supabase Status**: 
   - Visit status.supabase.com
   - Look for any real-time service issues

3. **Fallback to Polling**:
   - Add an interval to refresh data every 10 seconds
   - Not ideal but works as a backup

## 10. Code to Add for Debugging

Add this to your component to see detailed real-time information:

```tsx
// Add this useEffect to any component for debugging
React.useEffect(() => {
  console.log('🔍 Real-time debugging enabled');
  
  // Test direct Supabase connection
  const testChannel = supabase
    .channel('test-channel')
    .on('broadcast', { event: 'test' }, (payload) => {
      console.log('📡 Test broadcast received:', payload);
    })
    .subscribe((status) => {
      console.log('📊 Test channel status:', status);
    });

  return () => {
    supabase.removeChannel(testChannel);
  };
}, []);
```

## Need Help?

If you're still having issues:
1. Check the browser console for specific error messages
2. Test with the debug component first
3. Verify your Supabase configuration
4. Consider using the manual refresh workaround temporarily
