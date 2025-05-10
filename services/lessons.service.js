const LessonsModel = require("../models/lessons.model")
const { post } = require("../routes/auth.routes")


// user
// get all on a specific language limit1 skip 1 

//--- admin only

const addLessons = async({lessonNumber, topic, level, englishTranslation, translations}) =>{
    if(!lessonNumber || !topic || !englishTranslation || !translations ||!level || !Array.isArray(translations)){
        return({
            success : false,
            code : 400,
            data : null,
            message : "all fields are required",
        })
    }
    try{
        const topicExist = await LessonsModel.findOne({topic, "translations_lessonNumber" : lessonNumber})
        if(!topicExist){
            const lesson = await LessonsModel.create({
                lessonNumber, 
                level,
                topic, 
                englishTranslation, 
                translations
            });

            return({
                success : true,
                code : 201,
                data : lesson,
                message : "lesson added successfully",
            })
        }
        
        const updatedTopic = await LessonsModel.updateOne(
            {topic, "translations_lessonNumber" : lessonNumber }, 
            {
                $push : { 
                    translations : { language, text, pronunciation}
                }
            }
        )

        if (updatedTopic.modifiedCount === 0) {
            return {
              success: false,
              code: 400,
              data: null,
              message: "Lesson with this lesson number already exists",
            };
        }

        return({
            success : true,
            code : 200,
            data : updatedTopic,
            message : "lesson updated successfully",
        })


    }catch(err){
        console.log("unable to add lessons at this time :", err)
        if (err.code === 11000) {
            return {
              success: false,
              code: 400,
              message: "A lesson with this topic and lesson number already exists.",
            }
        };
        return({
            success : false,
            code : 500,
            data : null,
            message : "unable to add lessons at this time",
        })
    }

}
// post
// delete
// edit
module.exports = { addLessons}