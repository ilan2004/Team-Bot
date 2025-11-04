// Simple WhatsApp Groups Lister
// Run this in your existing WhatsApp bot directory

const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

async function listGroups() {
    console.log('🔄 Connecting to WhatsApp...');
    
    try {
        // Connect using existing auth
        const { state } = await useMultiFileAuthState('./auth_info_baileys');
        
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection } = update;
            
            if (connection === 'open') {
                console.log('✅ Connected! Fetching groups...\n');
                
                const groups = await sock.groupFetchAllParticipating();
                
                console.log('📱 YOUR WHATSAPP GROUPS:');
                console.log('=' .repeat(60));
                
                let counter = 1;
                Object.entries(groups).forEach(([jid, group]) => {
                    console.log(`${counter}. ${group.subject}`);
                    console.log(`   JID: ${jid}`);
                    console.log(`   Members: ${group.participants.length}`);
                    console.log('');
                    counter++;
                });
                
                console.log('\n📋 Copy one of the JIDs above to use as WHATSAPP_GROUP_ID');
                process.exit(0);
            }
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Make sure you run this in your WhatsApp bot directory');
        console.log('💡 Ensure you have the auth_info_baileys folder with session data');
        process.exit(1);
    }
}

listGroups();
