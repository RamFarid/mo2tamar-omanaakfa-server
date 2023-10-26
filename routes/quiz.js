const express = require('express')
const responseMessage = require('../utils/responseMessage')
const Quiz = require('../models/Quiz')
const Member = require('../models/Member')
const quizRouter = express.Router()

quizRouter.get('/', async (_req, res) => {
  try {
    const quizzes = await Quiz.find()
      .select('title _id active')
      .sort({ title: -1 })
    res.status(200).json(responseMessage('Success.', true, { quizzes }))
  } catch (error) {
    res
      .status(200)
      .json(responseMessage(`المشكله مش من عندك ${error.message}`, false))
  }
})

quizRouter.get('/:id/target', async (req, res) => {
  const { id } = req.params
  try {
    const quiz = await Quiz.findById(id)
    res.status(200).json(responseMessage('Success.', true, { quiz }))
  } catch (error) {
    res
      .status(200)
      .json(responseMessage(`المشكله مش من عندك ${error.message}`, false))
  }
})

quizRouter.put('/:id/active', async (req, res) => {
  const { id } = req.params
  const { currentValue } = req.body
  try {
    await Quiz.updateMany({ active: true }, { $set: { active: false } })
    console.log(!currentValue)
    console.log(currentValue)
    await Quiz.updateOne({ _id: id }, { $set: { active: !currentValue } })
    res.status(200).json(responseMessage('Success', true))
  } catch (error) {
    res.json(responseMessage(error.message, false))
  }
})

quizRouter.get('/active', async (_req, res) => {
  try {
    const quizzes = await Quiz.findOne({ active: true })
    console.log(quizzes?.toObject())
    res.status(200).json(
      responseMessage('Seccess.', true, {
        data: quizzes?.toObject(),
        code: quizzes?.toObject() ? undefined : 'NO_ACTIVE_QUIZ',
      })
    )
  } catch (error) {
    res
      .status(200)
      .json(responseMessage(`المشكله مش من عندك ${error.message}`, false))
  }
})

quizRouter.post('/:id/answer', async (req, res) => {
  const {
    body: { degree, fromUserID },
    params: { id },
  } = req
  try {
    const updatedMember = await Member.findByIdAndUpdate(
      fromUserID,
      {
        $push: { quizzesDone: id },
        $inc: { points: degree },
      },
      { new: true }
    )
    res.json(
      responseMessage(`ممتاز وصلت ${updatedMember.toObject().points}`, true)
    )
  } catch (error) {
    res.json(responseMessage(error.message, false))
  }
})

quizRouter.post('/init', async (req, res) => {
  try {
    const quiz1 = {
      title: 'Quiz 5',
      questions: [
        {
          question: 'وكان اللاويين من أبناء يساكر',
          choices: [
            {
              choice: 'صح',
              correct: false,
            },
            {
              choice: 'غلط',
              correct: true,
            },
          ],
          type: 'single',
        },
        {
          question: 'بناء خيمة الاجتماع تم على يد هوشع',
          choices: [
            {
              choice: 'صح',
              correct: false,
            },
            {
              choice: 'غلط',
              correct: true,
            },
          ],
          type: 'single',
        },
        {
          question: 'بناء الهيكل تم على يد داود',
          choices: [
            {
              choice: 'صح',
              correct: false,
            },
            {
              choice: 'غلط',
              correct: true,
            },
          ],
          type: 'single',
        },
        {
          question: 'تيطس من تلاميذ السيد المسيح',
          choices: [
            {
              choice: 'صح',
              correct: false,
            },
            {
              choice: 'غلط',
              correct: true,
            },
          ],
          type: 'single',
        },
        {
          question: 'بطرس هو رسول الأمم',
          choices: [
            {
              choice: 'صح',
              correct: false,
            },
            {
              choice: 'غلط',
              correct: true,
            },
          ],
          type: 'single',
        },
        {
          question: 'عدد معجزات السيد المسيح لإقامة أموات 5',
          choices: [
            {
              choice: 'صح',
              correct: false,
            },
            {
              choice: 'غلط',
              correct: true,
            },
          ],
          type: 'single',
        },
        {
          question: 'عدد معجزات اشباع الجموع 4',
          choices: [
            {
              choice: 'صح',
              correct: false,
            },
            {
              choice: 'غلط',
              correct: true,
            },
          ],
          type: 'single',
        },
      ],
      doneBy: [],
      active: true,
    }
    const quiz = new Quiz(quiz1)
    await quiz.save()
    res.json({ quiz })
  } catch (error) {
    res.json(responseMessage(error.message, false))
  }
})

module.exports = quizRouter
