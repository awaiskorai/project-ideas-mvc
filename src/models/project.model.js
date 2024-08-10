import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      required: true,
      type: String,
    },
    description: {
      required: true,
      type: String,
    },
    problemDomain: [{ type: String, required: true }],
    industry: [{ type: String, required: true }],
    duration: {
      type: Number,
      required: true,
    },
    targetAudience: [{ type: String, required: true }],
    technologies: [{ type: String, required: true }],
    skillsNeeded: [{ type: String, required: true }],
    goals: [{ type: String, required: true }],
    budgetEstimate: { type: Number, required: true },
    scope: { type: String, required: true },
    techLanguage: {
      type: String,
    },
    database: {
      type: String,
    },
    rank: { type: Number, default: 0 },
    votes: { type: Number, default: 0 },
    milestones: [{ type: String }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);
