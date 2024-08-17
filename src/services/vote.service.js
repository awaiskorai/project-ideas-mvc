import { asyncHandlerService } from "../utils/asyncHandler.js";
import { Vote } from "../models/vote.model.js";
import mongoose from "mongoose";

const getTotalVotes = asyncHandlerService(async function (projectID) {
  return await Vote.aggregate([
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
});

const toggleVote = asyncHandlerService(
  async function (projectID, voteType, userID) {
    return await Vote.updateOne(
      { projectID, userID },
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
  }
);
export { getTotalVotes, toggleVote };
