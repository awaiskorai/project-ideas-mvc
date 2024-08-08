import mongoose, { Schema } from "mongoose";

const teamSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  teamHead: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    unique: true,
  },
});

export const Team = mongoose.model("Team", teamSchema);
