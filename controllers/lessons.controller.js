const lessonsService = require("../services/lessons.service")


const addLessons = async(req, res)=>{
    const payload = req.body
    console.log(payload)
    const response = await lessonsService.addLessons(payload)

    res.status(response.code).json(response)
}


module.exports = {addLessons}