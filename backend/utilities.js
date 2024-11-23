const jwt = require('jsonwebtoken')

function authenticateToken(req, res, next) {
  const token =
    req.header('Authorization') && req.header('Authorization').split(' ')[1]

  if (!token) {
    return res.status(403).json({ error: true, message: 'Token is required' })
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: true, message: 'Invalid Token' })
    }

    req.user = user
    next()
  })
}

module.exports = {
  authenticateToken
}
