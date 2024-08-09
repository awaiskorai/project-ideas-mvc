import { Router } from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  regenerateExpiredAccessToken,
  updatePassword,
  updateUsername,
  updateAvatar,
  updateCoverImage,
  updateUserDetails,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { jwtVerify } from "../middleware/auth.middleware.js";

const userRouter = new Router();

const avatarAndCoverUpload = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
]);
const avatarUpload = upload.single("avatar");
const coverImageUpload = upload.single("coverImage");

userRouter.route("/register").post(avatarAndCoverUpload, registerUser);
userRouter.route("/login").post(loginUser);
//Secure Routes
userRouter.route("/logout").post(jwtVerify, logoutUser);
userRouter.route("/regen-tokens").post(regenerateExpiredAccessToken);
userRouter.route("/update-password").patch(jwtVerify, updatePassword);
userRouter.route("/update-username").patch(jwtVerify, updateUsername);
userRouter.route("/update-avatar").patch(avatarUpload, jwtVerify, updateAvatar);
userRouter
  .route("/update-cover-image")
  .patch(coverImageUpload, jwtVerify, updateCoverImage);

userRouter.route("/update-user-details").patch(jwtVerify, updateUserDetails);

export { userRouter };
