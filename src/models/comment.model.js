import mongoose, { Schema } from "mongoose";
const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    projectID: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    votes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);
