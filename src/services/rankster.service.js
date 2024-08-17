import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { APIError } from "../utils/APIError.js";
import { asyncHandlerService } from "../utils/asyncHandler.js";
import { Vote } from "../models/vote.model.js";
import { getTotalVotes } from "./vote.service.js";

const uniqueCommentsQuantifier = asyncHandlerService(
  async function (projectID) {
    if (
      projectId == undefined ||
      projectID == "" ||
      typeof projectID != "string"
    )
      throw new APIError(500, "Project ID Missing");

    const uniqueComments = await Comment.distinct("createdBy", {
      projectID: projectId,
    }).length;

    //   Comment.aggregate([
    //     { $match: { projectID: ObjectId("66b6b74220fe43d0e84b500c") } },
    //     { $group: { _id: "$createdBy", count: { $sum: 1 } } },
    //     { $group: { _id: "$_id", uniqueComments: { $sum: 1 } } },
    //   ]);
    return uniqueComments;
  }
);
const votesQuantifier = asyncHandlerService(async function (projectID) {
  if (projectId == undefined || projectID == "" || typeof projectID != "string")
    throw new APIError(500, "Project ID Missing");

  const totalVoteAggregate = await getTotalVotes(projectID);

  return totalVoteAggregate?.[0]?.total || 0;
});
