const lessonsService = require("../services/lessons.service")


const addLesson = async(req, res)=>{
    const payload = req.body
    console.log(payload)
    const response = await lessonsService.addLesson(payload)

    res.status(response.code).json(response)
}

const editLesson = async(req, res)=>{
    const payload = req.body;
    const id = req.params.id
    const response = await lessonsService.editLesson(payload, id)
    res.status(response.code).json(response)
}

const deleteLesson = async(req, res) =>{
    const id = req.params.id;
    const response = await lessonsService.deleteLesson(id);
    res.status(response.code).json(response)
}

const getAllLessons = async(req, res) =>{
    const user = req.user
    const skip = parseInt(req.query.skip) || 0; 
    console.log("skipping :", skip)
    console.log(user)
    const response = await lessonsService.getAllLessons({language : user.language}, skip);
    res.status(response.code).json(response)
}

module.exports = {
    addLesson, 
    editLesson,
    deleteLesson,
    getAllLessons
}