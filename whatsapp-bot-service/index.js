const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const { createClient } = require('@supabase/supabase-js')
const cron = require('node-cron')
const qrcode = require('qrcode-terminal')
require('dotenv').config()

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const GROUP_ID = process.env.GROUP_ID
const POLLING_INTERVAL = parseInt(process.env.POLLING_INTERVAL) || 5

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Member display names
const MEMBER_DISPLAY_NAMES = {
  ilan: 'Ilan',
  midlaj: 'Midlaj', 
  hysam: 'Hysam',
  alan: 'Alan'
}

class WhatsAppBot {
  constructor() {
    this.socket = null
    this.lastCheck = new Date()
    this.isConnected = false
  }

  async initialize() {
    try {
      console.log('Initializing WhatsApp Bot...')
      
      // Use multi-file auth state
      const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
      
      // Create socket
      this.socket = makeWASocket({
        auth: state,
        logger: require('pino')({ level: 'silent' })
      })

      // Handle credentials update
      this.socket.ev.on('creds.update', saveCreds)

      // Handle connection updates
      this.socket.ev.on('connection.update', this.handleConnectionUpdate.bind(this))

      // Handle messages (optional - for debugging)
      this.socket.ev.on('messages.upsert', this.handleMessages.bind(this))

    } catch (error) {
      console.error('Error initializing WhatsApp Bot:', error)
    }
  }

  handleConnectionUpdate(update) {
    const { connection, lastDisconnect, qr } = update

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

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('Connection closed due to:', lastDisconnect?.error, 'Reconnecting:', shouldReconnect)
      
      this.isConnected = false
      
      if (shouldReconnect) {
        setTimeout(() => this.initialize(), 5000) // Reconnect after 5 seconds
      }
    } else if (connection === 'open') {
      console.log('WhatsApp Bot connected successfully!')
      this.isConnected = true
    } else if (connection === 'connecting') {
      console.log('Connecting to WhatsApp...')
    }
  }

  handleMessages(m) {
    // Optional: Handle incoming messages for debugging
    const messages = m.messages
    for (const message of messages) {
      if (!message.key.fromMe && message.message) {
        console.log('Received message:', message.message.conversation || message.message.extendedTextMessage?.text)
      }
    }
  }

  async sendMessage(text) {
    if (!this.isConnected || !this.socket) {
      console.error('Bot is not connected. Cannot send message:', text)
      return false
    }

    try {
      await this.socket.sendMessage(GROUP_ID, { text })
      console.log('Message sent successfully:', text)
      return true
    } catch (error) {
      console.error('Error sending message:', error)
      return false
    }
  }

  async checkForTaskUpdates() {
    try {
      console.log('Checking for task updates...')
      
      // Get tasks updated since last check
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .gte('updated_at', this.lastCheck.toISOString())
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching tasks:', error)
        return
      }

      if (tasks && tasks.length > 0) {
        console.log(`Found ${tasks.length} task updates`)
        
        for (const task of tasks) {
          await this.processTaskUpdate(task)
        }
      }

      // Update last check time
      this.lastCheck = new Date()
      
    } catch (error) {
      console.error('Error checking for task updates:', error)
    }
  }

  async processTaskUpdate(task) {
    try {
      const memberName = MEMBER_DISPLAY_NAMES[task.assigned_member]
      const createdAt = new Date(task.created_at)
      const updatedAt = new Date(task.updated_at)
      
      // Check if this is a new task (created within last polling interval)
      const timeDiff = Date.now() - createdAt.getTime()
      const isNewTask = timeDiff < (POLLING_INTERVAL * 60 * 1000) // Convert minutes to milliseconds
      
      let message = ''
      
      if (isNewTask && !task.completed) {
        // New task added
        message = `${memberName} added task: ${task.title}`
      } else if (task.completed && task.completed_at) {
        // Task completed
        const completedAt = new Date(task.completed_at)
        const completionTimeDiff = Date.now() - completedAt.getTime()
        
        // Only send completion message if completed recently
        if (completionTimeDiff < (POLLING_INTERVAL * 60 * 1000)) {
          message = `${memberName} completed task: ${task.title}`
        }
      }
      
      if (message) {
        await this.sendMessage(message)
        await new Promise(resolve => setTimeout(resolve, 1000)) // 1 second delay between messages
      }
      
    } catch (error) {
      console.error('Error processing task update:', error)
    }
  }

  startPolling() {
    // Create cron job for polling every X minutes
    const cronExpression = `*/${POLLING_INTERVAL} * * * *` // Every X minutes
    
    console.log(`Starting polling every ${POLLING_INTERVAL} minutes...`)
    
    cron.schedule(cronExpression, () => {
      this.checkForTaskUpdates()
    })
    
    // Also run initial check
    setTimeout(() => {
      this.checkForTaskUpdates()
    }, 10000) // Wait 10 seconds after startup
  }
}

// Initialize and start the bot
async function startBot() {
  console.log('Starting Team Update WhatsApp Bot...')
  
  // Validate environment variables
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Error: Missing Supabase configuration in environment variables')
    process.exit(1)
  }
  
  if (!GROUP_ID) {
    console.error('Warning: GROUP_ID not set. Please set it after connecting to WhatsApp')
  }
  
  const bot = new WhatsAppBot()
  
  try {
    await bot.initialize()
    bot.startPolling()
    
    console.log('Bot is running...')
    console.log('Press Ctrl+C to stop')
    
  } catch (error) {
    console.error('Failed to start bot:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\\nShutting down bot...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\\nShutting down bot...')
  process.exit(0)
})

// Start the bot
startBot()
