import { Router } from "express";
import { jwtVerify } from "../middleware/auth.middleware.js";
import {
  voteProject,
  getProjectVotes,
} from "../controllers/vote.controller.js";

const voteRouter = new Router();

voteRouter.use(jwtVerify);
voteRouter.route("/project/:projectId").post(voteProject).get(getProjectVotes);
voteRouter.post("/comment/:commentId");

export { voteRouter };
