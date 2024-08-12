import mongoose from "mongoose";
import { Vote } from "../models/vote.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const voteProject = asyncHandler(async function (req, res, next) {
  if (!req.user?._id)
    throw new APIError(401, "User not logged in unauthorized");

  const projectID = req.params?.projectId;
  if (!projectID) throw new APIError(404, "Project ID param missing");

  const { voteType } = req.body;

  const vote = await Vote.updateOne(
    { projectID, userID: req.user?._id },
    [
      {
        $set: {
          active: {
            $cond: {
              if: {
                $and: [
                  { $eq: ["$active", true] },
                  { $eq: ["$voteType", voteType] },
                ],
              },
              then: false,
              else: true,
            },
          },
          voteType,
        },
      },
    ],
    { upsert: true }
  );

  res.status(200).json(new APIResponse(200, vote, "Vote Successfull"));
});

const getProjectVotes = asyncHandler(async function (req, res, next) {
  if (!req?.user._id) throw new APIError(401, "User not logged in");
  const { projectId: projectID } = req.params;

  if (!projectID) throw new APIError(400, "Project ID parameter missing");

  const totalVoteAggregate = await Vote.aggregate([
    {
      $match: {
        active: true,
        projectID: new mongoose.Types.ObjectId(projectID),
      },
    },
    {
      $group: {
        _id: null,
        upvotes: {
          $sum: {
            $cond: { if: { $eq: ["$voteType", "upvote"] }, then: 1, else: 0 },
          },
        },
        downvotes: {
          $sum: {
            $cond: { if: { $eq: ["$voteType", "downvote"] }, then: 1, else: 0 },
          },
        },
      },
    },
    { $project: { total: { $subtract: ["$upvotes", "$downvotes"] } } },
  ]);

  if (!totalVoteAggregate)
    throw new APIError(
      400,
      "Could not find the project with likes and dislikes"
    );
  const votes = totalVoteAggregate?.[0]?.total;
  console.log(votes);
  res
    .status(200)
    .json(
      new APIResponse(200, { votes: votes || 0 }, "Votes Fetched Succesfully")
    );
});

export { voteProject, getProjectVotes };
