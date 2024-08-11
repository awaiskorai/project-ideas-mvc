// import { asyncHandler } from "../utils/asyncHandler";
//checking other ways of validation
function checkProjectValidation(req, _, next) {
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
    duration &&
    budgetEstimate &&
    [duration, budgetEstimate].some((obj) => {
      return !(typeof obj === "number");
    })
  )
    throw new APIError(400, "Duration and budget estimate must be numbers");

  req.projectValidation = true;

  next();
}

export { checkProjectValidation };
