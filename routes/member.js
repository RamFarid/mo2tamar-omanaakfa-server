const express = require('express')
const memberRouter = express.Router()
const Member = require('../models/Member')
const responseMessage = require('../utils/responseMessage')
const Quiz = require('../models/Quiz')

memberRouter.put('/:id', async (res, req) => {
  try {
    const { id } = res.params
    const { name, points, church } = res.body
    const updatedMember = await Member.findByIdAndUpdate(
      id,
      {
        name,
        points,
        church,
      },
      { new: true }
    )
    req
      .status(200)
      .json(
        responseMessage(`تم تحديث ${name} بنجاح`, true, { data: updatedMember })
      )
  } catch (error) {
    req.status(200).json(responseMessage(error.message, false))
  }
})

memberRouter.delete('/:id', async (res, req) => {
  try {
    const { id } = res.params
    const deletedMember = await Member.findByIdAndDelete(id)
    req
      .status(200)
      .json(responseMessage(`تم مسح ${deletedMember.name} بنجاح`, true))
  } catch (error) {
    req.status(500).json(responseMessage(error.message, false))
  }
})

memberRouter.post('/new', async (res, req) => {
  try {
    const { name, points, church } = res.body
    const NewMember = new Member({ name, points, church, quizzesDone: [] })
    await NewMember.save()
    req.status(201).json(
      responseMessage(`تم انشاء ${name} بنجاح`, true, {
        data: NewMember.toObject(),
      })
    )
  } catch (error) {
    req
      .status(500)
      .json(responseMessage(`في حاجة غلط حصلت ${error.message}`, false))
  }
})

memberRouter.get('/', async (_req, res) => {
  try {
    const members = await Member.find().sort({ points: -1 }).exec()
    res
      .status(200)
      .json(responseMessage('200 جبت البيانات بنجاح', true, { data: members }))
  } catch (error) {
    res.status(500).json(responseMessage(error.message, false, { code: 500 }))
  }
})

memberRouter.get('/search', async (req, res) => {
  const {
    query: { q },
  } = req
  try {
    console.log(q)
    const members = await Member.aggregate([
      {
        $search: {
          index: 'membersearch',
          text: {
            query: q,
            path: 'name',
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          church: 1,
          quizzesDone: 1,
          createdAt: 1,
        },
      },
    ])
    res.json(responseMessage('Done', true, { data: members }))
  } catch (error) {
    res.status(200).json(responseMessage(error.message, false, { ...error }))
  }
})

memberRouter.get('/waiting-members', async (req, res) => {
  try {
    const quizzes = await Quiz.aggregate([
      {
        $sort: {
          title: -1,
        },
      },
      {
        $lookup: {
          from: 'members',
          let: { quizID: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $not: {
                    $in: ['$$quizID', '$quizzesDone'],
                  },
                },
              },
            },
          ],
          as: 'members',
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          active: 1,
          notes: 1,
          members: 1,
        },
      },
    ])
    res.json(responseMessage('الاعضاء جم', true, { data: quizzes }))
  } catch (error) {
    res.json(responseMessage(error.message, false))
  }
})

module.exports = memberRouter
