import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    voteType: {
      type: String,
      enum: ["upvote,downvote"],
      default: "upvote",
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
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Vote = mongoose.model("Vote", voteSchema);
