// Test script to verify the enhanced sign-in/out functionality
// Run this with: node test-signin-functionality.js

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test member data
const testMember = 'ilan'; // Change this to test different members
const testDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format

async function testSignInFunctionality() {
  console.log('🧪 Testing Enhanced Sign-In/Out Functionality');
  console.log('============================================\n');
  
  try {
    // Test 1: Create a sign-in log entry
    console.log('1️⃣  Testing sign-in logging...');
    const signInResult = await supabase
      .from('daily_logs')
      .insert([{
        member_name: testMember,
        log_type: 'check_in',
        log_date: testDate,
        tasks_planned: ['Test task 1', 'Test task 2'],
        notes: 'Test sign-in via test script'
      }]);
    
    if (signInResult.error) {
      console.error('❌ Sign-in test failed:', signInResult.error);
    } else {
      console.log('✅ Sign-in logged successfully');
    }

    // Test 2: Create a sign-out log entry
    console.log('\n2️⃣  Testing sign-out logging...');
    const signOutResult = await supabase
      .from('daily_logs')
      .insert([{
        member_name: testMember,
        log_type: 'check_out',
        log_date: testDate,
        tasks_completed: ['Completed test task 1'],
        tomorrow_priority: 'Continue with test tasks',
        notes: 'Test sign-out via test script'
      }]);
    
    if (signOutResult.error) {
      console.error('❌ Sign-out test failed:', signOutResult.error);
    } else {
      console.log('✅ Sign-out logged successfully');
    }

    // Test 3: Query today's logs for the test member
    console.log('\n3️⃣  Testing daily log queries...');
    const { data: todaysLogs, error: queryError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('member_name', testMember)
      .eq('log_date', testDate)
      .order('created_at', { ascending: false });

    if (queryError) {
      console.error('❌ Query test failed:', queryError);
    } else {
      console.log(`✅ Found ${todaysLogs.length} log entries for ${testMember} on ${testDate}`);
      todaysLogs.forEach((log, index) => {
        console.log(`   ${index + 1}. ${log.log_type} at ${new Date(log.created_at).toLocaleTimeString()}`);
        console.log(`      Date: ${log.log_date}`);
        if (log.tasks_planned) console.log(`      Tasks Planned: ${log.tasks_planned.join(', ')}`);
        if (log.tasks_completed) console.log(`      Tasks Completed: ${log.tasks_completed.join(', ')}`);
        if (log.notes) console.log(`      Notes: ${log.notes}`);
      });
    }

    // Test 4: Check sign-in status
    console.log('\n4️⃣  Testing sign-in status check...');
    const { data: signInCheck, error: signInCheckError } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('member_name', testMember)
      .eq('log_type', 'check_in')
      .eq('log_date', testDate)
      .limit(1);

    if (signInCheckError) {
      console.error('❌ Sign-in status check failed:', signInCheckError);
    } else {
      const hasSignedIn = (signInCheck?.length || 0) > 0;
      console.log(`✅ ${testMember} has ${hasSignedIn ? '' : 'NOT '}signed in today (${testDate})`);
    }

    // Test 5: Get team attendance summary
    console.log('\n5️⃣  Testing team attendance summary...');
    const { data: allTodaysLogs, error: summaryError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('log_date', testDate);

    if (summaryError) {
      console.error('❌ Team attendance summary failed:', summaryError);
    } else {
      const allMembers = ['ilan', 'midlaj', 'hysam', 'alan'];
      const signedInMembers = allTodaysLogs
        .filter(log => log.log_type === 'check_in')
        .map(log => log.member_name);
      const signedOutMembers = allTodaysLogs
        .filter(log => log.log_type === 'check_out')
        .map(log => log.member_name);
      const notSignedIn = allMembers.filter(member => !signedInMembers.includes(member));

      console.log('✅ Team Attendance Summary:');
      console.log(`   📅 Date: ${testDate}`);
      console.log(`   ✅ Signed In: ${[...new Set(signedInMembers)].join(', ') || 'None'}`);
      console.log(`   ✅ Signed Out: ${[...new Set(signedOutMembers)].join(', ') || 'None'}`);
      console.log(`   ❌ Not Signed In: ${notSignedIn.join(', ') || 'None'}`);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }

  console.log('\n🎉 Test completed! Check the results above.');
  console.log('\n📝 Notes:');
  console.log('   - If you see successful log entries, the enhanced functionality is working');
  console.log('   - The log_date field ensures proper date tracking');
  console.log('   - All sign-in/out events now include explicit date information');
  console.log('   - You can query by specific dates for better reporting');
}

// Run the test
testSignInFunctionality();
