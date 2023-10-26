require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const memberRouter = require('./routes/member')
const authRouter = require('./routes/Auth')
const groupsRouter = require('./routes/group')
const responseMessage = require('./utils/responseMessage')
const Mmeber = require('./models/Member')
const quizRouter = require('./routes/quiz')
const app = express()

const PORT = process.env.PORT || 5000

const URL = process.env.DB_URL

mongoose
  .connect(URL)
  .then(() => {
    console.log('MongoDB connected')
  })
  .catch(console.error)

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://omanaakfa.netlify.app',
      'https://omanaakfa.vercel.app',
    ],
  })
)
app.use(cookieParser())
app.use(bodyParser.json())
app.use(async (req, res, next) => {
  const excludedPaths = [
    '/auth/login',
    '/auth/check',
    '/members',
    '/members/search',
    '/groups',
    '/quizzes/active',
  ]
  const password = req.header('Authorization')
  console.log('password: ', password)
  if (excludedPaths.includes(req.path) || req.path.includes('/answer')) {
    return next()
  }
  try {
    const isPassword = password === process.env.UI_PASSWORD
    if (isPassword) {
      next()
    } else {
      res.status(200).json(responseMessage('سجل دخول ك اداري', false))
    }
  } catch (err) {
    return res
      .status(403)
      .json(responseMessage('توكن بايظ: ' + err.message, false))
  }
})

app.use('/members', memberRouter)

app.use('/groups', groupsRouter)

app.use('/auth', authRouter)

app.use('/quizzes', quizRouter)

app.put('/qrcode', async (req, res) => {
  const { id } = req.query
  if (!id) return res.status(200).json(responseMessage('فين الID؟', false))
  try {
    const { modifiedCount } = await Mmeber.updateOne(
      { _id: id },
      { $inc: { points: 2 } }
    )
    if (modifiedCount === 0) {
      return res
        .status(404)
        .json(responseMessage('مفيش خادم بالاسم ده!', false))
    }
    const updatedMmeber = await Mmeber.findById(id)
    res.status(200).json(responseMessage(``, true, { data: updatedMmeber }))
  } catch (error) {
    res
      .status(200)
      .json(responseMessage('في حاجه غير متوقعه حصلت' + error.message, false))
  }
})

app.listen(PORT, () => console.log('Server run on port: ', PORT))

module.exports = app
