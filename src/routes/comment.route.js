import { Router } from "express";
import { jwtVerify } from "../middleware/auth.middleware.js";
import {
  addComment,
  deleteComment,
  editComment,
  getCommentsOnProjectAggregatePaginate,
} from "../controllers/comment.controller.js";
const commentRouter = Router();

commentRouter
  .route("/project/:projectId")
  .post(jwtVerify, addComment)
  .get(getCommentsOnProjectAggregatePaginate);
commentRouter.route("/edit/:commentId").patch(jwtVerify, editComment);
commentRouter.route("/delete/:commentId").delete(jwtVerify, deleteComment);

export { commentRouter };
