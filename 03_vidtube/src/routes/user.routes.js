import { Router } from "express"; // Router is a class in express that allows you to create modular, mountable route handlers.
import { registerUser, loginUser, refreshAccessToken, logoutUser, changeCurrentPassword, getCurrentUser, getUserChannelProfile, updateAccountDetails, updateUseravatar, updateUserCoverImage, getWatchHistory } from "../controllers/user.controller.js"; // Import the healthcheck controller 
import {upload} from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router(); // Create a new Router instance
//unsecured routes
router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1 
        },{
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser); // Define a route for the router

router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)




    //secured routes
    router.route("/logout").post(verifyJWT, logoutUser)
    router.route("/change-password").post(verifyJWT, changeCurrentPassword)
    router.route("/current-user").get(verifyJWT, getCurrentUser)
    router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
    router.route("/update-account").patch(verifyJWT, updateAccountDetails)
    router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUseravatar)
    router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
    router.route("/history").get(verifyJWT, getWatchHistory)

export default router; // Export the router;
