import { APIError } from "./APIError.js";

const maxLength = function (data, maxLength, propertyName, status = 400) {
  if (data?.length > maxLength)
    throw new APIError(
      status,
      `${propertyName} cannot be more than: ${maxLength} characters`
    );
};

const minLength = function (data, minLength, propertyName, status = 400) {
  if (data?.length < minLength)
    throw new APIError(
      status,
      `${propertyName} cannot less than: ${minLength} characters`
    );
};

const minMaxLength = function (
  data,
  minLength,
  maxLength,
  propertyName,
  status = 400
) {
  if (data?.length < minLength && data?.length > maxLength)
    throw new APIError(
      status,
      `${propertyName} can have only: ${minLength}-${maxLength} characters`
    );
};

const stringArrayHasEmptyValue = function (
  data,
  propertyNames = [],
  status = 400
) {
  if (!(data instanceof Array))
    throw new APIError(
      status,
      `${propertyNames.join(",")} must be sent as an Array `
    );
  if (
    data?.some((obj) => {
      return obj == "" || obj == undefined || typeof obj != "string";
    })
  ) {
    throw new APIError(
      status,
      `${propertyNames.join(",")} must be non empty string values`
    );
  }
};

const arrayHasEmptyValue = function (data, propertyNames, status = 400) {
  if (!(data instanceof Array))
    throw new APIError(
      status,
      `${propertyNames.join(",")} must be sent as an Array `
    );
  if (
    data?.some((obj) => {
      return (
        !obj?.length || obj == "" || obj == undefined || !(obj instanceof Array)
      );
    })
  ) {
    throw new APIError(
      status,
      `${propertyNames.join(",")} must be non empty array values `
    );
  }
};

const checkTypeOfValues = function (
  data,
  propertyNames,
  type = "",
  status = 400
) {
  if (
    data?.some((obj) => {
      return !(typeof obj === `${type}`);
    })
  )
    throw new APIError(status, `${propertyNames}  must be of type ${type}`);
};

const isStringEmpty = function (data, propertyName, status = 400) {
  if (data === "" || data == undefined || data == null)
    throw new APIError(status, `${propertyName} cannot be an empty string`);
};

const projectValidation = function (data) {
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
  } = data;

  stringArrayHasEmptyValue(
    [title, description, scope],
    ["title", "description", "scope"]
  );

  minLength(title, 3, "title", 400);
  minLength(description, 15, "description", 400);
  minLength(scope, 15, "scope", 400);

  arrayHasEmptyValue(
    [
      problemDomain,
      industry,
      targetAudience,
      technologies,
      skillsNeeded,
      goals,
    ],
    [
      "problemDomain",
      "industry",
      "targetAudience",
      "technologies",
      "skillsNeeded",
      "goals",
    ]
  );

  checkTypeOfValues(
    [duration, budgetEstimate],
    ["duration", "budgetEstimate"],
    "number",
    400
  );

  if (techLanguage) {
    isStringEmpty(techLanguage);
  }
  if (database) {
    isStringEmpty(database);
  }
  if (milestones) {
    stringArrayHasEmptyValue(milestones);
  }

  return true;
};

export { projectValidation };
