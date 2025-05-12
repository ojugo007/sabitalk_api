const LessonsModel = require("../models/lessons.model")
const { post } = require("../routes/auth.routes")


// user
// get all on a specific language limit1 skip 1 
const getAllLessons = async({language},skip) =>{
    console.log("from service ", language)
    console.log("service skip ", skip)
    try{
        const lessons = await LessonsModel.aggregate([
            { $sort: { lessonNumber: 1 } },                        
            { $skip: skip},                                       
            { $limit: 1 },   
            {$unwind : "$translations"},
            {$match : {"translations.language" : language}},
            {
                $project : {
                    _id: 0,
                    topic: 1,
                    lessonNumber: 1,
                    englishTranslation: 1,
                    translation: "$translations"
                }
            }
        ])
        console.log("all lessons", lessons)
        return({
            code : 200,
            success : true,
            data: lessons,
            message : "lessons retrieved successfully"
        })
    }catch(error){
        console.log("unkwown server error, cannot retrieve lessons at this time", error.message);
        return({
            code : 500,
            success : false,
            data : null,
            message : "unkwown server error, cannot retrieve lessons at this time"
        })
    }
}
//--- admin only

const addLesson = async({lessonNumber, topic, level, englishTranslation, translations}) =>{
    if(!topic || !englishTranslation || !translations ||!level || !Array.isArray(translations)){
        return({
            success : false,
            code : 400,
            data : null,
            message : "all fields are required",
        })
    }

    if(lessonNumber === undefined || lessonNumber === null){
        let lastLesson = await LessonsModel.findOne({topic}).sort({lessonNumber : -1}).limit(1);
        lessonNumber = lastLesson? lastLesson.lessonNumber + 1 : 1
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


const editLesson = async({lessonNumber, topic, level, englishTranslation, translations}, id)=>{
    if(!topic || !level || !englishTranslation || !translations || !Array.isArray(translations)){
        return({
            code : 400,
            success: false,
            data : null,
            message : "all fields are required"
        })
    }
    console.log("id from service", id)
    try{
        const lessonExist = await LessonsModel.findById(id)
        if(!lessonExist){
            return({
                code : 404,
                success: false,
                data : null,
                message : "lesson not found"
            })
        }
  
        lessonExist.lessonNumber = lessonNumber || lessonExist.lessonNumber, 
        lessonExist.level = level || lessonExist.level,
        lessonExist.topic = topic || lessonExist.topic, 
        lessonExist.englishTranslation = englishTranslation || lessonExist.englishTranslation, 
        lessonExist.translations = translations || lessonExist.translations
     
        await lessonExist.save()

        return({
            code : 200,
            success : true,
            data : lessonExist,
            message : "lesson successfully updated"
        })

    }catch(error){
        console.log("unable to edit lesson at this time: ", error)
        return({
            code : 500,
            success : false,
            message: "unable to edit lesson at this time"
        })
    }

}


const deleteLesson = async(id) =>{
    if(!id){
        return({
            code : 404,
            success : false,
            message : "lesson id can not be undefined",
            data : null
        })
    }
    try{
        const lessonExist = await LessonsModel.findById(id)
        if(!lessonExist){
            return({
                code : 404,
                success : false,
                message : "lesson with id was not found",
                data : null
            })
        }
        await LessonsModel.deleteOne(lessonExist)
        return({
            code : 200,
            success : true,
            message : `successfully deleted lesson with id: ${lessonExist._id}`,
            data : null
        })

    }catch(error){
        console.log("unable to delete lesson due to server error", error.message)
        return({
            code : 500,
            success : false,
            data :null,
            message : "server error, can not delete lesson at this time"
        })
    }
}

module.exports = {
    addLesson,
    editLesson,
    deleteLesson,
    getAllLessons
}