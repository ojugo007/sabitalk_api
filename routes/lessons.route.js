const express = require("express")
const lessonsController = require("../controllers/lessons.controller")
const isAdmin = require("../middleware/admin.middleware")
const validateToken = require("../middleware/auth.middleware")


const lessonsRoute = express.Router()

lessonsRoute.get("/" , validateToken, lessonsController.getAllLessons)
lessonsRoute.post("/add-lesson", isAdmin, lessonsController.addLesson )
lessonsRoute.put("/edit-lesson/:id", isAdmin, lessonsController.editLesson )
lessonsRoute.delete("/delete-lesson/:id", isAdmin, lessonsController.deleteLesson)
 

module.exports = lessonsRoute