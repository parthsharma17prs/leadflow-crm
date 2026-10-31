import mongoose from "mongoose";

export const ACTIVITY_TYPES = ["Call", "Email", "Meeting", "Task"];
export const ACTIVITY_STATUSES = ["Pending", "Completed"];

const activitySchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: [true, "Lead reference is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Follow-up title is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ACTIVITY_TYPES,
      default: "Call",
    },
    dueAt: {
      type: Date,
      required: [true, "Due date and time is required"],
    },
    status: {
      type: String,
      enum: ACTIVITY_STATUSES,
      default: "Pending",
    },
    completedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Activity = mongoose.model("Activity", activitySchema);

