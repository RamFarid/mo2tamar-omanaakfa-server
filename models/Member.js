const mongoose = require('mongoose')

const MemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      required: true,
      default: 0,
    },
    church: {
      type: String,
    },
    quizzesDone: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'quizzes',
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

module.exports = mongoose.model('members', MemberSchema)
