import mongoose from "mongoose";
import { Activity } from "../models/Activity.js";
import { Lead } from "../models/Lead.js";

export const getActivities = async (req, res, next) => {
  try {
    const { status, leadId } = req.query;
    const query = { createdBy: req.user._id };

    if (status && status !== "all") {
      query.status = status;
    }

    if (leadId) {
      if (!mongoose.Types.ObjectId.isValid(leadId)) {
        return res.status(400).json({ success: false, message: "Invalid lead ID format" });
      }
      query.leadId = leadId;
    }

    const activities = await Activity.find(query)
      .populate("leadId", "name company email phone stage")
      .sort({ dueAt: 1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

export const createActivity = async (req, res, next) => {
  try {
    const { leadId, title, type, dueAt, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({ success: false, message: "Invalid lead ID format" });
    }

    // Verify lead exists and belongs to user
    const lead = await Lead.findOne({ _id: leadId, createdBy: req.user._id });
    if (!lead) {
      return res.status(404).json({ success: false, message: "Associated lead not found or inaccessible" });
    }

    const activity = await Activity.create({
      leadId,
      title,
      type: type || "Call",
      dueAt: new Date(dueAt),
      status: status || "Pending",
      completedAt: status === "Completed" ? new Date() : null,
      createdBy: req.user._id,
    });

    const populated = await Activity.findById(activity._id).populate("leadId", "name company email phone stage");

    res.status(201).json({
      success: true,
      message: "Follow-up created successfully",
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid activity ID format" });
    }

    const allowed = ["title", "type", "dueAt", "status"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (updates.status === "Completed") {
      updates.completedAt = new Date();
    } else if (updates.status === "Pending") {
      updates.completedAt = null;
    }

    if (updates.dueAt) {
      updates.dueAt = new Date(updates.dueAt);
    }

    const activity = await Activity.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("leadId", "name company email phone stage");

    if (!activity) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }

    res.status(200).json({
      success: true,
      message: "Follow-up updated successfully",
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

