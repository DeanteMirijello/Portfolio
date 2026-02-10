import { Router } from "express";
import { getWork, updateWork } from "../controllers/aboutController.js";

const router = Router();

router.get("/work", getWork);
router.put("/work", updateWork);

export default router;
