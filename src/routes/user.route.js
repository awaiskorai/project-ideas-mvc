import { Router } from "express";
import { loginUser, registerUser, logoutUser } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { jwtVerify } from "../middleware/auth.middleware.js";

const userRouter = new Router();

const avatarAndCoverUpload = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
]);

userRouter.route("/register").post(avatarAndCoverUpload, registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(jwtVerify, logoutUser);

export { userRouter };
