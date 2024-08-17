import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { asyncHandlerService } from "../utils/asyncHandler.js";

const getCommentsOnProjectAggregatePaginateQuery = asyncHandlerService(
  async function (projectId, page, limit) {
    let paginatedComments = await Comment.aggregate([
      { $match: { projectID: new mongoose.Types.ObjectId(projectId) } },
      {
        $facet: {
          metaData: [
            { $count: "totalComments" },
            {
              $addFields: {
                pages: { $ceil: { $divide: ["$totalComments", limit] } },
                limit,
                page,
              },
            },
          ],
          pageResults: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ]);

    paginatedComments = paginatedComments[0];
    paginatedComments.metaData = {
      ...paginatedComments.metaData[0],
      count: paginatedComments.pageResults.length,
    };

    return paginatedComments;
  }
);

export { getCommentsOnProjectAggregatePaginateQuery };
