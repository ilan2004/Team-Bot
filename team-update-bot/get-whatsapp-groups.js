// WhatsApp Groups Lister - Add this to your existing WhatsApp bot service
// This script will help you get the JIDs of all groups your WhatsApp bot is connected to

const { makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

async function getWhatsAppGroups() {
    try {
        // Use the same auth state as your main bot
        const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');
        
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false, // Set to true if you need to scan QR again
        });

        sock.ev.on('creds.update', saveCreds);
        
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
                
                if (shouldReconnect) {
                    getWhatsAppGroups();
                }
            } else if (connection === 'open') {
                console.log('✅ WhatsApp Connected! Fetching groups...\n');
                
                try {
                    // Get all groups
                    const groups = await sock.groupFetchAllParticipating();
                    
                    console.log('📋 LIST OF ALL GROUPS:\n');
                    console.log('=' .repeat(80));
                    
                    Object.entries(groups).forEach(([jid, group]) => {
                        console.log(`📱 Group Name: ${group.subject}`);
                        console.log(`🔗 JID: ${jid}`);
                        console.log(`👥 Participants: ${group.participants.length}`);
                        console.log(`📅 Created: ${new Date(group.creation * 1000).toLocaleDateString()}`);
                        console.log(`🏷️ Description: ${group.desc || 'No description'}`);
                        console.log('-'.repeat(80));
                    });
                    
                    // Also log in a format easy to copy for your .env
                    console.log('\n🔧 ENV FORMAT (copy one of these to your .env file):');
                    console.log('=' .repeat(60));
                    Object.entries(groups).forEach(([jid, group]) => {
                        console.log(`# ${group.subject}`);
                        console.log(`WHATSAPP_GROUP_ID=${jid}`);
                        console.log('');
                    });
                    
                    process.exit(0);
                    
                } catch (error) {
                    console.error('❌ Error fetching groups:', error);
                    process.exit(1);
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error connecting to WhatsApp:', error);
        process.exit(1);
    }
}

// Run the function
console.log('🔄 Connecting to WhatsApp to fetch groups...');
getWhatsAppGroups();
