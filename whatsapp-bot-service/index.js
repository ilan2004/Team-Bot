const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const { createClient } = require('@supabase/supabase-js')
const cron = require('node-cron')
const qrcode = require('qrcode-terminal')
const express = require('express')
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

  async checkForUpdates() {
    try {
      console.log('Checking for updates...')
      
      // Get tasks updated since last check
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .gte('updated_at', this.lastCheck.toISOString())
        .order('updated_at', { ascending: false })

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError)
      } else if (tasks && tasks.length > 0) {
        console.log(`Found ${tasks.length} task updates`)
        for (const task of tasks) {
          await this.processTaskUpdate(task)
        }
      }

      // Get availability changes since last check
      const { data: availability, error: availabilityError } = await supabase
        .from('availability')
        .select('*')
        .gte('updated_at', this.lastCheck.toISOString())
        .order('updated_at', { ascending: false })

      if (availabilityError) {
        console.error('Error fetching availability:', availabilityError)
      } else if (availability && availability.length > 0) {
        console.log(`Found ${availability.length} availability updates`)
        for (const avail of availability) {
          await this.processAvailabilityUpdate(avail)
        }
      }

      // Get daily logs since last check (check-ins/check-outs)
      const { data: dailyLogs, error: logsError } = await supabase
        .from('daily_logs')
        .select('*')
        .gte('created_at', this.lastCheck.toISOString())
        .order('created_at', { ascending: false })

      if (logsError) {
        console.error('Error fetching daily logs:', logsError)
      } else if (dailyLogs && dailyLogs.length > 0) {
        console.log(`Found ${dailyLogs.length} daily log updates`)
        for (const log of dailyLogs) {
          await this.processDailyLogUpdate(log)
        }
      }

      // Update last check time
      this.lastCheck = new Date()
      
    } catch (error) {
      console.error('Error checking for updates:', error)
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
        message = `📋 ${memberName} added task: ${task.title}`
      } else if (task.completed && task.completed_at) {
        // Task completed
        const completedAt = new Date(task.completed_at)
        const completionTimeDiff = Date.now() - completedAt.getTime()
        
        // Only send completion message if completed recently
        if (completionTimeDiff < (POLLING_INTERVAL * 60 * 1000)) {
          message = `✅ ${memberName} completed task: ${task.title}`
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

  async processAvailabilityUpdate(availability) {
    try {
      const memberName = MEMBER_DISPLAY_NAMES[availability.member_name]
      const startDate = new Date(availability.start_date).toLocaleDateString()
      const endDate = new Date(availability.end_date).toLocaleDateString()
      
      // Check if this is a recent update
      const timeDiff = Date.now() - new Date(availability.updated_at).getTime()
      const isRecentUpdate = timeDiff < (POLLING_INTERVAL * 60 * 1000)
      
      if (!isRecentUpdate) return
      
      let statusIcon = ''
      let statusLabel = ''
      
      switch (availability.status) {
        case 'leave':
          statusIcon = '🏖️'
          statusLabel = 'on leave'
          break
        case 'exam':
          statusIcon = '📚'
          statusLabel = 'taking exams'
          break
        case 'busy':
          statusIcon = '⚡'
          statusLabel = 'busy'
          break
        case 'sick':
          statusIcon = '🤒'
          statusLabel = 'sick'
          break
        default:
          statusIcon = '✅'
          statusLabel = 'available'
      }
      
      let message = `${statusIcon} ${memberName} is ${statusLabel}`
      
      if (startDate === endDate) {
        message += ` today`
      } else {
        message += ` from ${startDate} to ${endDate}`
      }
      
      if (availability.reason) {
        message += ` (${availability.reason})`
      }
      
      await this.sendMessage(message)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error('Error processing availability update:', error)
    }
  }

  async processDailyLogUpdate(log) {
    try {
      const memberName = MEMBER_DISPLAY_NAMES[log.member_name]
      
      // Check if this is a recent update
      const timeDiff = Date.now() - new Date(log.created_at).getTime()
      const isRecentUpdate = timeDiff < (POLLING_INTERVAL * 60 * 1000)
      
      if (!isRecentUpdate) return
      
      let message = ''
      
      if (log.log_type === 'check_in') {
        message = `🌅 ${memberName} started the day`
        
        if (log.tasks_planned && log.tasks_planned.length > 0) {
          message += `\nPlanned tasks: ${log.tasks_planned.join(', ')}`
        }
      } else if (log.log_type === 'check_out') {
        message = `🌙 ${memberName} finished the day`
        
        if (log.tasks_completed && log.tasks_completed.length > 0) {
          message += `\nCompleted: ${log.tasks_completed.join(', ')}`
        } else {
          message += `\nCompleted: No tasks finished today`
        }
        
        if (log.tomorrow_priority) {
          message += `\nTomorrow's focus: ${log.tomorrow_priority}`
        }
      }
      
      if (message) {
        await this.sendMessage(message)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
    } catch (error) {
      console.error('Error processing daily log update:', error)
    }
  }

  startPolling() {
    // Create cron job for polling every X minutes
    const cronExpression = `*/${POLLING_INTERVAL} * * * *` // Every X minutes
    
    console.log(`Starting polling every ${POLLING_INTERVAL} minutes...`)
    
    cron.schedule(cronExpression, () => {
      this.checkForUpdates()
    })
    
    // Also run initial check
    setTimeout(() => {
      this.checkForUpdates()
    }, 10000) // Wait 10 seconds after startup
  }
}

// Initialize HTTP server for Render compatibility
function startHttpServer() {
  const app = express()
  const port = process.env.PORT || 3000
  
  // Middleware to parse JSON
  app.use(express.json())
  
  // Health check endpoint
  app.get('/', (req, res) => {
    res.json({
      status: 'running',
      service: 'WhatsApp Bot Service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    })
  })
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    })
  })
  
  // Bot status endpoint
  app.get('/bot/status', (req, res) => {
    // This could be expanded to check actual bot status
    res.json({
      status: 'active',
      lastCheck: new Date().toISOString(),
      service: 'WhatsApp Bot with Baileys'
    })
  })
  
  app.listen(port, () => {
    console.log(`HTTP server running on port ${port}`)
  })
}

// Initialize and start the bot
async function startBot() {
  console.log('Starting Team Update WhatsApp Bot...')
  
  // Start HTTP server first for Render port binding
  startHttpServer()
  
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
