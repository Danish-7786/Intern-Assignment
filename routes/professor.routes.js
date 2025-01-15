import {Router} from "express";
import { addAvailableSlot, allBooking, loginProfessor,  manageBooking,  registerProfessor } from "../controllers/professor.controllers.js";
import authMiddleware from "../middleware/auth.middleware.js";
const router = Router();
router.route("/register").post(registerProfessor)
router.route("/login").post(loginProfessor)
router.route("/availability").post(authMiddleware,addAvailableSlot)
router.route("/my-Booking").get(authMiddleware,allBooking)
router.route("/manage-booking/:appointmentId").patch(authMiddleware,manageBooking)
export default router