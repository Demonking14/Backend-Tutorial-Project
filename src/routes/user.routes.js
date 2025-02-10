import userController from "../controllers/user.controller.js";
import { Router } from "express";

const router = Router();

router.route("/register").post(userController)

export default router;