import { asyncHandler } from "../utils/asyncHandler.js";
import { Project } from "../models/project.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { projectValidation } from "../utils/ValidationChecks.js";
const createProject = asyncHandler(async function (req, res, next) {
  if (!req.user?._id) throw new APIError(`User must be logged in`);
  projectValidation(req.body);
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
    .json(new APIResponse(200, project, "Project fetched succesfully"));
});

const updateProject = asyncHandler(async function (req, res, next) {
  if (!req?.user._id)
    throw new APIError(401, "Unauthorized access to update project");
  const { id } = req.params;
  if (!id) throw new APIError(400, "Could not get project id");

  const proj = Project.findOne({ createdBy: req.user._id, _id: id });
  if (!proj)
    throw new APIError(
      `Could not find the project created by the User: ${req.user?.username}`
    );

  projectValidation(req.body);
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

  const updatedProject = await Project.findByIdAndUpdate(
    { _id: id, createdBy: req.user._id },
    {
      $set: {
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
      },
    },
    { new: true }
  );

  if (!updateProject)
    throw new APIError(500, "Could not update project try again.");
  res
    .status(200)
    .json(
      new APIResponse(
        200,
        { project: updatedProject },
        "Updated project succesfully"
      )
    );
});

const deleteProject = asyncHandler(async function (req, res, next) {
  if (!req.user?._id)
    throw new APIError(401, "User not logged in. Unuathorized");
  const id = req.params?.id;

  if (!id) throw new APIError(400, "Project id not sent");

  const confirmDelete = req.body.confirmDelete;

  if (confirmDelete !== true)
    throw new APIError(401, "Deleting with confirmation flag. Unauthorized");

  const proj = await Project.findByIdAndDelete({ _id: id, createdBy: id });

  console.log(proj);

  if (!proj) throw new APIError(500, "Could not delete the project");

  res
    .status(200)
    .json(
      new APIResponse(
        200,
        { projectDeleted: proj },
        "Succesfully deleted project"
      )
    );
});
export { createProject, getProject, updateProject, deleteProject };
