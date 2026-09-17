const errorMiddleware = (error, req, res, next) => {
  console.error(error)

  const statusCode = error.statusCode || 500

  res.status(statusCode).json({
    message: error.message || 'Something went wrong on the server.',
  })
}

module.exports = errorMiddleware
