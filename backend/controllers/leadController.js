import mongoose from "mongoose";
import { Readable } from "stream";
import csvParser from "csv-parser";
import { Lead, PIPELINE_STAGES } from "../models/Lead.js";
import { Activity } from "../models/Activity.js";

export const getLeads = async (req, res, next) => {
  try {
    const { search, stage } = req.query;
    const query = { createdBy: req.user._id };

    if (stage && stage !== "all") {
      query.stage = stage;
    }

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [{ name: searchRegex }, { company: searchRegex }];
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid lead ID format" });
    }

    const lead = await Lead.findOne({ _id: id, createdBy: req.user._id });
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const activities = await Activity.find({ leadId: id, createdBy: req.user._id }).sort({ dueAt: 1 });

    res.status(200).json({
      success: true,
      data: {
        lead,
        activities,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req, res, next) => {
  try {
    const allowed = [
      "name",
      "company",
      "email",
      "phone",
      "serviceInterest",
      "source",
      "budget",
      "stage",
    ];

    const leadData = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        leadData[key] = req.body[key];
      }
    }
    leadData.createdBy = req.user._id;

    const lead = await Lead.create(leadData);

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// BULK UPLOAD LEADS VIA CSV
// ==========================================
export const uploadLeadsCsv = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No CSV file uploaded",
      });
    }

    const results = [];
    const stream = Readable.from(req.file.buffer.toString("utf-8"));

    stream
      .pipe(csvParser())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          const validLeads = [];
          const skipped = [];

          for (const row of results) {
            // Trim keys and values
            const cleanRow = {};
            for (const key of Object.keys(row)) {
              cleanRow[key.trim().toLowerCase()] = row[key]?.trim();
            }

            const name = cleanRow.name;
            const company = cleanRow.company || "";
            const email = cleanRow.email || "";
            const phone = cleanRow.phone || "";
            const serviceInterest = cleanRow.serviceinterest || cleanRow.service || "CRM Implementation";
            const source = cleanRow.source || "CSV Import";
            const budget = Number(cleanRow.budget) >= 0 ? Number(cleanRow.budget) : 0;
            
            // Map stage or default to New
            let stage = cleanRow.stage || "New";
            const matchedStage = PIPELINE_STAGES.find(
              (s) => s.toLowerCase() === stage.toLowerCase()
            );
            stage = matchedStage || "New";

            // Validation rule: Must have name, and at least one of email or phone
            if (name && (email || phone)) {
              validLeads.push({
                name,
                company,
                email,
                phone,
                serviceInterest,
                source,
                budget,
                stage,
                createdBy: req.user._id,
              });
            } else {
              skipped.push(row);
            }
          }

          if (validLeads.length === 0) {
            return res.status(400).json({
              success: false,
              message: "No valid lead rows found in the CSV. Each row requires 'name' and at least 'email' or 'phone'.",
            });
          }

          // Insert all into MongoDB Atlas in bulk
          const inserted = await Lead.insertMany(validLeads);

          return res.status(201).json({
            success: true,
            message: `Successfully imported ${inserted.length} leads!`,
            count: inserted.length,
            skippedCount: skipped.length,
            data: inserted,
          });
        } catch (insertError) {
          next(insertError);
        }
      })
      .on("error", (err) => {
        return res.status(400).json({
          success: false,
          message: "Error parsing CSV file: " + err.message,
        });
      });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid lead ID format" });
    }

    const allowed = [
      "name",
      "company",
      "email",
      "phone",
      "serviceInterest",
      "source",
      "budget",
      "stage",
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid lead ID format" });
    }

    const lead = await Lead.findOneAndDelete({ _id: id, createdBy: req.user._id });
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    // Cascade delete associated activities
    await Activity.deleteMany({ leadId: id, createdBy: req.user._id });

    res.status(200).json({
      success: true,
      message: "Lead and associated follow-ups deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
