const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')

async function listGroups() {
    console.log('🔄 Connecting to WhatsApp...')
    
    try {
        // Use multi-file auth state
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
        
        // Create socket
        const socket = makeWASocket({
            auth: state,
            logger: require('pino')({ level: 'silent' })
        })

        // Handle credentials update
        socket.ev.on('creds.update', saveCreds)

        // Handle connection updates
        socket.ev.on('connection.update', async (update) => {
            const { connection, qr } = update

            // Handle QR code
            if (qr) {
                console.log('\n📱 QR Code generated! Scan this QR code with your WhatsApp:')
                qrcode.generate(qr, { small: true })
                console.log('\n📱 Instructions:')
                console.log('1. Open WhatsApp on your phone')
                console.log('2. Go to Settings → Linked Devices')
                console.log('3. Tap "Link a Device"')
                console.log('4. Scan the QR code above')
                console.log('\nWaiting for connection...\n')
            }
            
            if (connection === 'open') {
                console.log('✅ Connected! Fetching groups...\n')
                
                try {
                    const groups = await socket.groupFetchAllParticipating()
                    
                    console.log('📱 YOUR WHATSAPP GROUPS:')
                    console.log('='.repeat(60))
                    
                    let counter = 1
                    Object.entries(groups).forEach(([jid, group]) => {
                        console.log(`${counter}. ${group.subject}`)
                        console.log(`   JID: ${jid}`)
                        console.log(`   Members: ${group.participants.length}`)
                        console.log('')
                        counter++
                    })
                    
                    console.log('\n📋 Copy one of the JIDs above to use as GROUP_ID in your .env file')
                    process.exit(0)
                } catch (error) {
                    console.error('❌ Error fetching groups:', error)
                    process.exit(1)
                }
            }
        })
        
    } catch (error) {
        console.error('❌ Error:', error.message)
        process.exit(1)
    }
}

listGroups()
