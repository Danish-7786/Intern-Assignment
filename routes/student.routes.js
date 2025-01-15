import express from "express"
import { registerStudent,loginStudent, allProfessor, allAvailableSlot, bookSlot, myBookedSlots } from '../controllers/student.controllers.js';
import authMiddleware from "../middleware/auth.middleware.js";
const router = express.Router();

// Login Route
router.route('/login').post(loginStudent);

// Register Route
router.route('/register').post(registerStudent);
router.route("/get-all-professor").get(authMiddleware,allProfessor)
router.route("/get-all-slots/:professorId").get(authMiddleware,allAvailableSlot)
router.route("/book-slot/:professorId/:slotId").post(authMiddleware,bookSlot)
router.route("/my-appointments").get(authMiddleware,myBookedSlots)


export default  router;