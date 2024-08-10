import { asyncHandler } from "../utils/asyncHandler.js";
import { Project } from "../models/project.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
const createProject = asyncHandler(async function (req, res, next) {
  if (!req.user?._id) throw new APIError(`User must be logged in`);
  const {
    title,
    description,
    problemDomain,
    industry,
    duration,
    targetAudience,
    technologies,
    skillsNeeded,
    goals,
    budgetEstimate,
    scope,
    techLanguage,
    database,
    milestones,
  } = req.body;

  if (
    [title, description, scope].some((obj) => {
      return obj == "" || obj == undefined;
    })
  )
    throw new APIError(400, "Mandatory fields cannot be left empty");

  if (
    [
      problemDomain,
      industry,
      targetAudience,
      technologies,
      skillsNeeded,
      goals,
    ].some((obj) => {
      return (
        !obj?.length || obj == "" || obj == undefined || !(obj instanceof Array)
      );
    })
  )
    throw new APIError(400, "Expected array with stringified elements");

  if (
    [duration, budgetEstimate].some((obj) => {
      return !(typeof obj === "number");
    })
  )
    throw new APIError(400, "Duration and budget estimate must be numbers");

  const project = await Project.create({
    title,
    description,
    problemDomain,
    industry,
    duration,
    targetAudience,
    technologies,
    skillsNeeded,
    goals,
    budgetEstimate,
    scope,
    techLanguage: techLanguage || "",
    database: database || "",
    milestones: milestones || [],
    createdBy: req.user?._id,
  });

  if (!project) throw new APIError(500, "Project insertion failed");

  res
    .status(200)
    .json(new APIResponse(200, project, "Project created successfully"));
});

const getProject = asyncHandler(async function (req, res, next) {
  const { id } = req.params;
  if (!id) throw new APIError(400, "No project id  params");

  const project = await Project.findById(id);

  res
    .status(200)
    .json(new APIResponse(200, project, "Project created succesfully"));
});
export { createProject, getProject };
