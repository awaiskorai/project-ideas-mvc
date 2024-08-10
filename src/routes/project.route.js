import { Router } from "express";
import { jwtVerify } from "../middleware/auth.middleware.js";
import {
  createProject,
  getProject,
} from "../controllers/project.controller.js";
const projectRouter = new Router();

projectRouter.route("/create").post(jwtVerify, createProject);
projectRouter.route("/:id").get(getProject);

export { projectRouter };
