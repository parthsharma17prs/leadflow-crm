import express from "express";
import {
  getActivities,
  createActivity,
  updateActivity,
} from "../controllers/activityController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  activityCreateSchema,
  activityUpdateSchema,
} from "../validators/schemas.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getActivities)
  .post(validate(activityCreateSchema), createActivity);

router.route("/:id")
  .patch(validate(activityUpdateSchema), updateActivity);

export default router;

