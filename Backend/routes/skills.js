import express from "express";
import { body, validationResult } from "express-validator";
import { getSkills, addSkillItem, updateSkillItem, deleteSkillItem } from "../controllers/skillsController.js";

const router = express.Router();

const categories = ["languages", "frameworks", "databases", "design"];

const categoryValidator = body("category")
  .isString()
  .custom((v) => categories.includes(v))
  .withMessage("Invalid category");

router.get("/", (req, res, next) => getSkills(req, res, next));

router.post("/items", [categoryValidator, body("value").trim().isLength({ min: 1 })], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return addSkillItem(req, res, next);
});

router.put("/items", [categoryValidator, body("oldValue").trim().isLength({ min: 1 }), body("newValue").trim().isLength({ min: 1 })], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return updateSkillItem(req, res, next);
});

router.delete("/items", [categoryValidator, body("value").trim().isLength({ min: 1 })], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return deleteSkillItem(req, res, next);
});

export default router;