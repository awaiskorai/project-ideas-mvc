import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    voteType: {
      type: String,
      enum: ["upvote", "downvote"],

      required: true,
    },
    projectID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    commentID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Vote = mongoose.model("Vote", voteSchema);
