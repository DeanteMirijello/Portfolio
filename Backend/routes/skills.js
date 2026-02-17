import express from "express";
import { body, validationResult } from "express-validator";
import { getSkills, addSkillItem, updateSkillItem, deleteSkillItem, addSkillType, renameSkillType, deleteSkillType, getSkillTitles, updateSkillTypeTitles } from "../controllers/skillsController.js";
import { adminOnly } from "../middleware/auth.js";

const router = express.Router();

const categoryValidator = body("category").isString().trim().notEmpty().withMessage("category is required");

router.get("/", (req, res, next) => getSkills(req, res, next));
router.get("/titles", (req, res, next) => getSkillTitles(req, res, next));

router.post("/items", adminOnly, [categoryValidator, body("value").trim().isLength({ min: 1 })], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return addSkillItem(req, res, next);
});

router.put("/items", adminOnly, [categoryValidator, body("oldValue").trim().isLength({ min: 1 }), body("newValue").trim().isLength({ min: 1 })], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return updateSkillItem(req, res, next);
});

router.delete("/items", adminOnly, [categoryValidator, body("value").trim().isLength({ min: 1 })], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return deleteSkillItem(req, res, next);
});

// Skill types management
router.post("/types", adminOnly, [body("name").isString().trim().notEmpty().withMessage("name is required")], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return addSkillType(req, res, next);
});

router.put("/types/:name", adminOnly, [body("newName").isString().trim().notEmpty().withMessage("newName is required")], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return renameSkillType(req, res, next);
});

router.put("/types/:name/titles", adminOnly, [
  body("en").isString().trim().optional({ nullable: true }),
  body("fr").isString().trim().optional({ nullable: true }),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return updateSkillTypeTitles(req, res, next);
});

router.delete("/types/:name", adminOnly, (req, res, next) => deleteSkillType(req, res, next));

export default router;