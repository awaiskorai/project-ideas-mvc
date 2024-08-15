import { Comment } from "../models/comment.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addComment = asyncHandler(async function (req, res, next) {
  if (!req.user._id)
    throw new APIError(401, "User not logged in. Unauthorized");
  const { projectId: commentProjectId } = req.params;
  if (!commentProjectId)
    throw new APIError(400, "Project ID missing from parameters");

  const { content } = req.body;
  if (content?.length > 1000 || !comment?.length)
    throw new APIError(
      400,
      "Comment's content cannot be empty or longer than 1000 characters"
    );

  const comment = await Comment.create(
    {
      content,
      createdBy: req.user?._id,
      projectID: commentProjectId,
    },
    { new: true }
  );

  res
    .status(200)
    .json(new APIResponse(200, { comment }, "Comment created succesfully"));
});

const editComment = asyncHandler(async function (req, res, next) {
  if (!req.user._id)
    throw new APIError(401, "User not logged in. Unauthorized");
  const { commentId } = req.params;
  if (!commentId) throw new APIError(400, "Comment ID missing from parameters");

  const { content } = req.body;
  if (content?.length > 1000 || !comment?.length)
    throw new APIError(
      400,
      "Comment's content cannot be empty or longer than 1000 characters"
    );

  const comment = await Comment.updateOne(
    {
      _id: commentId,
      content,
      createdBy: req.user?._id,
    },
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  if (!comment) throw new APIError(500, "Could not edit comment");
  res
    .status(200)
    .json(new APIResponse(200, { comment }, "Comment edited succesfully"));
});

const deleteComment = asyncHandler(async function (req, res, next) {
  if (!req.user._id)
    throw new APIError(401, "User not logged in. Unauthorized");
  const { commentId } = req.params;
  if (!commentId) throw new APIError(400, "Comment Id missing from parameters");

  const commentToDelete = await Comment.DeleteOne(
    { _id: commentId, userID: req.user?._id },
    { new: true }
  );

  if (!commentToDelete)
    throw new APIError(500, "Could not delete comment, try again");
  res
    .status(200)
    .json(
      new APIResponse(
        200,
        { commentToDelete, user: req.user?._id },
        "Comment deleted succesfully"
      )
    );
});

const getCommentsOnProject = asyncHandler(async function (req, res, next) {
  const projectId = req.params?.projectId;
  if (!projectId) throw new APIError(400, "Project ID missing");

  const page = Number(req.query?.page);
  const limit = Number(req.query?.limit);

  if (
    [page, limit].some(
      (obj) => obj == undefined || typeof obj != "number" || obj == ""
    )
  )
    throw new APIError("Page limit and size  must be defined in numbers");

  const fetchCommentsForProject = await Comment.find({
    projectID: projectId,
  })

    .skip((page - 1) * limit)
    .limit(limit);

  if (!fetchCommentsForProject)
    new APIError(500, "Could not fetch comments for specified project");

  res
    .status(200)
    .json(
      new APIResponse(
        200,
        { comments: fetchCommentsForProject },
        "Fetched comments successfully"
      )
    );
});

const getCommentsOnProjectAggregatePaginate = asyncHandler(
  async function (req, res, next) {
    const projectId = req.params?.projectId;
    if (!projectId) throw new APIError(400, "Project ID parameter missing");
    const limit = Number(req.query?.limit);
    const page = Number(req.query?.page);

    if (
      [limit, page].some(
        (obj) =>
          obj == "" || obj == undefined || typeof obj != "number" || isNaN(obj)
      )
    )
      throw new APIError(
        400,
        "Page and Limit query parameters cannot be empty, must be in numbers"
      );

    let paginatedComments = Comment.aggregate([
      {
        $facet: {
          metaData: [
            { $count: "totalComments" },
            {
              $addFields: {
                page,
                limit,
                $ceil: { $divide: ["$totalComments", limit] },
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

    res
      .status(200)
      .json(
        new APIResponse(200, paginatedComments, "Comments fetched Succesfully")
      );
  }
);

export {
  editComment,
  addComment,
  deleteComment,
  getCommentsOnProjectAggregatePaginate,
};
