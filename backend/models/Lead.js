import mongoose from "mongoose";

export const PIPELINE_STAGES = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Won",
  "Lost",
];

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Lead name is mandatory"],
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    serviceInterest: {
      type: String,
      trim: true,
      default: "General CRM",
    },
    source: {
      type: String,
      trim: true,
      default: "Direct",
    },
    budget: {
      type: Number,
      min: [0, "Budget cannot be negative"],
      default: 0,
    },
    stage: {
      type: String,
      enum: {
        values: PIPELINE_STAGES,
        message: "{VALUE} is not a valid pipeline stage",
      },
      default: "New",
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

leadSchema.pre("validate", function () {
  if (!this.email && !this.phone) {
    this.invalidate("email", "At least one of email or phone must be provided.");
  }
});

export const Lead = mongoose.model("Lead", leadSchema);
