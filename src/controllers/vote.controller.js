// import { Vote } from "../models/vote.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toggleVote, getTotalVotes } from "../services/vote.service.js";

const voteProject = asyncHandler(async function (req, res, next) {
  if (!req.user?._id)
    throw new APIError(401, "User not logged in unauthorized");

  const projectID = req.params?.projectId;
  if (!projectID) throw new APIError(404, "Project ID param missing");

  const { voteType } = req.body;

  const vote = await toggleVote(projectID, voteType, req?.user?._id);

  res.status(200).json(new APIResponse(200, vote, "Vote Successfull"));
});

const getProjectVotes = asyncHandler(async function (req, res, next) {
  if (!req?.user._id) throw new APIError(401, "User not logged in");
  const { projectId: projectID } = req.params;

  if (!projectID) throw new APIError(400, "Project ID parameter missing");

  const totalVoteAggregate = await getTotalVotes(projectID);

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
