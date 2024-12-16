require('dotenv').config()

const config = require('./config.json')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

mongoose
  .connect(config.connectionString)
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch((error) => console.error('Error al conectar a MongoDB', error))

const User = require('./models/user.model')
const Note = require('./models/note.model')

const express = require('express')
const cors = require('cors')
const app = express()

const jwt = require('jsonwebtoken')
const { authenticateToken } = require('./utilities')

app.use(express.json())

app.use(
  cors({
    origin: '*'
  })
)

app.get('/', (req, res) => {
  res.json({ data: 'hello' })
})

app.post('/create-account', async (req, res) => {
  const { fullName, email, password } = req.body

  if (!fullName) {
    return res
      .status(400)
      .json({ error: true, message: 'Full name is required' })
  }

  if (!email)
    return res.status(400).json({ error: true, message: 'Email is required' })

  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: 'Password is required' })
  }

  const isUser = await User.findOne({ email: email })

  if (isUser) {
    return res.json({
      error: true,
      message: 'User already exist'
    })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = new User({
    fullName,
    email,
    password: hashedPassword
  })

  await user.save()

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '30000m'
  })

  return res.json({
    error: false,
    user,
    accessToken,
    message: 'Registration Successful'
  })
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email) return res.status(400).json({ message: 'Email is required' })
  if (!password)
    return res.status(400).json({ message: 'Password is required' })

  try {
    const userInfo = await User.findOne({ email: email })

    if (!userInfo) {
      return res.status(400).json({
        error: true,
        message: 'User not found'
      })
    }

    const isPasswordValid = await bcrypt.compare(password, userInfo.password)
    if (!isPasswordValid) {
      return res.status(400).json({
        error: true,
        message: 'Invalid Credentials'
      })
    }

    const user = { _id: userInfo._id, email: userInfo.email }
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '36000m'
    })

    return res.json({
      error: false,
      message: 'Login Successful',
      email: userInfo.email,
      accessToken
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      error: true,
      message: 'Internal Server Error'
    })
  }
})

app.get('/get-user', authenticateToken, async (req, res) => {
  const userId = req.user._id

  try {
    const isUser = await User.findOne({ _id: userId })

    if (!isUser) return res.sendStatus(401)

    return res.json({
      user: {
        fullName: isUser.fullName,
        email: isUser.email,
        _id: isUser._id,
        createdOn: isUser.createdOn
      },
      message: ''
    })
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: 'Internal Server Error' })
  }
})

app.post('/add-note', authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body
  const user = req.user

  if (!user) {
    return res
      .status(400)
      .json({ error: true, message: 'User not found in request' })
  }

  if (!title)
    return res.status(400).json({ error: true, message: 'Title is required' })

  if (!content)
    return res.status(400).json({ error: true, message: 'Content is required' })

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id
    })

    await note.save()

    return res.json({
      error: false,
      note,
      message: 'Note added successfully'
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      error: true,
      message: 'Internal Server Error'
    })
  }
})

app.get('/users', authenticateToken, async (req, res) => {
  const adminEmail = 'Admin@gmail.com'

  if (req.user.email !== adminEmail) {
    return res.status(403).json({
      error: true,
      message:
        'Unauthorized. Only the administrator can access this information.'
    })
  }

  try {
    const users = await User.find({}, '-password')
    return res.json(users)
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: 'Error getting users.'
    })
  }
})

app.delete('/delete-user/:id', authenticateToken, async (req, res) => {
  const adminEmail = 'Admin@gmail.com'

  if (req.user.email !== adminEmail) {
    return res.status(403).json({
      error: true,
      message:
        'Unauthorized. Only the administrator can access this information.'
    })
  }

  const userId = req.params.id

  try {
    const user = await User.findByIdAndDelete(userId)
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User Not Found'
      })
    }
    return res.json({
      error: false,
      message: 'User Deleted'
    })
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: 'Error Delete User'
    })
  }
})

app.put('/edit-note/:noteId', authenticateToken, async (req, res) => {
  const noteId = req.params.noteId
  const { title, content, tags, isPinned } = req.body
  const user = req.user

  if (!title && !content && !tags)
    return res.status(400).json({
      error: true,
      message: 'No changes provides'
    })

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id })

    if (!note)
      return res.status(404).json({ error: true, message: 'Note not found' })

    if (title) note.title = title
    if (content) note.content = content
    if (tags) note.tags = tags
    if (isPinned) note.isPinned = isPinned

    await note.save()

    return res.json({
      error: false,
      note,
      message: 'Note Updated successfully'
    })
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: 'Internal Server Error' })
  }
})

app.get('/get-all-notes/', authenticateToken, async (req, res) => {
  const userId = req.user._id

  try {
    const notes = await Note.find({ userId: userId }).sort({ isPinned: -1 })

    return res.json({
      error: false,
      notes,
      message: 'All notes retrieved successfully'
    })
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: 'Internal Server Error' })
  }
})

app.delete('/delete-note/:noteId', authenticateToken, async (req, res) => {
  const noteId = req.params.noteId
  const user = req.user

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id })

    if (!note)
      return res.status(404).json({ error: true, message: 'Note not found' })

    await Note.deleteOne({ _id: noteId, userId: user._id })

    return res.json({ error: false, message: 'Note deleted successfully' })
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: 'Internal Server Error' })
  }
})

app.put('/update-note-pinned/:noteId', authenticateToken, async (req, res) => {
  const noteId = req.params.noteId
  const { isPinned } = req.body
  const user = req.user

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id })

    if (!note)
      return res.status(404).json({ error: true, message: 'Note not found' })

    note.isPinned = isPinned

    await note.save()

    return res.json({
      error: false,
      note,
      message: 'Note Updated successfully'
    })
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: 'Internal Server Error' })
  }
})

app.get('/search-notes/', authenticateToken, async (req, res) => {
  const user = req.user
  const { query } = req.query

  if (!query)
    return res
      .status(400)
      .json({ error: true, message: 'Search query is required' })

  try {
    const matchingNotes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, 'i') } },
        { content: { $regex: new RegExp(query, 'i') } }
      ]
    })

    return res.json({
      error: false,
      notes: matchingNotes,
      message: 'Notes matching the search query retrieved successfully'
    })
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Internal Server Error'
    })
  }
})

app.listen(8000)

module.exports = app
