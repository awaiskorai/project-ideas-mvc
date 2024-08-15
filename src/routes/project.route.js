import { Router } from "express";
import { jwtVerify } from "../middleware/auth.middleware.js";
import {
  createProject,
  deleteProject,
  getProject,
  getProjectsAggregatePaginate,
  updateProject,
} from "../controllers/project.controller.js";
// import { checkProjectValidation } from "../middleware/projectValidator.middleware.js";

const projectRouter = new Router();
projectRouter.use(jwtVerify);
projectRouter.route("/create").post(createProject);
projectRouter
  .route("/:id")
  .get(getProject)
  .patch(updateProject)
  .delete(deleteProject);

projectRouter.route("/").get(getProjectsAggregatePaginate);

export { projectRouter };
