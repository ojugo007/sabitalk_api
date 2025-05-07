const mongoose = require("mongoose");

const schema = mongoose.Schema

const LessonsSchema = new schema({
    lessonNumber: {
    type: Number,
    required: true,
    unique: true
  },
  topic: {
    type: String,
    required: true
  },
  englishTranslation: {
    type: String,
    required: true
  },
  translations: [
    {
      language: {
        type: String,
        enum: ["yoruba", "igbo", "hausa"],
        required: true
      },
      text: {
        type: String,
        required: true
      },
      pronunciation: {
        type: String, 
        required: true
      }
    }
  ]
})


const LessonsModel = mongoose.model("Lessons", LessonsSchema)

module.exports = LessonsModel