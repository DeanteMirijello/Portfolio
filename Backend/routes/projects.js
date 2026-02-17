import express from "express";
import { body, validationResult, param } from "express-validator";
import { listProjects, getProject, updateProject, createProject, deleteProject } from "../controllers/projectsController.js";
import { adminOnly } from "../middleware/auth.js";

const router = express.Router();
const validateId = [
  param("id").isString().matches(/^[a-z0-9-]{2,}$/i).withMessage("Invalid project id"),
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

router.put("/:id", adminOnly, [...validateId, ...validatePayload], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return updateProject(req, res, next);
});

router.post("/", adminOnly, [
  body("id").isString().matches(/^[a-z0-9-]{2,}$/i).withMessage("Invalid id"),
  ...validatePayload,
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return createProject(req, res, next);
});

router.delete("/:id", adminOnly, validateId, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return deleteProject(req, res, next);
});

export default router;
