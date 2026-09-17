const {Server} = require('socket.io')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Order = require('../models/Order')
const {socketCorsOptions} = require('../config/cors')

let io

const initializeSocket = server => {
  io = new Server(server, {
    cors: socketCorsOptions,
  })

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace('Bearer ', '')

      if (!token) {
        return next(new Error('Authentication token is required.'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      const user = await User.findOne({id: decoded.userId})

      if (!user) {
        return next(new Error('User not found.'))
      }

      socket.user = user

      next()
    } catch (error) {
      next(new Error('Invalid or expired socket token.'))
    }
  })

  io.on('connection', socket => {
    console.log(`Socket connected: ${socket.id}`)

    socket.on('join-order', async orderId => {
      try {
        const order = await Order.findOne({id: orderId})

        if (!order) {
          socket.emit('socket-error', {
            message: 'Order not found.',
          })
          return
        }

        if (
          socket.user.role === 'Customer' &&
          order.customerId !== socket.user.id
        ) {
          socket.emit('socket-error', {
            message: 'You do not have access to this order.',
          })
          return
        }

        socket.join(orderId)

        socket.emit('joined-order', {
          orderId,
        })
      } catch (error) {
        socket.emit('socket-error', {
          message: 'Unable to join order room.',
        })
      }
    })

    socket.on('leave-order', orderId => {
      socket.leave(orderId)
    })

    socket.on('typing-start', orderId => {
      socket.to(orderId).emit('typing-start', {
        orderId,
        userId: socket.user.id,
        userName: socket.user.name,
      })
    })

    socket.on('typing-stop', orderId => {
      socket.to(orderId).emit('typing-stop', {
        orderId,
        userId: socket.user.id,
      })
    })

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })

  console.log('Socket.io initialized')
}

const emitToOrderRoom = (orderId, event, data) => {
  if (!io) {
    return
  }

  io.to(orderId).emit(event, data)
}

module.exports = {
  initializeSocket,
  emitToOrderRoom,
}
