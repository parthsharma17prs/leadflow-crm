import express from "express";
import multer from "multer";
import {
  getLeads,
  getLeadById,
  createLead,
  uploadLeadsCsv,
  updateLead,
  deleteLead,
} from "../controllers/leadController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { leadCreateSchema, leadUpdateSchema } from "../validators/schemas.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.use(protect);

router.route("/")
  .get(getLeads)
  .post(validate(leadCreateSchema), createLead);

// CSV Upload Route
router.post("/upload", upload.single("file"), uploadLeadsCsv);

router.route("/:id")
  .get(getLeadById)
  .patch(validate(leadUpdateSchema), updateLead)
  .delete(deleteLead);

export default router;
