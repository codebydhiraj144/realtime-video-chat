import {Router} from "express"
import { addToHistory, getUserHistory, login, register } from "../controllers/user.controllers.js"
const router = Router();

// Authentication routes
router.route("/login").post(login)
router.route("/register").post(register)

// User activity and meeting history routes
router.route("/add_to_activity").post(addToHistory)
router.route("/get_all_activity").get(getUserHistory)

export default router;