[
    {
      "_id": ObjectId("..."),
      "lessonNumber": 1,
      "topic": "Greetings",
      "englishTranslation": "good morning",
      "translations": [
        {
          "language": "yoruba",
          "text": "ẹ káàrọ̀",
          "pronunciation": "yoruba_ekaaro.mp3"
        },
        {
          "language": "igbo",
          "text": "ụtụtụ ọma",
          "pronunciation": "igbo_ututuoma.mp3"
        },
        {
          "language": "hausa",
          "text": "ina kwana",
          "pronunciation": "hausa_inakwana.mp3"
        }
      ]
    },
    {
      "_id": ObjectId("..."),
      "lessonNumber": 2,
      "topic": "Family",
      "englishTranslation": "father",
      "translations": [
        {
          "language": "yoruba",
          "text": "bàbá",
          "pronunciation": "yoruba_baba.mp3"
        },
        {
          "language": "igbo",
          "text": "nna",
          "pronunciation": "igbo_nna.mp3"
        },
        {
          "language": "hausa",
          "text": "uba",
          "pronunciation": "hausa_uba.mp3"
        }
      ]
    },
    {
      "_id": ObjectId("..."),
      "lessonNumber": 3,
      "topic": "Common Phrases",
      "englishTranslation": "thank you",
      "translations": [
        {
          "language": "yoruba",
          "text": "ẹ ṣé",
          "pronunciation": "yoruba_ese.mp3"
        },
        {
          "language": "igbo",
          "text": "daalụ",
          "pronunciation": "igbo_daalụ.mp3"
        },
        {
          "language": "hausa",
          "text": "na gode",
          "pronunciation": "hausa_nagode.mp3"
        }
      ]
    }
  ]
  

  const LessonsModel = require("../models/lessons.model");

const addLessons = async({ lessonNumber, topic, englishTranslation, translations, language, text, pronunciation }) => {
  // Validate required fields
  if (!lessonNumber || !topic || !englishTranslation || !translations || !language || !text || !pronunciation) {
    return {
      success: false,
      code: 400,
      data: null,
      message: "All fields are required",
    };
  }

  try {
    // Check if the lesson already exists under the given topic and lesson number
    const topicExist = await LessonsModel.findOne({ topic, "translations.lessonNumber": lessonNumber });
    
    if (!topicExist) {
      // If topic doesn't exist, create a new lesson document
      const lesson = await LessonsModel.create({
        lessonNumber, 
        topic, 
        englishTranslation, 
        translations, 
        language, 
        text, 
        pronunciation 
      });

      return {
        success: true,
        code: 201,
        data: lesson,
        message: "Lesson added successfully",
      };
    }

    // If the topic exists, update by appending the new lesson to the topic's translations array
    const updatedTopic = await LessonsModel.updateOne(
      { topic, "translations.lessonNumber": lessonNumber },
      { 
        $push: { 
          translations: { language, text, pronunciation }  // Append the new translation
        } 
      }
    );

    // If no update occurred, it's likely that the lesson already exists in the translations array
    if (updatedTopic.modifiedCount === 0) {
      return {
        success: false,
        code: 400,
        data: null,
        message: "Lesson with this lesson number already exists",
      };
    }

    return {
      success: true,
      code: 200,
      data: updatedTopic,
      message: "Lesson updated successfully",
    };

  } catch (err) {
    console.error("Error adding/updating lesson:", err);
    return {
      success: false,
      code: 500,
      data: null,
      message: "Unable to add lessons at this time",
    };
  }
};
