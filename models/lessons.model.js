const mongoose = require("mongoose");

const schema = mongoose.Schema


const LessonsSchema = new schema({
  topic: { 
    type: String, 
    required: true 
  }, 
  lessonNumber: { 
    type: Number, 
    required: true 
  }, 
  level: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'professional'], 
    required: true 
  }, 
  englishTranslation: { 
    type: String, 
    required: true }, 
  translations: [
    {
      language: { type: String, required: true },  
      text: { type: String, required: true }, 
      pronunciation: { type: String, required: true } 
    }
  ]
});



const LessonsModel = mongoose.model("Lessons", LessonsSchema)

module.exports = LessonsModel