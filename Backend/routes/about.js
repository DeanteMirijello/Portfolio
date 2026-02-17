import { Router } from "express";
import { getWork, updateWork, getSchool, updateSchool } from "../controllers/aboutController.js";
import { adminOnly } from "../middleware/auth.js";

const router = Router();

router.get("/work", getWork);
router.put("/work", adminOnly, updateWork);
router.get("/school", getSchool);
router.put("/school", adminOnly, updateSchool);

export default router;
