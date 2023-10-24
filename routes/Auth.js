const express = require('express')
const responseMessage = require('../utils/responseMessage')
const authRouter = express.Router()

authRouter.post('/login', async (req, res) => {
  const password = req.body.password.trim()
  if (!password) return res.json(responseMessage('الباسورد مطلوب', false))
  const isPassword = password === process.env.UI_PASSWORD
  if (!isPassword) {
    res.status(200).json(responseMessage('الباسورد غلط', false))
    return
  }
  res.json(responseMessage('User auth success', true, { data: password }))
})

authRouter.get('/check', async (req, res) => {
  try {
    const password = req.header('Authorization')
    if (!password) {
      res.status(200).json(responseMessage('الباسورد مطلوب', false))
      return
    }
    const isPassword = password === process.env.UI_PASSWORD
    if (!isPassword) {
      res.status(200).json(responseMessage('الباسورد غلط', false))
      return
    }
    res.status(200).json(responseMessage('User auth success.', true))
  } catch (error) {
    res.status(200).json(responseMessage(error.message, false))
  }
})

module.exports = authRouter
