import userController from "../controllers/user.controller.js";
import { Router } from "express";
import {multerUpload} from "../middlewares/multer.middleware.js"


const router = Router();

router.route("/register").post(
   multerUpload.fields(
    [
        {
            name: "avatar",
            maxCount : 1
        },
        {
            name: "coverImage",
            maxCount : 1
        }
    ]
   ),
    userController
)

export default router;