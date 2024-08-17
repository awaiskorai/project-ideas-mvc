import { Project } from "../models/project.model.js";
import { asyncHandlerService } from "../utils/asyncHandler.js";

const getProjectsAggregatePaginateQuery = asyncHandlerService(
  async function (page, limit) {
    let projects = await Project.aggregate([
      {
        $facet: {
          metaData: [
            { $count: "totalDocuments" },
            {
              $addFields: {
                pages: { $ceil: { $divide: ["$totalDocuments", limit] } },
                limit,
                page,
              },
            },
          ],
          pageResults: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ]);
    projects = projects?.[0];
    projects.metaData = {
      ...projects?.metaData?.[0],
      count: projects?.pageResults?.length,
    };
    return projects;
  }
);

export { getProjectsAggregatePaginateQuery };
