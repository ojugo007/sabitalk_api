const LessonsModel = require("../models/lessons.model")
const { post } = require("../routes/auth.routes")


// user
// get all on a specific language limit1 skip 1 

//--- admin only

const addLessons = async({lessonNumber, topic, englishTranslation, translations, language, text, pronunciation }) =>{
    if(!lessonNumber || !topic || !englishTranslation || !translations || !language || !text || !pronunciation ){
        return({
            success : false,
            code : 400,
            data : null,
            message : "all fields are required",
        })
    }
    try{
        const lesson = await LessonsModel.create({lessonNumber, topic, englishTranslation, translations, language, text, pronunciation })

        return({
            success : true,
            code : 201,
            data : lesson,
            message : "lesson added successfully",
        })
    }catch(err){
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
