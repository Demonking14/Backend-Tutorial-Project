import { Router } from "express";
import { multerUpload } from "../middlewares/multer.middleware.js";
import { verifyUser } from '../middlewares/auth.middleware.js';
import { userController, LoginUser, LogoutUser , newRefreshAndAccessToken, UpdatePassword, UpdateUserInformation, UpdateAvatar, UpdateCoverImage, ChannelInformations, getWatchHistory } from "../controllers/user.controller.js";

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
router.route("/refresh-token").post(newRefreshAndAccessToken)

router.route("/password_update").post(verifyUser , UpdatePassword)

router.route("/user_info").patch(verifyUser , UpdateUserInformation)

router.route("/avatar").patch(verifyUser , multerUpload , UpdateAvatar)

router.route("/coverImage").patch(verifyUser , multerUpload , UpdateCoverImage)

router.route("/c/:username").get(verifyUser , ChannelInformations)

router.route("/WatchHistory").get(verifyUser , getWatchHistory)

export default router;