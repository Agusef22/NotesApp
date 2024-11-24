const jwt = require('jsonwebtoken')

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res
      .status(401)
      .json({ error: true, message: 'Token missing or invalid' })
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ error: true, message: 'Token invalid or expired' })
    }
    req.user = user
    next()
  })
}

module.exports = {
  authenticateToken
}
