const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

const connectDB = require('./config/db')
const {corsOptions} = require('./config/cors')
const {initializeSocket} = require('./socket/socket')
const errorMiddleware = require('./middleware/errorMiddleware')

const authRoutes = require('./routes/authRoutes')
const orderRoutes = require('./routes/orderRoutes')
const messageRoutes = require('./routes/messageRoutes')
const disputeRoutes = require('./routes/disputeRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')

dotenv.config()

const app = express()

app.use(cors(corsOptions))

app.use(express.json())

app.get(['/', '/api'], (req, res) => {
  res.json({
    message: 'DotEye Order Tracker API is running',
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/orders', messageRoutes)
app.use('/api/disputes', disputeRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use(errorMiddleware)

const PORT = process.env.PORT || 5000

const startServer = async () => {
  const http = require('http')
  const server = http.createServer(app)

  await connectDB()
  initializeSocket(server)

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

if (require.main === module) {
  startServer().catch(error => {
    console.error('Server failed to start:', error.message)
    process.exitCode = 1
  })
}

module.exports = app
