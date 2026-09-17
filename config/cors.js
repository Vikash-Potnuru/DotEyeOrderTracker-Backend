const normalizeOrigin = origin =>
  String(origin || '')
    .trim()
    .replace(/\/+$/, '')
    .toLowerCase()

const getConfiguredOrigins = () =>
  (process.env.CLIENT_URL || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean)

const isLocalhostOrigin = origin =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)

const isOriginAllowed = origin => {
  // Same-origin requests, curl, Postman and server-to-server calls send no Origin header.
  if (!origin) {
    return true
  }

  const normalized = normalizeOrigin(origin)

  if (getConfiguredOrigins().includes(normalized)) {
    return true
  }

  if (isLocalhostOrigin(normalized)) {
    return true
  }

  return false
}

const originHandler = (origin, callback) => {
  if (isOriginAllowed(origin)) {
    return callback(null, true)
  }

  console.warn(`CORS blocked request from origin: ${origin}`)
  return callback(null, false)
}

const corsOptions = {
  origin: originHandler,
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
}

const socketCorsOptions = {
  origin: originHandler,
  credentials: true,
  methods: ['GET', 'POST'],
}

module.exports = {
  corsOptions,
  socketCorsOptions,
  isOriginAllowed,
}
