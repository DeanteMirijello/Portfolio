import { Router } from "express";
import { getWork, updateWork } from "../controllers/aboutController.js";
import { adminOnly } from "../middleware/auth.js";

const router = Router();

router.get("/work", getWork);
router.put("/work", adminOnly, updateWork);

export default router;
