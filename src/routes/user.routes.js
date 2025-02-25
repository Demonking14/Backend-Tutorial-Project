import { Router } from "express";
import { multerUpload } from "../middlewares/multer.middleware.js";
import { verifyUser } from '../middlewares/auth.middleware.js';
import { userController, LoginUser, LogoutUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(
    multerUpload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    userController
);

router.route("/login").post(LoginUser);

router.route("/logout").post(
    verifyUser,
    LogoutUser
);

export default router;