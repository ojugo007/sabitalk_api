const express = require("express")
const lessonsController = require("../controllers/lessons.controller")
const isAdmin = require("../middleware/admin.middleware")

const lessonsRoute = express.Router()

lessonsRoute.post("/add-lesson", isAdmin, lessonsController.addLessons )


module.exports = lessonsRoute