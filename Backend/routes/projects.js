import express from "express";
import { body, validationResult, param } from "express-validator";
import { listProjects, getProject, updateProject } from "../controllers/projectsController.js";

const router = express.Router();
const PROJECT_IDS = ["dm", "pet", "iot", "bowling"];

const validateId = [
  param("id").isString().custom((v) => PROJECT_IDS.includes(v)).withMessage("Invalid project id"),
];

const validatePayload = [
  body("image").optional().isString().trim(),
  body("en").optional().isObject(),
  body("fr").optional().isObject(),
  body("en.title").optional().isString().trim(),
  body("en.date").optional().isString().trim(),
  body("en.desc").optional().isString().trim(),
  body("fr.title").optional().isString().trim(),
  body("fr.date").optional().isString().trim(),
  body("fr.desc").optional().isString().trim(),
];

router.get("/", (req, res, next) => listProjects(req, res, next));
router.get("/:id", validateId, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return getProject(req, res, next);
});

router.put("/:id", [...validateId, ...validatePayload], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return updateProject(req, res, next);
});

export default router;
